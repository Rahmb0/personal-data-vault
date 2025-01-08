import { initDatabase } from '../src/config/database';
import { initArweave } from '../src/config/arweave';
import { logger } from '../src/config/logger';

beforeAll(async () => {
    try {
        // Initialize test database
        process.env.NODE_ENV = 'test';
        process.env.DB_NAME = ':memory:';
        
        await initDatabase();
        await initArweave();
        
        logger.info('Test environment setup complete');
    } catch (error) {
        logger.error('Test setup failed:', error);
        throw error;
    }
});

afterAll(async () => {
    // Cleanup
}); 