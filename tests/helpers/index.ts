import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../../src/models';

export const createTestUser = async () => {
    const userRepo = getRepository(User);
    const user = userRepo.create({
        id: 'test-user',
        email: 'test@example.com'
    });
    return await userRepo.save(user);
};

export const generateAuthToken = (user: any) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
    );
};

export const clearDatabase = async () => {
    const entities = getRepository(User).manager.connection.entityMetadatas;
    for (const entity of entities) {
        const repository = getRepository(entity.name);
        await repository.query(`DELETE FROM ${entity.tableName}`);
    }
}; 