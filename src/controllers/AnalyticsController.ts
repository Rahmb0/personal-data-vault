import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { logger } from '../config/logger';
import { AppError } from '../middlewares/errorHandler';

export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) {}

    public getUsageStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate, type } = req.query;
            const userId = req.user?.id;

            const stats = await this.analyticsService.getUsageStatistics({
                startDate: startDate as string,
                endDate: endDate as string,
                type: type as string,
                userId
            });

            res.json(stats);
        } catch (error) {
            logger.error('Error retrieving usage stats:', error);
            throw new AppError(500, 'Failed to retrieve usage statistics');
        }
    };

    public getDataSummary = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            const summary = await this.analyticsService.getDataSummary(userId);
            res.json(summary);
        } catch (error) {
            logger.error('Error retrieving data summary:', error);
            throw new AppError(500, 'Failed to retrieve data summary');
        }
    };

    public getTrends = async (req: Request, res: Response): Promise<void> => {
        try {
            const { period, metric } = req.query;
            const userId = req.user?.id;

            const trends = await this.analyticsService.getTrends({
                period: period as string,
                metric: metric as string,
                userId
            });

            res.json(trends);
        } catch (error) {
            logger.error('Error retrieving trends:', error);
            throw new AppError(500, 'Failed to retrieve trends');
        }
    };
} 