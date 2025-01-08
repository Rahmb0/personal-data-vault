import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ApolloServer } from 'apollo-server-express';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { rateLimiter } from './middlewares/rateLimiter';
import { typeDefs, resolvers } from './api/graphql';
import { logger } from './config/logger';

export class App {
    public app: Express;
    private apolloServer: ApolloServer;

    constructor() {
        this.app = express();
        this.apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
            context: ({ req }) => ({ req }),
            introspection: process.env.NODE_ENV !== 'production',
            playground: process.env.NODE_ENV !== 'production'
        });

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeGraphQL();
        this.initializeErrorHandling();
    }

    private async initializeMiddlewares(): void {
        // Security middlewares
        this.app.use(helmet());
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Basic middlewares
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(compression());

        // Custom middlewares
        this.app.use(requestLogger);
        this.app.use(rateLimiter);
    }

    private initializeRoutes(): void {
        routes.init(this.app);
    }

    private async initializeGraphQL(): Promise<void> {
        await this.apolloServer.start();
        this.apolloServer.applyMiddleware({ app: this.app });
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }
}

export const app = new App().app; 