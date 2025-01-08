import request from 'supertest';
import { app } from '../../../src/app';
import { DataType, PermissionLevel } from '../../../src/types';
import { createTestUser, generateAuthToken } from '../../helpers';

describe('Data API Integration Tests', () => {
    let authToken: string;
    let testUser: any;

    beforeAll(async () => {
        testUser = await createTestUser();
        authToken = generateAuthToken(testUser);
    });

    describe('POST /api/v1/data', () => {
        it('should store data successfully', async () => {
            const response = await request(app)
                .post('/api/v1/data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    data: { test: 'integration' },
                    type: DataType.CUSTOM,
                    permissions: PermissionLevel.PUBLIC
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });

        it('should reject invalid data type', async () => {
            const response = await request(app)
                .post('/api/v1/data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    data: { test: 'integration' },
                    type: 'INVALID_TYPE',
                    permissions: PermissionLevel.PUBLIC
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/data/:id', () => {
        it('should retrieve stored data', async () => {
            // First store some data
            const storeResponse = await request(app)
                .post('/api/v1/data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    data: { test: 'retrieve' },
                    type: DataType.CUSTOM,
                    permissions: PermissionLevel.PUBLIC
                });

            const id = storeResponse.body.id;

            // Then retrieve it
            const response = await request(app)
                .get(`/api/v1/data/${id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual({ test: 'retrieve' });
        });

        it('should handle non-existent data', async () => {
            const response = await request(app)
                .get('/api/v1/data/non-existent-id')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });
}); 