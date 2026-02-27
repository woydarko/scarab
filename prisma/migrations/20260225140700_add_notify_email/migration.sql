-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "githubRepoUrl" TEXT NOT NULL,
    "ownerWallet" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'web',
    "notifyEmail" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Repo" ("category", "createdAt", "description", "githubRepoUrl", "id", "ownerWallet") SELECT "category", "createdAt", "description", "githubRepoUrl", "id", "ownerWallet" FROM "Repo";
DROP TABLE "Repo";
ALTER TABLE "new_Repo" RENAME TO "Repo";
CREATE UNIQUE INDEX "Repo_githubRepoUrl_key" ON "Repo"("githubRepoUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
