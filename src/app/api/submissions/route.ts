import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      repo: true,
    },
  })

  return NextResponse.json(submissions)
}
