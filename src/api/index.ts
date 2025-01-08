import express, { Router } from 'express';
import { body, param } from 'express-validator';
import { DataController } from '../controllers/DataController';
import { DataService } from '../services/DataService';
import { validateRequest, authenticate, rateLimit } from '../middlewares';
import { DataType, PermissionLevel } from '../types';

const router: Router = express.Router();
const dataController = new DataController(new DataService());

/**
 * Data Storage Endpoints
 */

// Store new data with validation
router.post(
    '/data',
    authenticate,
    rateLimit,
    [
        body('data').notEmpty(),
        body('type').isIn(Object.values(DataType)),
        body('metadata').optional(),
        body('permissions').default(PermissionLevel.PRIVATE),
    ],
    validateRequest,
    dataController.createData
);

// Batch store multiple data points
router.post(
    '/data/batch',
    authenticate,
    rateLimit,
    [
        body('items').isArray(),
        body('items.*.data').notEmpty(),
        body('items.*.type').isIn(Object.values(DataType)),
    ],
    validateRequest,
    dataController.createBatchData
);

/**
 * Data Retrieval Endpoints
 */

// Get single data point
router.get(
    '/data/:id',
    authenticate,
    [param('id').notEmpty()],
    validateRequest,
    dataController.getData
);

// Query data with filters
router.get(
    '/data',
    authenticate,
    [
        body('type').optional().isIn(Object.values(DataType)),
        body('startDate').optional().isISO8601(),
        body('endDate').optional().isISO8601(),
        body('limit').optional().isInt({ min: 1, max: 100 }),
        body('offset').optional().isInt({ min: 0 }),
    ],
    validateRequest,
    dataController.queryData
);

// Stream real-time data
router.get(
    '/data/stream',
    authenticate,
    [
        body('types').optional().isArray(),
        body('filter').optional(),
    ],
    validateRequest,
    dataController.streamData
);

/**
 * Data Management Endpoints
 */

// Update data permissions
router.patch(
    '/data/:id/permissions',
    authenticate,
    [
        param('id').notEmpty(),
        body('level').isIn(Object.values(PermissionLevel)),
        body('allowedUsers').optional().isArray(),
    ],
    validateRequest,
    dataController.updatePermissions
);

// Track data usage
router.post(
    '/data/:id/usage',
    authenticate,
    [
        param('id').notEmpty(),
        body('accessType').isIn(['READ', 'QUERY', 'STREAM']),
        body('metadata').optional(),
    ],
    validateRequest,
    dataController.trackUsage
);

/**
 * Analytics Endpoints
 */

// Get usage statistics
router.get(
    '/analytics/usage',
    authenticate,
    [
        body('startDate').optional().isISO8601(),
        body('endDate').optional().isISO8601(),
        body('type').optional().isIn(Object.values(DataType)),
    ],
    validateRequest,
    dataController.getUsageStats
);

// Get data summary
router.get(
    '/analytics/summary',
    authenticate,
    dataController.getDataSummary
);

/**
 * Health Check
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

export default router; 