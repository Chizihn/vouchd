import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create test users with different FairScores
  // Using upsert to avoid duplicate key errors on re-run
  const users = await Promise.all([
    // Real wallet addresses for testing
    prisma.user.upsert({
      where: { walletAddress: "9eM2v3c26Md1uT9byBt5iWmdYi63oJg7sSh6oXYFVxt3" },
      update: {},
      create: {
        walletAddress: "9eM2v3c26Md1uT9byBt5iWmdYi63oJg7sSh6oXYFVxt3",
        fairScore: 720,
        walletScore: 45,
        socialScore: 35,
        fairTier: "GOLD",
        fairBadges: ["LST_STAKER", "NO_DUMPER", "EARLY_ADOPTER"],
        pillars: {
          economy: 72,
          risk: 68,
          activity: 85,
          diversification: 60,
          social: 55
        },
        username: "main_tester",
        totalTrades: 12,
        completedTrades: 11,
        averageRating: 4.8,
        lastScoreUpdate: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: "Gwd4bB5U2pZgifLsY1bftkddzN2D8UFV4v1ndWfKQjwx" },
      update: {},
      create: {
        walletAddress: "Gwd4bB5U2pZgifLsY1bftkddzN2D8UFV4v1ndWfKQjwx",
        fairScore: 850,
        walletScore: 62,
        socialScore: 48,
        fairTier: "DIAMOND",
        fairBadges: ["DIAMOND_HANDS", "DEFI_POWER_USER", "TRUSTED_TRADER", "EARLY_ADOPTER"],
        pillars: {
          economy: 88,
          risk: 82,
          activity: 90,
          diversification: 75,
          social: 70
        },
        username: "diamond_tester",
        totalTrades: 45,
        completedTrades: 44,
        averageRating: 4.95,
        kycVerified: true,
        lastScoreUpdate: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: "HkG2jXr6fDXtwG94k7L7Br6HUKA6KEBs6jysQfJkN74s" },
      update: {},
      create: {
        walletAddress: "HkG2jXr6fDXtwG94k7L7Br6HUKA6KEBs6jysQfJkN74s",
        fairScore: 520,
        walletScore: 32,
        socialScore: 25,
        fairTier: "SILVER",
        fairBadges: ["BUILDER", "LST_STAKER"],
        pillars: {
          economy: 55,
          risk: 50,
          activity: 65,
          diversification: 45,
          social: 40
        },
        username: "silver_tester",
        totalTrades: 8,
        completedTrades: 7,
        averageRating: 4.5,
        lastScoreUpdate: new Date(),
      },
    }),
    // Keep original test wallets for demo purposes
    prisma.user.upsert({
      where: { walletAddress: "DiamondWallet1111111111111111111111111111" },
      update: {},
      create: {
        walletAddress: "DiamondWallet1111111111111111111111111111",
        fairScore: 950,
        walletScore: 70,
        socialScore: 55,
        fairTier: "DIAMOND",
        fairBadges: ["EARLY_ADOPTER", "DEFI_POWER_USER"],
        pillars: {
          economy: 95,
          risk: 90,
          activity: 98,
          diversification: 85,
          social: 80
        },
        username: "diamond_trader",
        totalTrades: 50,
        completedTrades: 49,
        averageRating: 4.9,
        kycVerified: true,
        lastScoreUpdate: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: "GoldWallet22222222222222222222222222222" },
      update: {},
      create: {
        walletAddress: "GoldWallet22222222222222222222222222222",
        fairScore: 820,
        walletScore: 55,
        socialScore: 42,
        fairTier: "GOLD",
        fairBadges: ["TRUSTED_TRADER"],
        pillars: {
          economy: 80,
          risk: 75,
          activity: 85,
          diversification: 70,
          social: 65
        },
        username: "gold_seller",
        totalTrades: 30,
        completedTrades: 28,
        averageRating: 4.7,
        kycVerified: true,
        lastScoreUpdate: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: "SilverWallet333333333333333333333333333" },
      update: {},
      create: {
        walletAddress: "SilverWallet333333333333333333333333333",
        fairScore: 650,
        walletScore: 40,
        socialScore: 30,
        fairTier: "SILVER",
        pillars: {
          economy: 65,
          risk: 60,
          activity: 70,
          diversification: 55,
          social: 50
        },
        username: "silver_buyer",
        totalTrades: 15,
        completedTrades: 14,
        averageRating: 4.5,
        lastScoreUpdate: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: "BronzeWallet444444444444444444444444444" },
      update: {},
      create: {
        walletAddress: "BronzeWallet444444444444444444444444444",
        fairScore: 350,
        walletScore: 22,
        socialScore: 15,
        fairTier: "BRONZE",
        pillars: {
          economy: 35,
          risk: 30,
          activity: 45,
          diversification: 25,
          social: 20
        },
        username: "bronze_newbie",
        totalTrades: 3,
        completedTrades: 3,
        averageRating: 5.0,
        lastScoreUpdate: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: "UnverifiedWallet5555555555555555555555555" },
      update: {},
      create: {
        walletAddress: "UnverifiedWallet5555555555555555555555555",
        fairScore: 150,
        walletScore: 10,
        socialScore: 5,
        fairTier: "UNVERIFIED",
        pillars: {
          economy: 15,
          risk: 10,
          activity: 20,
          diversification: 10,
          social: 5
        },
        username: "new_user",
        totalTrades: 0,
        completedTrades: 0,
        averageRating: 0,
        lastScoreUpdate: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} test users`);

  // Create sample offers
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        sellerId: users[0].id, // Diamond user
        cryptoAsset: "USDC",
        cryptoAmount: 1000,
        fiatCurrency: "USD",
        fiatAmount: 1005,
        exchangeRate: 1.005,
        paymentMethod: "BANK_TRANSFER",
        paymentDetails: {
          bankName: "Chase Bank",
          accountType: "Checking",
        },
        minLimit: 100,
        maxLimit: 1000,
        terms: "Fast release within 10 minutes of payment confirmation",
        status: "ACTIVE",
      },
    }),
    prisma.offer.create({
      data: {
        sellerId: users[1].id, // Gold user
        cryptoAsset: "SOL",
        cryptoAmount: 50,
        fiatCurrency: "USD",
        fiatAmount: 5250,
        exchangeRate: 105,
        paymentMethod: "MOBILE_MONEY",
        paymentDetails: {
          provider: "M-Pesa",
          phoneNumber: "+254712345678",
        },
        minLimit: 50,
        maxLimit: 500,
        location: "Nairobi, Kenya",
        status: "ACTIVE",
      },
    }),
    prisma.offer.create({
      data: {
        sellerId: users[3].id, // Bronze user
        cryptoAsset: "USDC",
        cryptoAmount: 200,
        fiatCurrency: "NGN",
        fiatAmount: 300000,
        exchangeRate: 1500,
        paymentMethod: "BANK_TRANSFER",
        paymentDetails: {
          bankName: "GTBank",
          accountName: "Bronze Trader",
        },
        minLimit: 50,
        maxLimit: 200,
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`✅ Created ${offers.length} sample offers`);

  // Create a sample completed trade
  const completedTrade = await prisma.trade.create({
    data: {
      offerId: offers[0].id,
      buyerId: users[2].id, // Silver buyer
      sellerId: users[0].id, // Diamond seller
      cryptoAmount: 100,
      fiatAmount: 100.5,
      fee: 1.5,
      feePercentage: 0.015,
      status: "COMPLETED",
      escrowSignature: "5KxPz7N8qQmR...exampleSig",
      releaseSignature: "2HfGt9M4xWnS...exampleSig",
      completedAt: new Date(),
    },
  });

  // Create rating for the completed trade
  await Promise.all([
    prisma.rating.create({
      data: {
        tradeId: completedTrade.id,
        fromUserId: users[2].id,
        toUserId: users[0].id,
        score: 5,
        comment: "Very fast release! Excellent seller.",
        tags: ["fast", "trustworthy"],
      },
    }),
    prisma.rating.create({
      data: {
        tradeId: completedTrade.id,
        fromUserId: users[0].id,
        toUserId: users[2].id,
        score: 5,
        comment: "Payment received quickly. Good buyer.",
        tags: ["reliable", "fast"],
      },
    }),
  ]);

  console.log("✅ Created sample completed trade with ratings");

  // Create additional trades in different states for demo
  // Trade 1: ESCROWED - waiting for buyer payment
  await prisma.trade.create({
    data: {
      offerId: offers[1].id,
      buyerId: users[0].id, // main_tester as buyer
      sellerId: users[1].id, // diamond_tester as seller
      cryptoAmount: 5,
      fiatAmount: 525,
      fee: 0.05,
      feePercentage: 0.01,
      status: "ESCROWED",
      escrowSignature: "4rL8Nt9vQwPzK2X6mYDe7JhS3FgH1kWbC5uVxR8nM9jA2sTpE6iO3qYmNbXcZdGfHjKlWpRvTyUiO",
      escrowPDA: "EscrXyzABC123456789defGHIjklMNOpqr",
      escrowedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
      expiresAt: new Date(Date.now() + 1000 * 60 * 20), // 20 min from now
    },
  });

  // Trade 2: FIAT_SENT - waiting for seller to release
  await prisma.trade.create({
    data: {
      offerId: offers[0].id,
      buyerId: users[2].id, // silver_tester as buyer
      sellerId: users[1].id, // diamond_tester as seller
      cryptoAmount: 250,
      fiatAmount: 251.25,
      fee: 2.5,
      feePercentage: 0.01,
      status: "FIAT_SENT",
      escrowSignature: "3mK7Ys2bQwNxL4X8nYCf5JkT1FgI9kWaD6uVzS7oP8jB1uTqF5jN2rZmOaWcYeHgIkLlXpSvUzViP",
      escrowPDA: "EscrAbc789XYZ123456defGHIjklMNOpqr",
      escrowedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      fiatSentAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
      expiresAt: new Date(Date.now() + 1000 * 60 * 25), // 25 min from now
    },
  });

  // Trade 3: Another COMPLETED with Solana Explorer link demo
  const demoCompletedTrade = await prisma.trade.create({
    data: {
      offerId: offers[0].id,
      buyerId: users[0].id, // main_tester as buyer
      sellerId: users[3].id, // original diamond trader as seller
      cryptoAmount: 500,
      fiatAmount: 502.50,
      fee: 5.0,
      feePercentage: 0.01,
      status: "COMPLETED",
      escrowSignature: "2nL9Zs5cRwOyM3X7pYDg8KlU2GhJ0kXbE4vWzT6qR7jC3vUrG4kO1sYnPbVdZfIhJmMmYrTwVxWjQ",
      releaseSignature: "5pM8Xt4dSwPzN2Y6qZEh9LmV3HiK1lYcF5wXaU7rS8kD4wVsH5lP2tZoQcWeAgJiKnNnZsTxWyXkR",
      escrowPDA: "EscrDef456UVW789123abcGHIjklMNOpqr",
      escrowedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      fiatSentAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
      fiatConfirmedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      completedAt: new Date(Date.now() - 1000 * 60 * 55), // 55 min ago
    },
  });

  // Add rating for the demo completed trade
  await prisma.rating.create({
    data: {
      tradeId: demoCompletedTrade.id,
      fromUserId: users[0].id,
      toUserId: users[3].id,
      score: 5,
      comment: "Smooth transaction, fast release. Would trade again!",
      tags: ["fast", "professional", "trustworthy"],
    },
  });

  console.log("✅ Created demo trades in various states");
  console.log("   - 1x ESCROWED (waiting for buyer payment)");
  console.log("   - 1x FIAT_SENT (waiting for seller release)");
  console.log("   - 2x COMPLETED (with ratings and signatures)");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
