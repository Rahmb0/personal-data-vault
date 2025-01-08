import Arweave from 'arweave';
import { logger } from './logger';

export let arweave: Arweave;

export function initArweave(): void {
  try {
    arweave = new Arweave({
      host: process.env.ARWEAVE_HOST || 'arweave.net',
      port: Number(process.env.ARWEAVE_PORT) || 443,
      protocol: process.env.ARWEAVE_PROTOCOL || 'https'
    });
    
    logger.info('Arweave initialization successful');
  } catch (error) {
    logger.error('Failed to initialize Arweave:', error);
    throw error;
  }
} 