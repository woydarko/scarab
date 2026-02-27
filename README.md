# 🪲 Scarab — Autonomous Bug Bounty Protocol

> AI-powered bug bounty automation. Every valid bug report gets paid instantly in USDC on Base — no human review, no delays, no friction.

Built for the **PinionOS Hackathon 2026**.

---

## What is Scarab?

Scarab is an autonomous bug bounty protocol that removes the biggest friction in traditional bug bounty programs: **human bottlenecks**.

Today, when a security researcher finds a bug and submits it, they wait. Days. Sometimes weeks. For a human to review it, validate it, approve payment, process it through finance, and finally send money. The researcher has no visibility. The repo owner is overwhelmed. Most small open-source projects can't afford a bug bounty program at all.

**Scarab solves this entirely.**

Connect your GitHub repo. Fund a treasury wallet. Scarab watches for new issues 24/7 — the moment a bug is submitted, our AI reads your actual source code, verifies the bug exists, assigns severity, and sends USDC directly to the hunter's wallet on Base. The whole process takes under 60 seconds. No approvals. No middlemen. Fully on-chain.

---

## The Problem We Solve

### For Open Source Maintainers
- Bug bounty programs are expensive and operationally complex
- Reviewing every submission manually is time-consuming
- Fake and duplicate reports waste hours
- Small projects simply can't afford dedicated security staff

### For Bug Hunters
- Payouts take days or weeks
- No transparency on review status
- Vague rejection reasons
- No trust that payment will actually arrive

### Scarab's Answer
- **Zero setup cost** — no subscription, no platform fee
- **Sub-60 second payouts** — AI judges instantly, blockchain pays instantly
- **Transparent on-chain** — every payment has a tx hash on Base
- **Duplicate prevention** — AI detects and blocks duplicate submissions automatically
- **Source code verification** — AI reads your actual repo, can't be fooled by fake bugs

---

## How It Works
```
Hunter opens GitHub Issue
         ↓
Scarab webhook fires instantly
         ↓
Extract wallet address from issue body
         ↓
Check for duplicate submissions
    ↓ (duplicate)              ↓ (new)
Auto-comment "Duplicate"    Save to DB
Block submission            Comment "Received"
                                 ↓
                    Fetch repo source code (15 files)
                                 ↓
                    Send to AI Judge (Zo AI via OpenRouter)
                    — reads issue + actual source code
                    — verifies bug exists in codebase
                    — assigns severity: low / medium / high
                                 ↓
                    ↓ (invalid)            ↓ (valid)
                Label "bounty-invalid"   Label "bounty-paid"
                Close issue              Close issue
                Comment "Rejected"       pinion.skills.send() → build tx
                                         pinion.skills.broadcast() → send USDC
                                         Comment "Paid! [txHash]"
```

### Bounty Tiers (Development)
| Severity | Bounty | Description |
|----------|--------|-------------|
| LOW | $0.10 USDC | Minor bugs, UI issues, typos |
| MEDIUM | $0.10 USDC | Broken functionality, wrong behavior |
| HIGH | $0.10 USDC | Security issues, crashes, data loss |

---

## Tech Stack

### Core Infrastructure
| Layer | Technology |
|-------|-----------|
| **Autonomous Payments** | [PinionOS](https://pinion.gg) — programmable USDC treasury on Base |
| **Blockchain** | Base Mainnet (Ethereum L2) |
| **Stablecoin** | USDC |
| **AI Judge** | Zo AI (`z-ai/glm-5`) via OpenRouter |

### Application
| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | SQLite via Prisma ORM |
| **Auth** | NextAuth.js (GitHub OAuth) |
| **GitHub Integration** | Octokit REST |
| **Hosting** | Vercel |

### Key Integrations
- **PinionOS** — `pinion.skills.send()` builds unsigned tx, `pinion.skills.broadcast()` sends USDC autonomously from treasury wallet
- **GitHub Webhooks** — real-time issue event listener
- **Octokit** — auto-comment, auto-label, auto-close issues
- **OpenRouter** — AI inference with strict JSON output for reliable verdict parsing

---

## Architecture
```
┌─────────────────────────────────────────────────────┐
│                    GitHub                           │
│  Repo Issues ──webhook──► /api/webhook              │
│         ◄──── auto-comment, label, close            │
└─────────────────────────────────────────────────────┘
                          │
                    Next.js API
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     Prisma ORM      Zo AI Judge     PinionOS SDK
     (SQLite)        (OpenRouter)    (Base Mainnet)
          │               │               │
     submissions     verdict JSON    USDC transfer
     repos           severity        tx hash
     status          reason
```

---

## Features

### For Repo Owners
- 📦 **Register any public GitHub repo** — link in seconds via dashboard
- 🔗 **One-time webhook setup** — paste URL, select Issues, done
- 💰 **Fund once, pay forever** — deposit USDC to treasury, Scarab handles the rest
- 📊 **Real-time dashboard** — track submissions, verdicts, total paid
- 🏷️ **Category tagging** — Web, Mobile, API, AI, DeFi, Other
- 📧 **Filter & export** — filter by status/severity, export CSV

### For Bug Hunters
- 🔍 **Browse active campaigns** — public campaigns page with live stats
- ⚡ **Instant payment** — USDC hits your wallet before you finish your coffee
- 🤖 **Transparent AI verdicts** — every rejection includes a reason
- 🔔 **GitHub notifications** — auto-comments keep you updated at every step
- 🏆 **On-chain proof** — every payment has a BaseScan link

### Anti-Abuse
- **Duplicate detection** — 60% word similarity threshold blocks repeat submissions
- **Source code verification** — AI reads actual repo files, can't be fooled by made-up bugs
- **Wallet validation** — Ethereum address regex validation before processing
- **Webhook signature** — HMAC SHA-256 verification (optional)

---

## Getting Started

### Prerequisites
- Node.js 18+
- GitHub account
- Base wallet with USDC
- PinionOS account
- GitHub personal access token (for Octokit)

### Installation
```bash
git clone https://github.com/yourusername/scarab
cd scarab
npm install
```

### Environment Variables

Create `.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# PinionOS — get from https://pinion.gg
PINION_PRIVATE_KEY="0x..."

# GitHub OAuth — create at github.com/settings/developers
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# GitHub Token — for auto-comments and reading repo code
GITHUB_TOKEN="ghp_..."

# Zo AI via OpenRouter
ZO_API_KEY="zo_sk_..."
```

### Database Setup
```bash
npx prisma migrate dev
npx prisma generate
```

### Run Development
```bash
npm run dev
```

### Webhook Setup (Local)

Use [ngrok](https://ngrok.com) to expose local server:
```bash
ngrok http 3000
```

Copy the HTTPS URL and add `/api/webhook` as your GitHub repo's webhook:
- **Payload URL:** `https://your-ngrok-url.ngrok.io/api/webhook`
- **Content type:** `application/json`
- **Events:** Issues only

### Fund Your Treasury

Send USDC to your PinionOS treasury wallet address. Each valid bug costs $0.10–$0.50 USDC depending on severity. We recommend starting with $10 USDC.

---

## Submitting a Bug (For Hunters)

1. Find an active campaign at `/campaigns`
2. Open a new issue on the repo
3. Fill in:
   - Clear title describing the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - **Your wallet address:** `Wallet: 0x...` (required for payment)
4. Submit — you'll get a GitHub comment within seconds
5. If valid: USDC arrives in your wallet within 60 seconds

---

## Project Structure
```
scarab/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── campaigns/page.tsx    # Public campaigns browser
│   │   ├── tutorial/page.tsx     # Setup guides
│   │   ├── dashboard/page.tsx    # Owner dashboard
│   │   └── api/
│   │       ├── webhook/route.ts  # GitHub webhook handler
│   │       ├── repos/route.ts    # Repo CRUD
│   │       ├── submissions/      # Submissions API
│   │       └── campaigns/        # Public campaigns data
│   ├── lib/
│   │   ├── judge.ts              # AI judge + PinionOS payments
│   │   ├── prisma.ts             # DB client
│   │   └── auth.ts               # NextAuth config
│   └── components/
│       └── Navbar.tsx            # Shared navigation
└── prisma/
    └── schema.prisma             # DB schema
```

---

## Roadmap

### v1.1 — Hunter Experience
- [ ] **Leaderboard** — top bug hunters ranked by total earned
- [ ] **Hunter profiles** — public profile with stats and badge history
- [ ] **Discord webhooks** — repo owners get notified in their server
- [ ] **Issue templates** — auto-inject Scarab submission template on register

### v1.2 — Owner Tools
- [ ] **Custom bounty tiers** — owners set their own LOW/MED/HIGH amounts
- [ ] **Treasury top-up alerts** — notify when balance runs low
- [ ] **Whitelist/blacklist wallets** — ban bad actors, whitelist trusted hunters
- [ ] **Analytics dashboard** — bug trends, hunter activity, cost tracking

### v1.3 — Protocol
- [ ] **Multi-chain support** — Optimism, Arbitrum, Polygon
- [ ] **ERC-20 flexibility** — pay in any token, not just USDC
- [ ] **DAO governance** — community-voted severity thresholds
- [ ] **Staking** — hunters stake tokens to boost credibility score
- [ ] **Bug NFTs** — verified bugs minted as on-chain proof of work

### v2.0 — Enterprise
- [ ] **Private repos** — GitHub App integration for private codebases
- [ ] **Team accounts** — multi-wallet treasury management
- [ ] **SLA guarantees** — enterprise response time commitments
- [ ] **Audit reports** — auto-generated security reports per quarter

---

## Why PinionOS?

PinionOS made the autonomous payment layer possible without building a smart contract. With `pinion.skills.send()` and `pinion.skills.broadcast()`, Scarab can:

- Build and sign transactions programmatically
- Send USDC from a treasury wallet with zero human interaction
- Operate entirely server-side with no wallet popup or user confirmation

This is the exact primitive needed for a fully autonomous bounty system. Without PinionOS, we'd need a custom smart contract, a multisig setup, or manual payment processing — none of which work at the speed and automation level Scarab targets.

---

## License

MIT

---

<div align="center">
  <p>Built with ❤️ for PinionOS Hackathon 2026</p>
  <p>🪲 <strong>Scarab</strong> · Autonomous Bug Bounty on Base</p>
</div>
