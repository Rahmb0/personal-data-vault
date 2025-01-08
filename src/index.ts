import { config } from 'dotenv';
import { app } from './app';
import { logger } from './config/logger';
import { initDatabase } from './config/database';
import { initArweave } from './config/arweave';

// Load environment variables
config();

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Initialize database
        await initDatabase();
        
        // Initialize Arweave
        await initArweave();

        // Start server
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`GraphQL Playground: http://localhost:${PORT}/graphql`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error: Error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

startServer(); 