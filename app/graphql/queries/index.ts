import { gql } from "@apollo/client";

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      walletAddress
      fairScore
      pillars
      walletScore
      socialScore
      fairTier
      starRating
      fairBadges
      username
      email
      totalTrades
      completedTrades
      averageRating
      kycVerified
      safetyInsight
      airdropPredictions
      capabilities {
        canSell
        maxTradeAmount
        dailyLimit
        feePercentage
        maxActiveOffers
        requiresReview
        escrowLockDuration
      }
    }
  }
`;

export const GET_OFFERS_QUERY = gql`
  query GetOffers(
    $cryptoAsset: String
    $fiatCurrency: String
    $paymentMethod: String
    $minFairScore: Int
    $limit: Int
    $offset: Int
  ) {
    offers(
      cryptoAsset: $cryptoAsset
      fiatCurrency: $fiatCurrency
      paymentMethod: $paymentMethod
      minFairScore: $minFairScore
      limit: $limit
      offset: $offset
    ) {
      id
      cryptoAsset
      cryptoAmount
      fiatCurrency
      fiatAmount
      exchangeRate
      paymentMethod
      minLimit
      maxLimit
      location
      terms
      status
      viewCount
      createdAt
      seller {
        id
        walletAddress
        fairScore
        walletScore
        socialScore
        fairTier
        starRating
        fairBadges
        username
        averageRating
        completedTrades
        totalTrades
      }
    }
  }
`;

export const GET_OFFER_QUERY = gql`
  query GetOffer($id: ID!) {
    offer(id: $id) {
      id
      cryptoAsset
      cryptoAmount
      fiatCurrency
      fiatAmount
      exchangeRate
      paymentMethod
      paymentDetails
      minLimit
      maxLimit
      location
      terms
      status
      viewCount
      createdAt
      seller {
        id
        walletAddress
        fairScore
        walletScore
        socialScore
        fairTier
        starRating
        fairBadges
        username
        averageRating
        completedTrades
        totalTrades
      }
    }
  }
`;

export const GET_MY_OFFERS_QUERY = gql`
  query GetMyOffers {
    myOffers {
      id
      cryptoAsset
      cryptoAmount
      fiatCurrency
      fiatAmount
      exchangeRate
      paymentMethod
      status
      viewCount
      createdAt
    }
  }
`;

export const GET_MY_TRADES_QUERY = gql`
  query GetMyTrades($status: String) {
    myTrades(status: $status) {
      id
      status
      cryptoAmount
      fiatAmount
      fee
      createdAt
      completedAt
      expiresAt
      buyer {
        id
        walletAddress
        fairScore
        fairTier
        username
      }
      seller {
        id
        walletAddress
        fairScore
        fairTier
        username
      }
      offer {
        cryptoAsset
        fiatCurrency
        paymentMethod
      }
    }
  }
`;

export const GET_TRADE_QUERY = gql`
  query GetTrade($id: ID!) {
    trade(id: $id) {
      id
      status
      cryptoAmount
      fiatAmount
      fee
      feePercentage
      escrowSignature
      releaseSignature
      createdAt
      completedAt
      expiresAt
      buyer {
        id
        walletAddress
        fairScore
        pillars
        fairTier
        username
        averageRating
        safetyInsight
        airdropPredictions
      }
      seller {
        id
        walletAddress
        fairScore
        pillars
        fairTier
        username
        averageRating
        safetyInsight
        airdropPredictions
      }
      offer {
        id
        cryptoAsset
        fiatCurrency
        paymentMethod
        paymentDetails
      }
    }
  }
`;

export const GET_TRADE_MESSAGES_QUERY = gql`
  query GetTradeMessages($tradeId: ID!) {
    tradeMessages(tradeId: $tradeId) {
      id
      content
      messageType
      attachmentUrl
      isRead
      createdAt
      sender {
        id
        walletAddress
        username
      }
    }
  }
`;
