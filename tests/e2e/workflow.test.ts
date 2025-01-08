import request from 'supertest';
import { app } from '../../src/app';
import { DataType, PermissionLevel } from '../../src/types';
import { createTestUser, generateAuthToken, clearDatabase } from '../helpers';

describe('End-to-End Workflow Tests', () => {
    let authToken: string;
    let testUser: any;

    beforeAll(async () => {
        testUser = await createTestUser();
        authToken = generateAuthToken(testUser);
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('should complete full data lifecycle', async () => {
        // 1. Store data
        const storeResponse = await request(app)
            .post('/api/v1/data')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                data: { test: 'lifecycle' },
                type: DataType.CUSTOM,
                permissions: PermissionLevel.PUBLIC
            });

        expect(storeResponse.status).toBe(201);
        const dataId = storeResponse.body.id;

        // 2. Retrieve data
        const retrieveResponse = await request(app)
            .get(`/api/v1/data/${dataId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(retrieveResponse.status).toBe(200);
        expect(retrieveResponse.body.data).toEqual({ test: 'lifecycle' });

        // 3. Update permissions
        const updateResponse = await request(app)
            .patch(`/api/v1/data/${dataId}/permissions`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                level: PermissionLevel.PRIVATE
            });

        expect(updateResponse.status).toBe(200);

        // 4. Check usage statistics
        const statsResponse = await request(app)
            .get('/api/v1/analytics/usage')
            .set('Authorization', `Bearer ${authToken}`);

        expect(statsResponse.status).toBe(200);
        expect(statsResponse.body.reads).toBeGreaterThan(0);
    });
}); 