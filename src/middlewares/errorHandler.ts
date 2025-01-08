import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: 'error',
            code: error.code,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }

    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: error.message
        });
    }

    // Handle unknown errors
    return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && {
            actualError: error.message,
            stack: error.stack
        })
    });
}; 