# 🛡️ Vouchd

### **The Trust Layer for P2P Crypto Exchange on Solana**

> **FairScale Hackathon Submission** — Vouchd makes trust a first-class primitive by integrating FairScale's multi-pillar reputation scoring into every step of the P2P lifecycle.

[![Built with FairScale](https://img.shields.io/badge/Powered%20by-FairScale-6366f1)](https://fairscale.xyz)
[![Solana](https://img.shields.io/badge/Built%20on-Solana-00D18C)](https://solana.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [Overview](#overview)
- [FairScale Integration](#-fairscale-integration)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Demo Video](#-demo-video)
- [License](#-license)

---

## Overview

**Vouchd** is a peer-to-peer cryptocurrency exchange platform that enables users to trade crypto for local fiat currency with trust-based matching powered by **FairScale** reputation scoring on Solana.

### The Problem
P2P trading on Solana is risky—scammers flourish because trust is invisible. Existing platforms rely on platform-specific ratings that don't carry across the ecosystem.

### Our Solution
Vouchd treats **reputation as infrastructure**. We use FairScale's on-chain reputation data to:
- Gate access to features based on trust level
- Dynamically adjust fees and limits based on score
- Provide real-time safety insights during trades

---

## ⭐ FairScale Integration

We've implemented **all three bounty categories** meaningfully:

### 1. 🛑 FairScore Gated Access

Reputation is the "Passport" of Vouchd.

| Feature | Requirement |
|---------|-------------|
| Create sell offers | FairScore ≥ 300 (Bronze tier) |
| High-value trades (>$5k) | FairScore ≥ 700 (Gold) OR linked socials |
| Bypass tier requirements | Flash Trust with USDC collateral |

**Implementation:**
```typescript
// backend/src/services/fairscale.service.ts
async canPerformAction(walletAddress, action, amount) {
  const scoreData = await this.getWalletScore(walletAddress);
  const capabilities = this.getTierCapabilities(scoreData);
  
  if (action === "CREATE_OFFER" && !capabilities.canSell) {
    return { allowed: false, reason: "Bronze tier required to sell" };
  }
  // ...
}
```

### 2. 🎁 Reputation-Based Rewards

Trust is an asset that pays dividends.

| Tier | Score | Trading Fee | Max Trade | Daily Limit |
|------|-------|-------------|-----------|-------------|
| Unverified | 0-299 | 3.0% | $100 | $500 |
| Bronze | 300-499 | 2.0% | $500 | $2,000 |
| Silver | 500-699 | 1.5% | $2,000 | $10,000 |
| Gold | 700-899 | 1.0% | $5,000 | $25,000 |
| Diamond | 900+ | 0.5% | $10,000 | $50,000 |

**Implementation:**
```typescript
// Dynamic fee calculation based on tier
getTierCapabilities(scoreData) {
  const tier = this.calculateTier(scoreData.fairScore);
  const limits = {
    DIAMOND: { fee: 0.005, maxTrade: 10000 },
    GOLD: { fee: 0.01, maxTrade: 5000 },
    // ...
  };
  return limits[tier];
}
```

### 3. 🛡️ Risk Guardrails

FairScale data powers real-time risk mitigation.

- **Safety Insight Engine**: Translates 5-pillar scores into plain-English advice
- **Dynamic Limits**: Trade caps scale with FairScore
- **Flash Trust**: Collateral-based temporary tier boost

**Implementation:**
```typescript
// Generate safety recommendations from pillar data
getSafetyRecommendation(scoreData) {
  const { risk, social, activity } = scoreData.pillars;
  
  if (risk.label === "Low" && social.label === "Low") {
    return "🚨 Caution: Limited on-chain history. Consider smaller trades.";
  }
  // ...
}
```

### FairScale Service Methods

| Method | Purpose |
|--------|---------|
| `getWalletScore()` | Fetch FairScore + 5 pillars from API |
| `calculateTier()` | Map score to BRONZE/SILVER/GOLD/DIAMOND |
| `getTierCapabilities()` | Return limits, fees, permissions |
| `getSafetyRecommendation()` | Generate risk insights |
| `getAirdropPredictions()` | Predict ecosystem eligibility |
| `canPerformAction()` | Authorization check for actions |

---

## ✨ Features

### Core Trading
- 🔗 **Wallet Connection** — Phantom, Solflare, Backpack via Mobile Wallet Adapter
- 📊 **Marketplace** — Browse/filter offers by asset, payment method, seller score
- 🔒 **Solana Escrow** — Trustless smart contract holds funds until trade completes
- 💬 **Trade Chat** — Real-time messaging via Socket.io

### Trust Features (FairScale-Powered)
- 🏆 **Tier Badges** — Visual Bronze/Silver/Gold/Diamond status on all profiles
- 📈 **Pillar Analysis** — Deep dive into Economy, Risk, Activity, Diversification, Social
- 💡 **Safety Insights** — Plain-English risk advice during trades
- ⚡ **Flash Trust** — Deposit USDC collateral for temporary tier boost
- 🔐 **KYC Hub** — Link Twitter, Discord, GitHub to boost social score
- 🎯 **Boost Score Quests** — Gamified reputation building

### Marketplace Tabs
- **Buy Crypto** — Browse sell offers from verified traders
- **Sell Crypto** — View buy requests from potential buyers

---

## 🛠 Tech Stack

### Mobile App (`/app`)
| Technology | Purpose |
|------------|---------|
| Expo (React Native) | Cross-platform mobile |
| TypeScript | Type safety |
| NativeWind | Tailwind CSS styling |
| Apollo Client | GraphQL queries |
| Zustand | State management |
| Solana Mobile Wallet Adapter | Wallet connection |

### Backend (`/backend`)
| Technology | Purpose |
|------------|---------|
| Node.js + TypeScript | Runtime |
| Apollo Server | GraphQL API |
| Prisma ORM | Database access |
| PostgreSQL | Data storage |
| Socket.io | Real-time chat |
| JWT | Authentication |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Solana (Devnet) | Settlement layer |
| Anchor | Smart contract framework |
| SPL Token | USDC escrow |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Expo CLI: `npm install -g expo-cli`
- FairScale API key (get from [FairScale](https://forms.gle/heG1hfnjao4VShUS8))

### 1. Clone the Repository
```bash
git clone https://github.com/Chizihn/vouchd.git
cd vouchd
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql://user:pass@localhost:5432/vouchd
# FAIRSCALE_API_KEY=your_api_key
# JWT_SECRET=your_jwt_secret
# SOLANA_RPC_URL=https://api.devnet.solana.com

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data (optional)
npm run prisma:seed

# Start server
npm run dev
```

Backend runs at `http://localhost:4000/graphql`

### 3. Setup Mobile App
```bash
cd app
npm install

# Create .env file
cp .env.example .env

# Edit .env:
# EXPO_PUBLIC_API_URL=http://your-ip:4000/graphql
# EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Start Expo
npx expo start
```

Scan QR code with Expo Go app on your phone.

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📁 Project Structure

```
vouchd/
├── app/                          # React Native mobile app
│   ├── app/                      # Expo Router screens
│   │   ├── (tabs)/               # Tab navigation
│   │   │   ├── index.tsx         # Marketplace (Buy/Sell tabs)
│   │   │   ├── trades.tsx        # My trades list
│   │   │   ├── create.tsx        # Create offer
│   │   │   └── profile.tsx       # User profile + FairScore
│   │   ├── auth/
│   │   │   └── connect-wallet.tsx
│   │   ├── offer/[id].tsx        # Offer details
│   │   ├── trade/[id].tsx        # Trade escrow screen
│   │   └── profile/
│   │       ├── flash-trust.tsx   # Collateral tier boost
│   │       ├── kyc-hub.tsx       # Social linking
│   │       └── boost-score.tsx   # Score quests
│   ├── components/               # Reusable components
│   ├── graphql/                  # Queries & mutations
│   ├── store/                    # Zustand stores
│   └── utils/                    # Helpers + Solana utils
│
├── backend/                      # Node.js GraphQL API
│   ├── prisma/
│   │   └── schema.prisma         # Database models
│   └── src/
│       ├── graphql/schema.ts     # GraphQL typedefs
│       ├── resolvers/            # Query/mutation resolvers
│       ├── services/
│       │   └── fairscale.service.ts  # FairScale integration ⭐
│       └── middleware/auth.ts    # JWT authentication
│
├── ARCHITECTURE.md               # System architecture diagrams
└── README.md                     # This file
```

---

## 📸 Screenshots

| Welcome | Profile | Marketplace |
|---------|---------|-------------|
| Onboarding carousel | FairScore display, tier badge, benefits | Buy/Sell tabs with offer cards |

| Flash Trust | KYC Hub | Trade Escrow |
|-------------|---------|--------------|
| Collateral tier boost | Social linking | Status timeline, safety insights |

*(See demo video for full walkthrough)*

---

## 🏗 Architecture

```mermaid
graph TB
    subgraph "Mobile Client"
        App[React Native App]
        MWA[Mobile Wallet Adapter]
    end

    subgraph "Backend"
        GQL[Apollo GraphQL]
        FS[FairScale Service]
        DB[(PostgreSQL)]
    end

    subgraph "External"
        FSApi[FairScale API]
    end

    subgraph "Solana"
        Escrow[Escrow Contract]
    end

    App --> GQL --> FS --> FSApi
    App --> MWA --> Escrow
    GQL --> DB
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed diagrams.

---

## 📡 API Reference

### GraphQL Queries
```graphql
# Get current user with FairScore
query GetMe {
  me {
    id
    walletAddress
    fairScore
    fairTier
    pillars
    walletScore
    socialScore
    capabilities {
      canSell
      maxTradeAmount
      feePercentage
    }
    safetyInsight
  }
}

# Browse offers
query GetOffers($cryptoAsset: String, $minFairScore: Int) {
  offers(cryptoAsset: $cryptoAsset, minFairScore: $minFairScore) {
    id
    cryptoAmount
    fiatAmount
    seller {
      fairScore
      fairTier
    }
  }
}
```

### GraphQL Mutations
```graphql
# Login with wallet
mutation Login($walletAddress: String!) {
  login(walletAddress: $walletAddress) {
    token
    user {
      fairScore
      fairTier
    }
  }
}

# Create offer (requires Bronze+)
mutation CreateOffer($input: CreateOfferInput!) {
  createOffer(input: $input) {
    id
    status
  }
}

# Initiate trade
mutation InitiateTrade($offerId: ID!, $amount: Float!) {
  initiateTrade(offerId: $offerId, amount: $amount) {
    id
    escrowSignature
  }
}
```

---

## 🎥 Demo Video

> 📹 **[Watch the Demo](#)** *(2.5 minutes)*

The demo showcases:
1. Wallet connection & FairScore reveal
2. Marketplace browsing with tier badges
3. Flash Trust collateral tier boost
4. KYC Hub social linking
5. Full escrow trade flow with Explorer proof

See [`app/video_script.md`](./app/video_script.md) for the recording script.

---

## 🏆 Bounty Alignment

| Requirement | ✅ Implemented |
|-------------|---------------|
| Uses FairScale meaningfully | Gating, rewards, guardrails |
| Prototype works | Full mobile app + backend |
| Easy to run | Quick start instructions above |
| Clear explanation | This README + ARCHITECTURE.md |
| Solana ecosystem relevance | MWA, escrow contracts, USDC |

---

## 📄 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System diagrams & data flow
- [app/README.md](./app/README.md) — Mobile app details
- [backend/README.md](./backend/README.md) — Backend API docs
- [app/video_script.md](./app/video_script.md) — Demo recording guide

---

## 🙏 Acknowledgments

- **FairScale** — For the reputation infrastructure
- **Solana Mobile** — For Mobile Wallet Adapter
- **Expo** — For the React Native framework

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

**Built for the FairScale Hackathon 2026** 🚀
