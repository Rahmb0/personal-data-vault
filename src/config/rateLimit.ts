import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { logger } from './logger';

interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
    statusCode: number;
    skipFailedRequests?: boolean;
    requestPropertyName?: string;
}

const parseTimeWindow = (window: string): number => {
    const value = parseInt(window);
    const unit = window.slice(-1).toLowerCase();
    
    switch (unit) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        default:
            return value;
    }
};

const createRedisClient = () => {
    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        enableOfflineQueue: false
    });

    redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
    });

    return redis;
};

export const configureRateLimit = (config?: Partial<RateLimitConfig>) => {
    const windowMs = parseTimeWindow(process.env.RATE_LIMIT_WINDOW || '15m');
    const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    const defaultConfig: RateLimitConfig = {
        windowMs,
        max,
        message: 'Too many requests, please try again later.',
        statusCode: 429,
        skipFailedRequests: false
    };

    const finalConfig = { ...defaultConfig, ...config };

    const limiter = rateLimit({
        ...finalConfig,
        store: process.env.RATE_LIMIT_STORAGE_TYPE === 'redis'
            ? new RedisStore({
                client: createRedisClient(),
                prefix: 'rate-limit:',
                windowMs: finalConfig.windowMs
            })
            : undefined,
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                path: req.path
            });
            res.status(finalConfig.statusCode).json({
                error: finalConfig.message,
                retryAfter: Math.ceil(finalConfig.windowMs / 1000)
            });
        }
    });

    return limiter;
};

// Specific rate limiters for different endpoints
export const apiLimiter = configureRateLimit();

export const authLimiter = configureRateLimit({
    windowMs: parseTimeWindow('15m'),
    max: 5,
    message: 'Too many login attempts, please try again later.',
    skipFailedRequests: true
});

export const uploadLimiter = configureRateLimit({
    windowMs: parseTimeWindow('1h'),
    max: 10,
    message: 'Upload limit reached, please try again later.'
});

export const queryLimiter = configureRateLimit({
    windowMs: parseTimeWindow('1m'),
    max: 30,
    message: 'Query limit reached, please try again later.'
}); 