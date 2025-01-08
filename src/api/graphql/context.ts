import { Request } from 'express';
import { DataService } from '../../services/DataService';
import { AnalyticsService } from '../../services/AnalyticsService';
import { TokenService } from '../../services/TokenService';

export interface GraphQLContext {
    req: Request;
    services: {
        data: DataService;
        analytics: AnalyticsService;
        token: TokenService;
    };
} 