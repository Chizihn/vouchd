import { prisma } from "../config/database";
import { fairScaleService } from "../services/fairscale.service";
import { generateToken } from "../middleware/auth";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      return context.user;
    },

    user: async (_: any, { walletAddress }: { walletAddress: string }) => {
      return prisma.user.findUnique({ where: { walletAddress } });
    },

    offers: async (_: any, args: any) => {
      const where: any = { status: "ACTIVE" };

      if (args.cryptoAsset) where.cryptoAsset = args.cryptoAsset;
      if (args.fiatCurrency) where.fiatCurrency = args.fiatCurrency;
      if (args.paymentMethod) where.paymentMethod = args.paymentMethod;

      if (args.minFairScore) {
        where.seller = {
          fairScore: { gte: args.minFairScore },
        };
      }

      return prisma.offer.findMany({
        where,
        include: { seller: true },
        take: args.limit || 20,
        skip: args.offset || 0,
        orderBy: [
          { seller: { fairScore: "desc" } },
          { createdAt: "desc" }
        ],
      });
    },

    offer: async (_: any, { id }: { id: string }) => {
      const offer = await prisma.offer.findUnique({
        where: { id },
        include: { seller: true },
      });

      // Increment view count
      if (offer) {
        await prisma.offer.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        });
      }

      return offer;
    },

    myOffers: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.offer.findMany({
        where: { sellerId: context.user.id },
        include: { seller: true },
        orderBy: { createdAt: "desc" },
      });
    },

    trade: async (_: any, { id }: { id: string }) => {
      return prisma.trade.findUnique({
        where: { id },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });
    },

    myTrades: async (_: any, { status }: { status?: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const where: any = {
        OR: [{ buyerId: context.user.id }, { sellerId: context.user.id }],
      };

      if (status) where.status = status;

      return prisma.trade.findMany({
        where,
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },

    tradeMessages: async (_: any, { tradeId }: { tradeId: string }) => {
      return prisma.message.findMany({
        where: { tradeId },
        include: { sender: true },
        orderBy: { createdAt: "asc" },
      });
    },
  },

  Mutation: {
    login: async (_: any, { walletAddress }: { walletAddress: string }) => {
      // In production, verify signature here

      // Fetch FairScore
      const fairScoreData =
        await fairScaleService.getWalletScore(walletAddress);

      // Upsert user
      const user = await prisma.user.upsert({
        where: { walletAddress },
        update: {
          fairScore: fairScoreData.fairScore,
          pillars: fairScoreData.pillars as any,
          walletScore: fairScoreData.walletScore,
          socialScore: fairScoreData.socialScore,
          fairTier: fairScoreData.tier,
          fairBadges: fairScoreData.badges,
          kycVerified: fairScoreData.socialScore > 500 ? true : undefined,
          isBanned: fairScoreData.fairScore < 200,
          lastScoreUpdate: new Date(),
        },
        create: {
          walletAddress,
          fairScore: fairScoreData.fairScore,
          pillars: fairScoreData.pillars as any,
          walletScore: fairScoreData.walletScore,
          socialScore: fairScoreData.socialScore,
          fairTier: fairScoreData.tier,
          fairBadges: fairScoreData.badges,
          kycVerified: fairScoreData.socialScore > 500,
          isBanned: fairScoreData.fairScore < 200,
          lastScoreUpdate: new Date(),
        },
      });

      // Track history
      await prisma.fairScoreHistory.create({
        data: {
          walletAddress,
          fairScore: fairScoreData.fairScore,
          walletScore: fairScoreData.walletScore,
          socialScore: fairScoreData.socialScore,
          fairTier: fairScoreData.tier,
          reason: "login",
        },
      });

      const token = generateToken(user.id, user.walletAddress);

      return { token, user };
    },

    createOffer: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      // Check FairScore eligibility
      const canCreate = await fairScaleService.canPerformAction(
        context.user.walletAddress,
        "CREATE_OFFER",
      );

      if (!canCreate.allowed) {
        throw new Error(canCreate.reason);
      }

      // Get capabilities to check max offers
      const isFlashTrustActive = context.user.flashTrustExpiresAt && new Date(context.user.flashTrustExpiresAt) > new Date();
      const boostedTier = isFlashTrustActive ? context.user.flashTrustTier : undefined;

      const fairScoreData = await fairScaleService.getWalletScore(context.user.walletAddress);
      const capabilities = fairScaleService.getTierCapabilities(
        fairScoreData,
        boostedTier
      );
      const activeOffers = await prisma.offer.count({
        where: { sellerId: context.user.id, status: "ACTIVE" },
      });

      if (activeOffers >= capabilities.maxActiveOffers) {
        throw new Error(
          `Your tier allows max ${capabilities.maxActiveOffers} active offers`,
        );
      }

      return prisma.offer.create({
        data: {
          ...input,
          sellerId: context.user.id,
          exchangeRate: input.fiatAmount / input.cryptoAmount,
        },
        include: { seller: true },
      });
    },

    updateOffer: async (_: any, { id, input }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const offer = await prisma.offer.findUnique({ where: { id } });
      if (!offer || offer.sellerId !== context.user.id) {
        throw new Error("Not authorized");
      }

      return prisma.offer.update({
        where: { id },
        data: input,
        include: { seller: true },
      });
    },

    deleteOffer: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const offer = await prisma.offer.findUnique({ where: { id } });
      if (!offer || offer.sellerId !== context.user.id) {
        throw new Error("Not authorized");
      }

      await prisma.offer.delete({ where: { id } });
      return true;
    },

    initiateTrade: async (_: any, { offerId, amount }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        include: { seller: true },
      });

      if (!offer || offer.status !== "ACTIVE") {
        throw new Error("Offer not available");
      }

      if (offer.sellerId === context.user.id) {
        throw new Error("You cannot trade with your own offer");
      }

      // 1. Daily Limit Check
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dailyTrades = await prisma.trade.findMany({
        where: {
          buyerId: context.user.id,
          createdAt: { gte: twentyFourHoursAgo },
          status: { in: ["COMPLETED", "ESCROWED", "FIAT_SENT"] }
        }
      });
      const dailyTotal = dailyTrades.reduce((sum, t) => sum + Number(t.fiatAmount), 0);

      // 2. Velocity Check (Manual review if >3 trades/hour for users)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentTradesCount = await prisma.trade.count({
        where: {
          buyerId: context.user.id,
          createdAt: { gte: oneHourAgo }
        }
      });

      // Check trade limits
      const isFlashTrustActive = context.user.flashTrustExpiresAt && new Date(context.user.flashTrustExpiresAt) > new Date();
      const boostedTier = isFlashTrustActive ? context.user.flashTrustTier : undefined;

      const canTrade = await fairScaleService.canPerformAction(
        context.user.walletAddress,
        "TRADE",
        amount,
        dailyTotal,
        context.user.kycVerified,
        boostedTier
      );

      if (!canTrade.allowed) {
        throw new Error(canTrade.reason);
      }

      // Calculate fee and lock duration based on buyer's tier and risk
      const fairScoreData = await fairScaleService.getWalletScore(context.user.walletAddress);
      const capabilities = fairScaleService.getTierCapabilities(fairScoreData, boostedTier);
      const fee = amount * capabilities.feePercentage;
      
      const requiresReview = capabilities.requiresReview || recentTradesCount >= 3;

      return prisma.trade.create({
        data: {
          offerId,
          buyerId: context.user.id,
          sellerId: offer.sellerId,
          cryptoAmount: amount,
          fiatAmount: amount * Number(offer.exchangeRate),
          fee,
          feePercentage: capabilities.feePercentage,
          status: "PENDING",
          requiresReview,
          expiresAt: new Date(Date.now() + capabilities.escrowLockDuration * 1000),
        },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });
    },

    confirmEscrow: async (
      _: any,
      { tradeId, signature }: any,
      context: any,
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "ESCROWED",
          escrowSignature: signature,
          escrowedAt: new Date(),
        },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });
    },

    markFiatSent: async (
      _: any,
      { tradeId }: { tradeId: string },
      context: any,
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "FIAT_SENT",
          fiatSentAt: new Date(),
        },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });
    },

    confirmFiatReceived: async (
      _: any,
      { tradeId }: { tradeId: string },
      context: any,
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.trade.update({
        where: { id: tradeId },
        data: {
          fiatConfirmedAt: new Date(),
        },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });
    },

    releaseCrypto: async (
      _: any,
      { tradeId, signature }: any,
      context: any,
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      const tradeCheck = await prisma.trade.findUnique({
        where: { id: tradeId },
      });

      if (!tradeCheck || tradeCheck.sellerId !== context.user.id) {
        throw new Error("Only the seller can release crypto from escrow");
      }

      const trade = await prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "COMPLETED",
          releaseSignature: signature,
          completedAt: new Date(),
        },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });

      // Update user stats
      await Promise.all([
        prisma.user.update({
          where: { id: trade.buyerId },
          data: {
            totalTrades: { increment: 1 },
            completedTrades: { increment: 1 },
          },
        }),
        prisma.user.update({
          where: { id: trade.sellerId },
          data: {
            totalTrades: { increment: 1 },
            completedTrades: { increment: 1 },
          },
        }),
      ]);

      return trade;
    },

    cancelTrade: async (_: any, { tradeId }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });
    },

    disputeTrade: async (
      _: any,
      { tradeId, reason, evidence }: any,
      context: any,
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "DISPUTED",
          disputeReason: reason,
          disputeEvidence: evidence,
          disputedAt: new Date(),
        },
        include: {
          offer: { include: { seller: true } },
          buyer: true,
          seller: true,
        },
      });
    },

    sendMessage: async (
      _: any,
      { tradeId, content, messageType }: any,
      context: any,
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.message.create({
        data: {
          tradeId,
          senderId: context.user.id,
          content,
          messageType: messageType || "TEXT",
        },
        include: {
          sender: true,
          trade: true,
        },
      });
    },

    rateTrade: async (
      _: any,
      { tradeId, score, comment, tags }: any,
      context: any,
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      const trade = await prisma.trade.findUnique({
        where: { id: tradeId },
      });

      if (!trade) throw new Error("Trade not found");

      const toUserId =
        trade.buyerId === context.user.id ? trade.sellerId : trade.buyerId;

      const rating = await prisma.rating.create({
        data: {
          tradeId,
          fromUserId: context.user.id,
          toUserId,
          score,
          comment,
          tags: tags || [],
        },
        include: {
          fromUser: true,
          toUser: true,
          trade: true,
        },
      });

      // Update user's average rating
      const userRatings = await prisma.rating.findMany({
        where: { toUserId },
      });

      const avgRating =
        userRatings.reduce((sum: number, r: any) => sum + r.score, 0) /
        userRatings.length;

      await prisma.user.update({
        where: { id: toUserId },
        data: { averageRating: avgRating },
      });

      return rating;
    },

    activateFlashTrust: async (_: any, { tier }: { tier: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days boost
      
      return prisma.user.update({
        where: { id: context.user.id },
        data: {
          flashTrustTier: tier,
          flashTrustExpiresAt: expiresAt,
        },
      });
    },
    updateProfile: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      return prisma.user.update({
        where: { id: context.user.id },
        data: input,
      });
    },

    refreshFairScore: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const fairScoreData = await fairScaleService.getWalletScore(
        context.user.walletAddress,
      );

      const user = await prisma.user.update({
        where: { id: context.user.id },
        data: {
          fairScore: fairScoreData.fairScore,
          walletScore: fairScoreData.walletScore,
          socialScore: fairScoreData.socialScore,
          fairTier: fairScoreData.tier,
          fairBadges: fairScoreData.badges,
          kycVerified: fairScoreData.socialScore > 500 ? true : context.user.kycVerified,
          lastScoreUpdate: new Date(),
        },
      });

      // Track history
      await prisma.fairScoreHistory.create({
        data: {
          walletAddress: user.walletAddress,
          fairScore: fairScoreData.fairScore,
          walletScore: fairScoreData.walletScore,
          socialScore: fairScoreData.socialScore,
          fairTier: fairScoreData.tier,
          reason: "refresh",
        },
      });

      return user;
    },
  },

  User: {
    starRating: async (user: any) => {
      // Use fairScore from DB if available, otherwise fetch
      const fairScore = user.fairScore || (await fairScaleService.getWalletScore(user.walletAddress)).fairScore;
      return fairScaleService.calculateStarRating(fairScore);
    },
    capabilities: async (user: any) => {
      const fairScoreData = await fairScaleService.getWalletScore(user.walletAddress);
      const isFlashTrustActive = user.flashTrustExpiresAt && new Date(user.flashTrustExpiresAt) > new Date();
      const boostedTier = isFlashTrustActive ? user.flashTrustTier : undefined;
      return fairScaleService.getTierCapabilities(fairScoreData, boostedTier);
    },
    safetyInsight: async (user: any) => {
      const fairScoreData = await fairScaleService.getWalletScore(user.walletAddress);
      return fairScaleService.getSafetyRecommendation(fairScoreData);
    },
    airdropPredictions: async (user: any) => {
      const fairScoreData = await fairScaleService.getWalletScore(user.walletAddress);
      return fairScaleService.getAirdropPredictions(fairScoreData);
    },
    totalVolume: async (user: any) => {
      const trades = await prisma.trade.findMany({
        where: {
          OR: [{ buyerId: user.id }, { sellerId: user.id }],
          status: "COMPLETED",
        },
        select: { fiatAmount: true },
      });
      return trades.reduce((sum, t) => sum + Number(t.fiatAmount), 0);
    },
    cancelledTrades: (user: any) => user.cancelledTrades || 0,
    disputedTrades: (user: any) => user.disputedTrades || 0,
  },
};
