import { PubSub } from 'graphql-subscriptions';
import { GraphQLContext } from './context';
import { withFilter } from 'graphql-subscriptions';
import { AppError } from '../../middlewares/errorHandler';
import { DataType, PermissionLevel } from '../../types';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    getData: async (_, { id }, { req, services }: GraphQLContext) => {
      return await services.data.retrieveData(id, req.user.id);
    },

    queryData: async (_, args, { req, services }: GraphQLContext) => {
      const { type, creator, limit = 10, cursor } = args;
      const results = await services.data.queryData({
        type,
        creator: creator || req.user.id,
        limit,
        cursor
      });

      return {
        edges: results.items.map(item => ({
          node: item,
          cursor: Buffer.from(item.id).toString('base64')
        })),
        pageInfo: {
          hasNextPage: results.hasMore,
          endCursor: results.lastCursor
        },
        totalCount: results.total
      };
    },

    getUsageStats: async (_, args, { req, services }: GraphQLContext) => {
      return await services.analytics.getUsageStatistics({
        ...args,
        userId: req.user.id
      });
    },

    getTokenBalance: async (_, __, { req, services }: GraphQLContext) => {
      return await services.token.getBalance(req.user.id);
    },

    getTokenTransactions: async (_, args, { req, services }: GraphQLContext) => {
      return await services.token.getTransactionHistory(
        req.user.id,
        args.limit,
        args.offset
      );
    }
  },

  Mutation: {
    storeData: async (_, { input }, { req, services }: GraphQLContext) => {
      const result = await services.data.storeData(input, req.user.id);
      pubsub.publish('DATA_UPDATED', { 
        dataUpdated: result,
        type: input.type
      });
      return result;
    },

    storeBatchData: async (_, { inputs }, { req, services }: GraphQLContext) => {
      const results = await services.data.storeBatchData(inputs, req.user.id);
      results.successful.forEach(data => {
        pubsub.publish('DATA_UPDATED', {
          dataUpdated: data,
          type: data.type
        });
      });
      return results;
    },

    updatePermissions: async (_, args, { req, services }: GraphQLContext) => {
      const result = await services.data.updatePermissions(
        args.id,
        args.level,
        args.allowedUsers,
        req.user.id
      );
      pubsub.publish('DATA_UPDATED', { 
        dataUpdated: result,
        type: result.type
      });
      return result;
    },

    transferTokens: async (_, args, { req, services }: GraphQLContext) => {
      const result = await services.token.transfer(
        req.user.id,
        args.recipient,
        args.amount
      );
      pubsub.publish('TOKEN_TRANSFERRED', { 
        tokenTransferred: result,
        userId: [req.user.id, args.recipient]
      });
      return result;
    }
  },

  Subscription: {
    dataUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['DATA_UPDATED']),
        (payload, variables) => {
          if (!variables.type) return true;
          return payload.dataUpdated.type === variables.type;
        }
      )
    },

    dataStream: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['DATA_STREAM']),
        (payload, variables) => {
          if (!variables.type) return true;
          return payload.dataStream.type === variables.type;
        }
      )
    },

    usageTracked: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['USAGE_TRACKED']),
        (payload, variables) => {
          if (!variables.dataId) return true;
          return payload.usageTracked.dataId === variables.dataId;
        }
      )
    },

    tokenTransferred: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['TOKEN_TRANSFERRED']),
        (payload, variables) => {
          if (!variables.userId) return true;
          return payload.tokenTransferred.userId === variables.userId;
        }
      )
    },

    balanceChanged: {
      subscribe: () => pubsub.asyncIterator(['BALANCE_CHANGED'])
    }
  }
}; 