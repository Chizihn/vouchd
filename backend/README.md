# Vouchd Backend

Backend API for Vouchd - P2P Crypto Exchange with FairScale reputation scoring.

## Tech Stack

- **Node.js** + **TypeScript**
- **Apollo Server** (GraphQL)
- **Prisma** ORM + PostgreSQL
- **Socket.io** (Real-time chat)
- **Solana Web3.js**
- **FairScale SDK**

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `FAIRSCALE_API_KEY`: Get from https://forms.gle/heG1hfnjao4VShUS8
- `SOLANA_RPC_URL`: Solana RPC endpoint
- `JWT_SECRET`: Secret for JWT tokens

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed test data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:4000/graphql`

## GraphQL API

### Example Queries

```graphql
# Login (fetch FairScore automatically)
mutation Login {
  login(walletAddress: "YourSolanaWalletAddress", signature: "signature") {
    token
    user {
      fairScore
      fairTier
      capabilities {
        canSell
        maxTradeAmount
        feePercentage
      }
    }
  }
}

# Browse offers
query GetOffers {
  offers(cryptoAsset: "USDC", minFairScore: 700) {
    id
    cryptoAmount
    fiatAmount
    seller {
      fairScore
      fairTier
      averageRating
    }
  }
}

# Create offer (requires Bronze tier+)
mutation CreateOffer {
  createOffer(
    input: {
      cryptoAsset: "USDC"
      cryptoAmount: 1000
      fiatCurrency: "USD"
      fiatAmount: 1010
      paymentMethod: "BANK_TRANSFER"
      paymentDetails: { bankName: "Chase" }
      minLimit: 100
      maxLimit: 1000
    }
  ) {
    id
    status
  }
}

# Initiate trade
mutation Trade {
  initiateTrade(offerId: "offer-id", amount: 500) {
    id
    status
    fee
    expiresAt
  }
}
```

## FairScale Integration

The backend automatically:

1. Fetches FairScore on user login
2. Checks tier requirements before creating offers
3. Applies transaction limits based on score
4. Calculates fees based on tier
5. **Trust Intelligence**: Generates plain-English safety insights based on FS pillar data.
6. **Airdrop Prediction**: Calculates ecosystem eligibility probabilities based on on-chain behavior.

See [fairscale.service.ts](src/services/fairscale.service.ts) for implementation.

## Project Structure

```
src/
├── app.ts              # App setup
├── server.ts           # Entry point
├── config/
│   └── database.ts     # Prisma client
├── graphql/
│   └── schema.ts       # GraphQL schema
├── middleware/
│   └── auth.ts         # JWT authentication
├── resolvers/
│   └── index.ts        # GraphQL resolvers
├── services/
│   └── fairscale.service.ts  # FairScale integration
└── socket/
    └── handler.ts      # Socket.io handlers
```

## Testing

```bash
npm test
```

## License

MIT
