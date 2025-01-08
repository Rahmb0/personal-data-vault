import { Router, Application } from 'express';
import { DataController } from '../controllers/DataController';
import { TokenController } from '../controllers/TokenController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { 
    authenticate, 
    validateRequest, 
    rateLimit, 
    validateDataInput 
} from '../middlewares';
import { body, param } from 'express-validator';
import { DataType, PermissionLevel } from '../types';

export class Routes {
    private readonly router: Router;
    private readonly dataController: DataController;
    private readonly tokenController: TokenController;
    private readonly analyticsController: AnalyticsController;

    constructor() {
        this.router = Router();
        this.dataController = new DataController();
        this.tokenController = new TokenController();
        this.analyticsController = new AnalyticsController();
    }

    public init(app: Application): void {
        // Base API route
        app.use('/api/v1', this.router);
        
        // Set up all routes
        this.setupDataRoutes();
        this.setupTokenRoutes();
        this.setupAnalyticsRoutes();
        this.setupHealthCheck();
    }

    private setupDataRoutes(): void {
        /**
         * Data Storage Routes
         */
        this.router.post(
            '/data',
            authenticate,
            rateLimit,
            [
                body('data').notEmpty().withMessage('Data is required'),
                body('type').isIn(Object.values(DataType))
                    .withMessage('Invalid data type'),
                body('permissions')
                    .optional()
                    .isIn(Object.values(PermissionLevel))
                    .withMessage('Invalid permission level'),
                body('metadata').optional().isObject(),
            ],
            validateRequest,
            validateDataInput,
            this.dataController.createData
        );

        this.router.post(
            '/data/batch',
            authenticate,
            rateLimit,
            [
                body('items').isArray().withMessage('Items must be an array'),
                body('items.*.data').notEmpty(),
                body('items.*.type').isIn(Object.values(DataType)),
            ],
            validateRequest,
            this.dataController.createBatchData
        );

        /**
         * Data Retrieval Routes
         */
        this.router.get(
            '/data/:id',
            authenticate,
            [param('id').notEmpty().withMessage('Transaction ID is required')],
            validateRequest,
            this.dataController.getData
        );

        this.router.get(
            '/data',
            authenticate,
            [
                body('type').optional().isIn(Object.values(DataType)),
                body('startDate').optional().isISO8601(),
                body('endDate').optional().isISO8601(),
                body('limit').optional().isInt({ min: 1, max: 100 }),
                body('cursor').optional().isString(),
            ],
            validateRequest,
            this.dataController.queryData
        );

        /**
         * Data Management Routes
         */
        this.router.patch(
            '/data/:id/permissions',
            authenticate,
            [
                param('id').notEmpty(),
                body('level').isIn(Object.values(PermissionLevel)),
                body('allowedUsers').optional().isArray(),
            ],
            validateRequest,
            this.dataController.updatePermissions
        );

        this.router.post(
            '/data/:id/usage',
            authenticate,
            [
                param('id').notEmpty(),
                body('accessType').isIn(['read', 'query']),
                body('metadata').optional().isObject(),
            ],
            validateRequest,
            this.dataController.trackUsage
        );
    }

    private setupTokenRoutes(): void {
        this.router.get(
            '/tokens/balance',
            authenticate,
            this.tokenController.getBalance
        );

        this.router.post(
            '/tokens/transfer',
            authenticate,
            [
                body('recipient').notEmpty(),
                body('amount').isNumeric(),
            ],
            validateRequest,
            this.tokenController.transfer
        );

        this.router.get(
            '/tokens/history',
            authenticate,
            this.tokenController.getTransactionHistory
        );
    }

    private setupAnalyticsRoutes(): void {
        this.router.get(
            '/analytics/usage',
            authenticate,
            [
                body('startDate').optional().isISO8601(),
                body('endDate').optional().isISO8601(),
                body('type').optional().isIn(Object.values(DataType)),
            ],
            validateRequest,
            this.analyticsController.getUsageStats
        );

        this.router.get(
            '/analytics/summary',
            authenticate,
            this.analyticsController.getDataSummary
        );

        this.router.get(
            '/analytics/trends',
            authenticate,
            [
                query('period').isIn(['day', 'week', 'month', 'year']),
                query('metric').isIn(['uploads', 'downloads', 'tokens']),
            ],
            validateRequest,
            this.analyticsController.getTrends
        );
    }

    private setupHealthCheck(): void {
        this.router.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version,
                environment: process.env.NODE_ENV
            });
        });
    }
}

// Export singleton instance
export const routes = new Routes(); 