export const typeDefs = `#graphql
  type User {
    id: ID!
    walletAddress: String!
    fairScore: Int
    walletScore: Int
    socialScore: Int
    pillars: JSON
    fairTier: String
    starRating: Int
    fairBadges: [String!]
    username: String
    email: String
    phoneNumber: String
    bio: String
    profileImage: String
    kycVerified: Boolean!
    totalTrades: Int!
    completedTrades: Int!
    cancelledTrades: Int!
    disputedTrades: Int!
    totalVolume: Float!
    averageRating: Float!
    isActive: Boolean!
    createdAt: String!
    capabilities: UserCapabilities
    safetyInsight: String
    airdropPredictions: [String!]
    flashTrustExpiresAt: String
    flashTrustTier: String
  }

  type UserCapabilities {
    canSell: Boolean!
    maxTradeAmount: Float!
    dailyLimit: Float!
    feePercentage: Float!
    maxActiveOffers: Int!
    requiresReview: Boolean!
    escrowLockDuration: Int!
  }

  type Offer {
    id: ID!
    seller: User!
    cryptoAsset: String!
    cryptoAmount: Float!
    fiatCurrency: String!
    fiatAmount: Float!
    exchangeRate: Float!
    paymentMethod: String!
    paymentDetails: JSON!
    minLimit: Float!
    maxLimit: Float!
    location: String
    terms: String
    status: String!
    viewCount: Int!
    createdAt: String!
  }

  type Trade {
    id: ID!
    offer: Offer!
    buyer: User!
    seller: User!
    cryptoAmount: Float!
    fiatAmount: Float!
    fee: Float!
    feePercentage: Float!
    status: String!
    escrowSignature: String
    releaseSignature: String
    createdAt: String!
    completedAt: String
    expiresAt: String
    requiresReview: Boolean!
  }

  type Message {
    id: ID!
    trade: Trade!
    sender: User!
    content: String!
    messageType: String!
    attachmentUrl: String
    isRead: Boolean!
    createdAt: String!
  }

  type Rating {
    id: ID!
    trade: Trade!
    fromUser: User!
    toUser: User!
    score: Int!
    comment: String
    tags: [String!]
    createdAt: String!
  }

  scalar JSON

  type Query {
    me: User
    user(walletAddress: String!): User
    offers(
      cryptoAsset: String
      fiatCurrency: String
      paymentMethod: String
      minFairScore: Int
      limit: Int
      offset: Int
    ): [Offer!]!
    offer(id: ID!): Offer
    myOffers: [Offer!]!
    trade(id: ID!): Trade
    myTrades(status: String): [Trade!]!
    tradeMessages(tradeId: ID!): [Message!]!
  }

  type Mutation {
    # Auth
    login(walletAddress: String!): AuthPayload!
    
    # Offers
    createOffer(input: CreateOfferInput!): Offer!
    updateOffer(id: ID!, input: UpdateOfferInput!): Offer!
    deleteOffer(id: ID!): Boolean!
    
    # Trades
    initiateTrade(offerId: ID!, amount: Float!): Trade!
    confirmEscrow(tradeId: ID!, signature: String!): Trade!
    markFiatSent(tradeId: ID!): Trade!
    confirmFiatReceived(tradeId: ID!): Trade!
    releaseCrypto(tradeId: ID!, signature: String!): Trade!
    cancelTrade(tradeId: ID!, reason: String!): Trade!
    disputeTrade(tradeId: ID!, reason: String!, evidence: JSON): Trade!
    
    # Messages
    sendMessage(tradeId: ID!, content: String!, messageType: String): Message!
    
    # Ratings
    rateTrade(tradeId: ID!, score: Int!, comment: String, tags: [String!]): Rating!
    
    # User
    activateFlashTrust(tier: String!): User!
    updateProfile(input: UpdateProfileInput!): User!
    refreshFairScore: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateOfferInput {
    cryptoAsset: String!
    cryptoAmount: Float!
    fiatCurrency: String!
    fiatAmount: Float!
    paymentMethod: String!
    paymentDetails: JSON!
    minLimit: Float!
    maxLimit: Float!
    location: String
    terms: String
  }

  input UpdateOfferInput {
    cryptoAmount: Float
    fiatAmount: Float
    minLimit: Float
    maxLimit: Float
    terms: String
    status: String
  }

  input UpdateProfileInput {
    username: String
    email: String
    phoneNumber: String
    bio: String
    profileImage: String
  }
`;
