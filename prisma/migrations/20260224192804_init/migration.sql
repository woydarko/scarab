-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "githubRepoUrl" TEXT NOT NULL,
    "ownerWallet" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repoId" TEXT NOT NULL,
    "githubIssueId" TEXT NOT NULL,
    "issueTitle" TEXT NOT NULL,
    "issueBody" TEXT NOT NULL,
    "submitterWallet" TEXT NOT NULL,
    "verdict" TEXT,
    "severity" TEXT,
    "bountyAmount" REAL,
    "txHash" TEXT,
    "aiReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Repo_githubRepoUrl_key" ON "Repo"("githubRepoUrl");
