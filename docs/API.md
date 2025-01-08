# API Documentation

## Overview
This document describes the REST and GraphQL APIs for the Arweave Data Repository.

## Authentication
All API endpoints require authentication unless explicitly marked as public.

### Authentication Header
```http
Authorization: Bearer <jwt_token>
```

## REST API Endpoints

### Data Management

#### Store Data
```http
POST /api/v1/data
Content-Type: application/json

{
  "data": any,
  "type": DataType,
  "permissions": PermissionLevel,
  "metadata": {
    "tags": [
      { "name": string, "value": string }
    ]
  }
}
```

#### Retrieve Data
```http
GET /api/v1/data/:id
```

#### Query Data
```http
GET /api/v1/data?type=&creator=&limit=&cursor=
```

### Token Operations

#### Get Balance
```http
GET /api/v1/tokens/balance
```

#### Transfer Tokens
```http
POST /api/v1/tokens/transfer
Content-Type: application/json

{
  "recipient": string,
  "amount": number
}
```

## GraphQL API

### Queries
```graphql
query GetData($id: ID!) {
  getData(id: $id) {
    id
    type
    metadata {
      size
      hash
    }
  }
}

query QueryData($type: DataType, $limit: Int) {
  queryData(type: $type, limit: $limit) {
    edges {
      node {
        id
        type
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Mutations
```graphql
mutation StoreData($input: DataInput!) {
  storeData(input: $input) {
    id
    type
  }
}

mutation UpdatePermissions($id: ID!, $level: PermissionLevel!) {
  updatePermissions(id: $id, level: $level) {
    id
    permissionLevel
  }
}
```

### Subscriptions
```graphql
subscription OnDataUpdated($type: DataType) {
  dataUpdated(type: $type) {
    id
    type
    metadata {
      size
      hash
    }
  }
}
```

## Error Handling
All endpoints return standard error responses:
```json
{
  "error": {
    "code": string,
    "message": string,
    "details": object
  }
}
``` 