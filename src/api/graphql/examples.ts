// Example GraphQL queries and mutations for testing

/**
 * Data Queries
 */

// Get single data item
const GET_DATA = `
  query GetData($id: ID!) {
    getData(id: $id) {
      id
      creator
      type
      permissionLevel
      metadata {
        size
        hash
        tags {
          name
          value
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// Query data with filters and pagination
const QUERY_DATA = `
  query QueryData(
    $type: DataType
    $creator: String
    $limit: Int
    $cursor: String
  ) {
    queryData(
      type: $type
      creator: $creator
      limit: $limit
      cursor: $cursor
    ) {
      edges {
        node {
          id
          type
          permissionLevel
          metadata {
            size
            hash
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// Get usage statistics
const GET_USAGE_STATS = `
  query GetUsageStats(
    $startDate: String
    $endDate: String
    $type: DataType
  ) {
    getUsageStats(
      startDate: $startDate
      endDate: $endDate
      type: $type
    ) {
      totalUploads
      totalDownloads
      totalSize
      uniqueUsers
      typeDistribution
    }
  }
`;

/**
 * Data Mutations
 */

// Store single data item
const STORE_DATA = `
  mutation StoreData($input: DataInput!) {
    storeData(input: $input) {
      id
      type
      permissionLevel
      metadata {
        size
        hash
        tags {
          name
          value
        }
      }
    }
  }
`;

// Store batch data
const STORE_BATCH_DATA = `
  mutation StoreBatchData($inputs: [DataInput!]!) {
    storeBatchData(inputs: $inputs) {
      successful {
        id
        type
        permissionLevel
      }
      failed {
        data
        error
      }
    }
  }
`;

// Update permissions
const UPDATE_PERMISSIONS = `
  mutation UpdatePermissions(
    $id: ID!
    $level: PermissionLevel!
    $allowedUsers: [String!]
  ) {
    updatePermissions(
      id: $id
      level: $level
      allowedUsers: $allowedUsers
    ) {
      id
      permissionLevel
    }
  }
`;

/**
 * Token Operations
 */

// Get token balance
const GET_TOKEN_BALANCE = `
  query GetTokenBalance {
    getTokenBalance {
      userId
      balance
      lastUpdated
    }
  }
`;

// Transfer tokens
const TRANSFER_TOKENS = `
  mutation TransferTokens($recipient: String!, $amount: Float!) {
    transferTokens(recipient: $recipient, amount: $amount) {
      id
      type
      amount
      timestamp
      reason
    }
  }
`;

/**
 * Subscriptions
 */

// Subscribe to data updates
const SUBSCRIBE_TO_DATA_UPDATES = `
  subscription OnDataUpdated($type: DataType) {
    dataUpdated(type: $type) {
      id
      type
      metadata {
        size
        hash
      }
      createdAt
    }
  }
`;

// Subscribe to usage tracking
const SUBSCRIBE_TO_USAGE = `
  subscription OnUsageTracked($dataId: ID) {
    usageTracked(dataId: $dataId) {
      id
      dataId
      userId
      accessType
      timestamp
    }
  }
`; 