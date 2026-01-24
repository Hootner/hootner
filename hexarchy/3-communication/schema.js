// GraphQL Schema Definition
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    email: String!
    username: String!
    displayName: String
    avatar: String
    bio: String
    role: String!
    verified: Boolean!
    createdAt: DateTime!
    videos: [Video!]!
    playlists: [Playlist!]!
    subscription: Subscription
    followers: [User!]!
    following: [User!]!
    followerCount: Int!
    followingCount: Int!
    isFollowing: Boolean!
  }

  type Video {
    id: ID!
    title: String!
    description: String
    url: String!
    thumbnailUrl: String
    duration: Int
    views: Int!
    likes: Int!
    category: String
    status: String!
    userId: String!
    author: User!
    comments: [Comment!]!
    commentCount: Int!
    isLiked: Boolean!
    relatedVideos: [Video!]!
    canEdit: Boolean!
    analytics: VideoAnalytics
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Comment {
    id: ID!
    text: String!
    videoId: String!
    userId: String!
    author: User!
    parentId: String
    replies: [Comment!]!
    replyCount: Int!
    likes: Int!
    isPinned: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Playlist {
    id: ID!
    title: String!
    description: String
    userId: String!
    creator: User!
    videos: [Video!]!
    videoCount: Int!
    totalDuration: Int!
    isPublic: Boolean!
    thumbnail: String
    canEdit: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Payment {
    id: ID!
    amount: Float!
    currency: String!
    status: String!
    userId: String!
    stripePaymentId: String
    refundedAmount: Float
    createdAt: DateTime!
  }

  type Subscription {
    id: ID!
    userId: String!
    plan: String!
    status: String!
    currentPeriodStart: DateTime!
    currentPeriodEnd: DateTime!
    cancelAtPeriodEnd: Boolean!
    stripeSubscriptionId: String
  }

  type Notification {
    id: ID!
    userId: String!
    type: String!
    title: String!
    message: String!
    data: JSON
    read: Boolean!
    createdAt: DateTime!
  }

  type VideoAnalytics {
    videoId: String!
    totalViews: Int!
    uniqueViews: Int!
    avgWatchTime: Float!
    completionRate: Float!
    likes: Int!
    comments: Int!
    shares: Int!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type SuccessResponse {
    success: Boolean!
    message: String
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
    displayName: String
  }

  input VideoUploadInput {
    title: String!
    description: String
    category: String
    url: String!
    thumbnail: String
    duration: Int
  }

  input VideoUpdateInput {
    title: String
    description: String
    category: String
    thumbnail: String
  }

  input CommentInput {
    videoId: String!
    text: String!
    parentId: String
  }

  input PlaylistInput {
    title: String!
    description: String
    isPublic: Boolean
  }

  input PaymentInput {
    amount: Float!
    currency: String!
    paymentMethodId: String!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User

    # Video queries
    video(id: ID!): Video
    videos(limit: Int, category: String): [Video!]!
    trendingVideos(limit: Int): [Video!]!
    userVideos(userId: ID!, limit: Int): [Video!]!

    # Comment queries
    comment(id: ID!): Comment
    videoComments(videoId: ID!, limit: Int): [Comment!]!
    commentReplies(commentId: ID!, limit: Int): [Comment!]!

    # Playlist queries
    playlist(id: ID!): Playlist
    playlists(limit: Int): [Playlist!]!
    userPlaylists(userId: ID!, limit: Int): [Playlist!]!

    # Notification queries
    notifications(limit: Int): [Notification!]!
    unreadNotifications(limit: Int): [Notification!]!
    unreadCount: Int!
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: SuccessResponse!

    # Video mutations
    uploadVideo(input: VideoUploadInput!): Video!
    updateVideo(id: ID!, input: VideoUpdateInput!): Video!
    deleteVideo(id: ID!): SuccessResponse!
    likeVideo(id: ID!): Video!
    publishVideo(id: ID!): Video!

    # Comment mutations
    createComment(input: CommentInput!): Comment!
    updateComment(id: ID!, text: String!): Comment!
    deleteComment(id: ID!): SuccessResponse!
    likeComment(id: ID!): Comment!

    # Playlist mutations
    createPlaylist(input: PlaylistInput!): Playlist!
    updatePlaylist(id: ID!, input: PlaylistInput!): Playlist!
    deletePlaylist(id: ID!): SuccessResponse!
    addVideoToPlaylist(playlistId: ID!, videoId: ID!): Playlist!
    removeVideoFromPlaylist(playlistId: ID!, videoId: ID!): Playlist!

    # Payment mutations
    createPayment(input: PaymentInput!): Payment!

    # Subscription mutations
    createSubscription(plan: String!, paymentMethodId: String!, trialDays: Int): Subscription!
    cancelSubscription: Subscription!

    # Notification mutations
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: SuccessResponse!
  }

  type Subscription {
    videoUploaded: Video!
    videoProcessed(videoId: ID!): Video!
    commentAdded(videoId: ID!): Comment!
    notificationReceived: Notification!
    userActivity(userId: ID!): JSON!
    likeReceived: JSON!
  }
`;

export default typeDefs;
