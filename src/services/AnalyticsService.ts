import { Repository } from 'typeorm';
import { Data, Usage, Token } from '../models';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../config/logger';

interface UsageStatistics {
    totalUploads: number;
    totalDownloads: number;
    totalSize: number;
    uniqueUsers: number;
    typeDistribution: Record<string, number>;
}

interface DataSummary {
    totalData: number;
    totalSize: number;
    typeBreakdown: Record<string, number>;
    permissionDistribution: Record<string, number>;
}

interface TrendOptions {
    period: 'day' | 'week' | 'month' | 'year';
    metric: 'uploads' | 'downloads' | 'tokens';
    userId: string;
}

export class AnalyticsService {
    constructor(
        private dataRepo: Repository<Data>,
        private usageRepo: Repository<Usage>,
        private tokenRepo: Repository<Token>
    ) {}

    async getUsageStatistics(params: {
        startDate?: string;
        endDate?: string;
        type?: string;
        userId: string;
    }): Promise<UsageStatistics> {
        try {
            const query = this.usageRepo
                .createQueryBuilder('usage')
                .leftJoinAndSelect('usage.data', 'data');

            if (params.startDate) {
                query.where('usage.timestamp >= :startDate', {
                    startDate: new Date(params.startDate)
                });
            }

            if (params.endDate) {
                query.andWhere('usage.timestamp <= :endDate', {
                    endDate: new Date(params.endDate)
                });
            }

            if (params.type) {
                query.andWhere('data.type = :type', { type: params.type });
            }

            const usages = await query.getMany();
            const uniqueUsers = new Set(usages.map(u => u.userId)).size;

            const typeDistribution = usages.reduce((acc, usage) => {
                const type = usage.data.type;
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                totalUploads: usages.filter(u => u.accessType === 'write').length,
                totalDownloads: usages.filter(u => u.accessType === 'read').length,
                totalSize: usages.reduce((acc, u) => acc + (u.data.metadata.size || 0), 0),
                uniqueUsers,
                typeDistribution
            };
        } catch (error) {
            logger.error('Error getting usage statistics:', error);
            throw new AppError(500, 'Failed to retrieve usage statistics');
        }
    }

    async getDataSummary(userId: string): Promise<DataSummary> {
        try {
            const data = await this.dataRepo.find({ where: { creator: userId } });

            const typeBreakdown = data.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const permissionDistribution = data.reduce((acc, item) => {
                acc[item.permissionLevel] = (acc[item.permissionLevel] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                totalData: data.length,
                totalSize: data.reduce((acc, item) => acc + item.metadata.size, 0),
                typeBreakdown,
                permissionDistribution
            };
        } catch (error) {
            logger.error('Error getting data summary:', error);
            throw new AppError(500, 'Failed to retrieve data summary');
        }
    }

    async getTrends(options: TrendOptions): Promise<any> {
        try {
            const query = this.usageRepo
                .createQueryBuilder('usage')
                .select(`DATE_TRUNC('${options.period}', usage.timestamp)`, 'period')
                .addSelect('COUNT(*)', 'count')
                .where('usage.userId = :userId', { userId: options.userId })
                .groupBy('period')
                .orderBy('period', 'ASC');

            if (options.metric === 'tokens') {
                // Handle token metrics differently
                return await this.getTokenTrends(options);
            }

            const trends = await query.getRawMany();
            return trends.map(trend => ({
                period: trend.period,
                count: parseInt(trend.count)
            }));
        } catch (error) {
            logger.error('Error getting trends:', error);
            throw new AppError(500, 'Failed to retrieve trends');
        }
    }

    private async getTokenTrends(options: TrendOptions): Promise<any> {
        // Implementation for token trends
        // This would analyze token transactions over time
        throw new Error('Not implemented');
    }
} 