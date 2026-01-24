import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($walletAddress: String!) {
    login(walletAddress: $walletAddress) {
      token
      user {
        id
        walletAddress
        fairScore
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
        capabilities {
          canSell
          maxTradeAmount
          dailyLimit
          feePercentage
          maxActiveOffers
          requiresReview
        }
      }
    }
  }
`;

export const CREATE_OFFER_MUTATION = gql`
  mutation CreateOffer($input: CreateOfferInput!) {
    createOffer(input: $input) {
      id
      cryptoAsset
      cryptoAmount
      fiatCurrency
      fiatAmount
      exchangeRate
      paymentMethod
      status
      createdAt
    }
  }
`;

export const INITIATE_TRADE_MUTATION = gql`
  mutation InitiateTrade($offerId: ID!, $amount: Float!) {
    initiateTrade(offerId: $offerId, amount: $amount) {
      id
      status
      cryptoAmount
      fiatAmount
      fee
      feePercentage
      expiresAt
      buyer {
        id
        walletAddress
        fairScore
        fairTier
      }
      seller {
        id
        walletAddress
        fairScore
        fairTier
      }
    }
  }
`;

export const MARK_FIAT_SENT_MUTATION = gql`
  mutation MarkFiatSent($tradeId: ID!) {
    markFiatSent(tradeId: $tradeId) {
      id
      status
      fiatSentAt
    }
  }
`;

export const CONFIRM_FIAT_RECEIVED_MUTATION = gql`
  mutation ConfirmFiatReceived($tradeId: ID!) {
    confirmFiatReceived(tradeId: $tradeId) {
      id
      status
      fiatConfirmedAt
    }
  }
`;

export const RELEASE_CRYPTO_MUTATION = gql`
  mutation ReleaseCrypto($tradeId: ID!, $signature: String!) {
    releaseCrypto(tradeId: $tradeId, signature: $signature) {
      id
      status
      releaseSignature
      completedAt
    }
  }
`;

export const CONFIRM_ESCROW_MUTATION = gql`
  mutation ConfirmEscrow($tradeId: ID!, $signature: String!) {
    confirmEscrow(tradeId: $tradeId, signature: $signature) {
      id
      status
      escrowSignature
      escrowedAt
    }
  }
`;

export const RATE_TRADE_MUTATION = gql`
  mutation RateTrade(
    $tradeId: ID!
    $score: Int!
    $comment: String
    $tags: [String!]
  ) {
    rateTrade(
      tradeId: $tradeId
      score: $score
      comment: $comment
      tags: $tags
    ) {
      id
      score
      comment
      tags
      createdAt
    }
  }
`;

export const REFRESH_FAIRSCORE_MUTATION = gql`
  mutation RefreshFairScore {
    refreshFairScore {
      id
      fairScore
      walletScore
      socialScore
      fairTier
      starRating
      fairBadges
      capabilities {
        canSell
        maxTradeAmount
        dailyLimit
        feePercentage
        requiresReview
      }
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($tradeId: ID!, $content: String!, $messageType: String) {
    sendMessage(tradeId: $tradeId, content: $content, messageType: $messageType) {
      id
      content
      messageType
      createdAt
      sender {
        id
        username
      }
    }
  }
`;
