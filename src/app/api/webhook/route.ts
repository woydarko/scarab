import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { judgeIssue } from '@/lib/judge'
import { payBounty } from '@/lib/payout'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('x-hub-signature-256') || ''
  const event = req.headers.get('x-github-event')

  // verify webhook secret kalau ada
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (secret && signature) {
    if (!verifySignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const body = JSON.parse(payload)

  // hanya proses event "issues" dengan action "opened"
  if (event !== 'issues' || body.action !== 'opened') {
    return NextResponse.json({ message: 'Ignored' }, { status: 200 })
  }

  const issue = body.issue
  const repoUrl = body.repository.html_url

  // cek apakah repo terdaftar di db kita
  const repo = await prisma.repo.findUnique({
    where: { githubRepoUrl: repoUrl },
  })

  if (!repo) {
    return NextResponse.json({ error: 'Repo not registered' }, { status: 404 })
  }

  // extract wallet address dari body issue
  // format yang diminta: "Wallet: 0x..."
  const walletMatch = issue.body?.match(/Wallet:\s*(0x[a-fA-F0-9]{40})/)
  if (!walletMatch) {
    return NextResponse.json({ error: 'No wallet address found in issue' }, { status: 400 })
  }

  const submitterWallet = walletMatch[1]

  // simpan submission ke db
  const submission = await prisma.submission.create({
    data: {
      repoId: repo.id,
      githubIssueId: String(issue.number),
      issueTitle: issue.title,
      issueBody: issue.body || '',
      submitterWallet,
      status: 'judging',
    },
  })

  // judge secara async (tidak block response)
  judgeAndPay(submission.id, repo.id, issue, submitterWallet, repo.githubRepoUrl).catch(console.error)

  return NextResponse.json({ message: 'Submission received', id: submission.id }, { status: 200 })
}

async function judgeAndPay(
  submissionId: string,
  repoId: string,
  issue: { title: string; body: string; number: number },
  submitterWallet: string,
  repoUrl: string
) {
  // judge dengan AI
  const result = await judgeIssue(issue.title, issue.body, repoUrl)

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      verdict: result.verdict,
      severity: result.severity,
      bountyAmount: result.bountyAmount,
      aiReason: result.reason,
      status: result.verdict === 'valid' ? 'paying' : 'rejected',
    },
  })

  if (result.verdict === 'valid') {
    const tx = await payBounty(submitterWallet, result.bountyAmount)
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        txHash: tx.txHash,
        status: tx.success ? 'paid' : 'failed',
      },
    })
  }
}
