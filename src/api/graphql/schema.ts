import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Data {
    id: ID!
    creator: String!
    type: DataType!
    permissionLevel: PermissionLevel!
    metadata: Metadata!
    createdAt: String!
    updatedAt: String!
  }

  type Metadata {
    size: Int!
    hash: String!
    tags: [Tag]
    encryptionMeta: EncryptionMeta
  }

  type Tag {
    name: String!
    value: String!
  }

  type EncryptionMeta {
    iv: String!
    tag: String!
  }

  type Usage {
    id: ID!
    dataId: String!
    userId: String!
    accessType: String!
    timestamp: String!
  }

  type UsageStats {
    totalUploads: Int!
    totalDownloads: Int!
    totalSize: Int!
    uniqueUsers: Int!
    typeDistribution: JSON
  }

  type DataSummary {
    totalData: Int!
    totalSize: Int!
    typeBreakdown: JSON!
    permissionDistribution: JSON!
  }

  enum DataType {
    LOCATION
    SENSOR
    ACTIVITY
    ENVIRONMENTAL
    CUSTOM
  }

  enum PermissionLevel {
    PRIVATE
    PUBLIC
    SHARED
  }

  scalar JSON

  input DataInput {
    data: JSON!
    type: DataType!
    permissions: PermissionLevel
    metadata: JSON
    tags: [TagInput!]
  }

  type Query {
    getData(id: ID!): Data
    queryData(
      type: DataType, 
      creator: String, 
      limit: Int, 
      cursor: String
    ): DataConnection!
    getUsageStats(startDate: String, endDate: String, type: DataType): UsageStats!
    getDataSummary: DataSummary!
    getTrends(
      period: String!, 
      metric: String!
    ): [TrendPoint!]!
    getTokenBalance: TokenBalance!
    getTokenTransactions(
      limit: Int, 
      offset: Int
    ): [TokenTransaction!]!
  }

  type Mutation {
    storeData(input: DataInput!): Data!
    storeBatchData(inputs: [DataInput!]!): BatchResult!
    updatePermissions(
      id: ID!, 
      level: PermissionLevel!, 
      allowedUsers: [String!]
    ): Data!
    deleteData(id: ID!): Boolean!
    trackUsage(
      dataId: ID!, 
      accessType: String!, 
      metadata: JSON
    ): Usage!
    transferTokens(
      recipient: String!, 
      amount: Float!
    ): TokenTransaction!
    claimRewards(dataId: ID!): TokenTransaction!
  }

  type Subscription {
    dataUpdated(type: DataType): Data!
    dataStream(type: DataType): DataStream!
    usageTracked(dataId: ID): Usage!
    tokenTransferred(userId: String): TokenTransaction!
    balanceChanged: TokenBalance!
  }

  type TokenBalance {
    userId: String!
    balance: Float!
    lastUpdated: String!
  }

  type TokenTransaction {
    id: ID!
    type: String!
    amount: Float!
    timestamp: String!
    reason: String!
  }

  type DataStream {
    id: ID!
    data: JSON!
    timestamp: String!
  }

  type BatchResult {
    successful: [Data!]!
    failed: [BatchError!]!
  }

  type BatchError {
    data: JSON!
    error: String!
  }

  type DataConnection {
    edges: [DataEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DataEdge {
    node: Data!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type TrendPoint {
    timestamp: String!
    value: Float!
    metric: String!
  }

  input TagInput {
    name: String!
    value: String!
  }
`; 