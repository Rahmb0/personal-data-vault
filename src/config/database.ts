import { createConnection } from 'typeorm';
import { Data, Token, Usage } from '../models';

export const initDatabase = async () => {
    try {
        await createConnection({
            type: process.env.DB_TYPE as any || 'sqlite',
            database: process.env.DB_NAME || 'arweave-data.db',
            entities: [Data, Token, Usage],
            synchronize: process.env.NODE_ENV === 'development',
            logging: process.env.NODE_ENV === 'development'
        });
    } catch (error) {
        throw new Error(`Database initialization failed: ${error.message}`);
    }
}; 