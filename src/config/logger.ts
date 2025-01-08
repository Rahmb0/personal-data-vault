import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
};

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.LOG_FORMAT === 'json'
        ? winston.format.json()
        : winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`;
        })
);

const transports = [];

// Console transport
if (process.env.LOG_OUTPUT === 'console' || process.env.NODE_ENV === 'development') {
    transports.push(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                logFormat
            )
        })
    );
}

// File transport
if (process.env.LOG_OUTPUT === 'file') {
    transports.push(
        new DailyRotateFile({
            filename: process.env.LOG_FILE_PATH || 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: logFormat
        })
    );
}

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: logLevels,
    format: logFormat,
    transports
});

// Add custom logging methods
export const logRequest = (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip
        });
    });
    next();
};

export const logError = (error: Error, context?: any) => {
    logger.error(error.message, {
        stack: error.stack,
        ...context
    });
}; 