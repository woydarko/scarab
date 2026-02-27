import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { judgeIssue } from '@/lib/judge'
import { payBounty } from '@/lib/payout'
import { Octokit } from '@octokit/rest'
import crypto from 'crypto'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

function verifySignature(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

async function commentOnIssue(repoUrl: string, issueNumber: number, body: string) {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) return
    const owner = match[1]
    const repo = match[2].replace('.git', '')
    await octokit.issues.createComment({ owner, repo, issue_number: issueNumber, body })
    console.log('Commented on issue #' + issueNumber)
  } catch (e) {
    console.error('Comment error:', e)
  }
}

async function closeIssueWithLabel(repoUrl: string, issueNumber: number, label: string) {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) return
    const owner = match[1]
    const repo = match[2].replace('.git', '')

    // buat label kalau belum ada
    try {
      await octokit.issues.createLabel({
        owner, repo,
        name: label,
        color: label === 'bounty-paid' ? '6aaa5a' : 'C70039',
        description: label === 'bounty-paid' ? 'Bug bounty paid via Scarab' : 'Bug report rejected by Scarab AI',
      })
    } catch {}

    // tambah label
    await octokit.issues.addLabels({ owner, repo, issue_number: issueNumber, labels: [label] })

    // close issue kalau paid
    if (label === 'bounty-paid') {
      await octokit.issues.update({ owner, repo, issue_number: issueNumber, state: 'closed' })
    }
  } catch (e) {
    console.error('closeIssue error:', e)
  }
}

async function checkDuplicate(repoId: string, title: string): Promise<string | null> {
  // cari submission paid dengan judul mirip di repo yang sama
  const existing = await prisma.submission.findMany({
    where: { repoId, status: { in: ['paid', 'judging', 'paying'] } },
    select: { issueTitle: true, githubIssueId: true },
  })

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  const titleNorm = normalize(title)

  for (const sub of existing) {
    const existNorm = normalize(sub.issueTitle)
    // cek apakah 60% kata sama
    const wordsA = titleNorm.split(' ').filter(Boolean)
    const wordsB = existNorm.split(' ').filter(Boolean)
    const common = wordsA.filter(w => wordsB.includes(w))
    const similarity = common.length / Math.max(wordsA.length, wordsB.length)
    if (similarity >= 0.6) return sub.issueTitle
  }
  return null
}

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('x-hub-signature-256') || ''
  const event = req.headers.get('x-github-event')

  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (secret && signature) {
    if (!verifySignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const body = JSON.parse(payload)

  if (event !== 'issues' || body.action !== 'opened') {
    return NextResponse.json({ message: 'Ignored' }, { status: 200 })
  }

  const issue = body.issue
  const repoUrl = body.repository.html_url

  const repo = await prisma.repo.findUnique({
    where: { githubRepoUrl: repoUrl },
  })

  if (!repo) {
    return NextResponse.json({ error: 'Repo not registered' }, { status: 404 })
  }

  const walletMatch = issue.body?.match(/Wallet:\s*(0x[a-fA-F0-9]{40})/)
  if (!walletMatch) {
    await commentOnIssue(repoUrl, issue.number,
      '## Scarab Bug Bounty\n\n' +
      '> **Missing wallet address**\n\n' +
      'Your issue was not submitted for bounty review because no wallet address was found.\n\n' +
      'Please include your Base wallet address in the issue body:\n\n' +
      '```\nWallet: 0xYourWalletAddress\n```'
    )
    return NextResponse.json({ error: 'No wallet address found in issue' }, { status: 400 })
  }

  const submitterWallet = walletMatch[1]

  // cek duplicate
  const duplicateOf = await checkDuplicate(repo.id, issue.title)
  if (duplicateOf) {
    await commentOnIssue(repoUrl, issue.number,
      '## Scarab Bug Bounty\n\n' +
      '> **Duplicate bug report**\n\n' +
      'This bug has already been reported and verified:\n\n' +
      '> *' + duplicateOf + '*\n\n' +
      'Please search for existing issues before submitting. Find a different bug to earn your bounty!'
    )
    return NextResponse.json({ error: 'Duplicate bug report' }, { status: 409 })
  }

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

  // comment bahwa submission diterima
  await commentOnIssue(repoUrl, issue.number,
    '## Scarab Bug Bounty\n\n' +
    '> **Submission received** — AI is reviewing your bug report...\n\n' +
    '| Field | Value |\n' +
    '|-------|-------|\n' +
    '| Status | Judging |\n' +
    '| Wallet | `' + submitterWallet.slice(0, 8) + '...' + submitterWallet.slice(-6) + '` |\n\n' +
    '*You will receive another comment once the review is complete.*'
  )

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

    // close issue + label HANYA kalau payment success
    if (tx.success) {
      await closeIssueWithLabel(repoUrl, issue.number, 'bounty-paid')
    }

    // comment paid
    await commentOnIssue(repoUrl, issue.number,
      '## Scarab Bug Bounty\n\n' +
      '> **Valid bug — Bounty paid!**\n\n' +
      '| Field | Value |\n' +
      '|-------|-------|\n' +
      '| Verdict | Valid |\n' +
      '| Severity | ' + (result.severity || 'low') + ' |\n' +
      '| Bounty | $' + result.bountyAmount + ' USDC |\n' +
      '| Transaction | [`' + (tx.txHash || '').slice(0, 12) + '...`](https://basescan.org/tx/' + tx.txHash + ') |\n\n' +
      '*' + result.reason + '*\n\n' +
      'USDC has been sent to your wallet on Base mainnet.'
    )
  } else {
    // label rejected
    await closeIssueWithLabel(repoUrl, issue.number, 'bounty-invalid')


    // comment rejected
    await commentOnIssue(repoUrl, issue.number,
      '## Scarab Bug Bounty\n\n' +
      '> **Bug report rejected**\n\n' +
      'Our AI reviewed your bug report against the source code and could not verify it.\n\n' +
      '**Reason:** ' + result.reason + '\n\n' +
      'Tips for a successful submission:\n' +
      '- Include clear steps to reproduce\n' +
      '- Describe expected vs actual behavior\n' +
      '- Make sure the bug exists in the current codebase'
    )
  }
}
