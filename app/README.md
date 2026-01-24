# Vouchd Mobile App

React Native mobile application for Vouchd - P2P Crypto Exchange with FairScale integration.

## Tech Stack

- **React Native** (via Expo)
- **Expo Router** (File-based routing)
- **TypeScript**
- **NativeWind** (Tailwind CSS for React Native)
- **Apollo Client** (GraphQL)
- **Zustand** (State management)
- **Solana Wallet Adapter**

## Setup

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for emulator)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your backend URL
```

### Run Development

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
app/
├── _layout.tsx          # Root layout with providers
├── index.tsx            # Welcome screen
├── auth/
│   └── connect-wallet.tsx
├── (tabs)/              # Tab navigation
│   ├── home.tsx
│   ├── offers.tsx
│   ├── trades.tsx
│   └── profile.tsx
└── trade/
    └── [id].tsx         # Trade detail (Wow)
    └── chat.tsx         # Trade chat

components/
├── TierBadge.tsx        # FairScore tier badge
├── PillarAnalysis.tsx   # High-fidelity rep breakdown (Wow)
├── ActionItem.tsx       # Recommended actions
└── ...

graphql/
├── mutations/           # GraphQL mutations
└── queries/             # GraphQL queries
```

## 🏆 FairScale "Wow" Features

The app leverages FairScale to create a premium, trust-based experience:

- **🥇 Hero Score Gauge**: High-fidelity visualization of your FairScore.
- **📊 Deep Pillar Analysis**: Visual 5-pillar reputation breakdown (Economy, Risk, Activity, Diversification, Social).
- **💡 Safety Insights**: Plain-English trust advice in every trade screen (e.g., "High Risk Behavior Detected").
- **🚀 Airdrop Predictor**: Visual prediction of ecosystem eligibility based on your pillars.
- **🪪 Identity Hub**: Social/KYC linking simulation for real-world reputation building.
- **📜 Universal Trust Seal**: Shareable public profile link to prove your reputation globally.
- **🔓 Flash Trust**: UI for collateralized reputation boosting (SOL staking).
- **💰 Reputation Dividends**: Visual ROI showing how your trust tier boosts your earnings.

## Environment Variables

Required in `.env`:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url/graphql
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## License

MIT
