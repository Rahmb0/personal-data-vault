import { Repository } from 'typeorm';
import { Token } from '../models';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../config/logger';

export class TokenService {
    constructor(private tokenRepo: Repository<Token>) {}

    async getBalance(userId: string): Promise<number> {
        const token = await this.tokenRepo.findOne({ where: { userId } });
        return token?.balance || 0;
    }

    async awardTokens(userId: string, amount: number, reason: string): Promise<void> {
        try {
            let token = await this.tokenRepo.findOne({ where: { userId } });
            
            if (!token) {
                token = new Token();
                token.userId = userId;
                token.balance = 0;
                token.transactions = [];
            }

            token.balance += amount;
            token.transactions.push({
                type: 'earn',
                amount,
                timestamp: new Date(),
                reason
            });

            await this.tokenRepo.save(token);
        } catch (error) {
            logger.error('Error awarding tokens:', error);
            throw new AppError(500, 'Failed to award tokens');
        }
    }

    async spendTokens(userId: string, amount: number, reason: string): Promise<void> {
        try {
            const token = await this.tokenRepo.findOne({ where: { userId } });
            if (!token || token.balance < amount) {
                throw new AppError(400, 'Insufficient token balance');
            }

            token.balance -= amount;
            token.transactions.push({
                type: 'spend',
                amount,
                timestamp: new Date(),
                reason
            });

            await this.tokenRepo.save(token);
        } catch (error) {
            logger.error('Error spending tokens:', error);
            throw error instanceof AppError ? error : new AppError(500, 'Failed to spend tokens');
        }
    }

    async getTransactionHistory(userId: string) {
        const token = await this.tokenRepo.findOne({ where: { userId } });
        return token?.transactions || [];
    }
} 