import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateDataInput = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { data } = req.body;
    
    // Check data size
    const dataSize = Buffer.from(JSON.stringify(data)).length;
    if (dataSize > 10_000_000) { // 10MB limit
        throw new AppError(413, 'Data size exceeds limit');
    }

    // Additional validation as needed
    
    next();
}; 