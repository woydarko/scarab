import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const repos = await prisma.repo.findMany({
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  return NextResponse.json(repos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { githubRepoUrl, ownerWallet } = await req.json()

  if (!githubRepoUrl || !ownerWallet) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(ownerWallet)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
  }

  if (!githubRepoUrl.startsWith("https://github.com/")) {
    return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 })
  }

  try {
    const repo = await prisma.repo.create({
      data: { githubRepoUrl, ownerWallet },
    })
    return NextResponse.json(repo, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Repo already registered" }, { status: 409 })
  }
}
