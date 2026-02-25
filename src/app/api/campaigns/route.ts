import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const repos = await prisma.repo.findMany({
    include: {
      submissions: {
        select: {
          status: true,
          bountyAmount: true,
          severity: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const campaigns = repos.map(repo => {
    const totalPaid = repo.submissions
      .filter(s => s.status === 'paid')
      .reduce((acc, s) => acc + (s.bountyAmount || 0), 0)
    const validBugs = repo.submissions.filter(s => s.status === 'paid').length
    const openBugs = repo.submissions.filter(s => s.status === 'judging' || s.status === 'pending').length
    const highBugs = repo.submissions.filter(s => s.status === 'paid' && s.severity === 'high').length
    const repoName = repo.githubRepoUrl.replace('https://github.com/', '')

    return {
      id: repo.id,
      githubRepoUrl: repo.githubRepoUrl,
      repoName,
      ownerWallet: repo.ownerWallet,
      category: repo.category,
      description: repo.description,
      totalPaid,
      validBugs,
      openBugs,
      highBugs,
      totalSubmissions: repo.submissions.length,
      createdAt: repo.createdAt,
    }
  })

  return NextResponse.json(campaigns)
}
