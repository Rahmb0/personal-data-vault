import { WebSocketLink } from '@apollo/client/link/ws';
import { Client } from 'graphql-ws';

// Setup WebSocket client
const wsClient = new Client({
  url: 'ws://localhost:3000/graphql',
  connectionParams: {
    authToken: 'user-auth-token'
  }
});

// Subscribe to data updates
const dataSubscription = wsClient.subscribe({
  query: SUBSCRIBE_TO_DATA_UPDATES,
  variables: { type: "CUSTOM" }
}, {
  next: (data) => {
    console.log('Received data update:', data);
  },
  error: (error) => {
    console.error('Subscription error:', error);
  },
  complete: () => {
    console.log('Subscription completed');
  }
});

// Subscribe to usage tracking
const usageSubscription = wsClient.subscribe({
  query: SUBSCRIBE_TO_USAGE,
  variables: { dataId: "specific-data-id" }
}, {
  next: (data) => {
    console.log('Usage tracked:', data);
  },
  error: (error) => {
    console.error('Subscription error:', error);
  }
}); 