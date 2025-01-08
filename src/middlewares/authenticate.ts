import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { logger } from '../config/logger';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        roles: string[];
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(401, 'No authorization token provided');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AppError(401, 'Invalid authorization header format');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            roles: decoded.roles || []
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new AppError(401, 'Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
            next(new AppError(401, 'Token expired'));
        } else {
            next(error);
        }
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AppError(401, 'User not authenticated');
        }

        const hasRole = req.user.roles.some(role => roles.includes(role));
        if (!hasRole) {
            throw new AppError(403, 'Insufficient permissions');
        }

        next();
    };
}; 