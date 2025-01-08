import { DataService } from '../../../src/services/DataService';
import { Repository } from 'typeorm';
import { Data, Usage } from '../../../src/models';
import { Encryption } from '../../../src/utils/encryption';
import { DataType, PermissionLevel } from '../../../src/types';
import { AppError } from '../../../src/middlewares/errorHandler';

describe('DataService', () => {
    let dataService: DataService;
    let mockDataRepo: jest.Mocked<Repository<Data>>;
    let mockUsageRepo: jest.Mocked<Repository<Usage>>;
    let mockArweave: any;
    let mockEncryption: jest.Mocked<Encryption>;

    beforeEach(() => {
        mockDataRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn()
        } as any;

        mockUsageRepo = {
            save: jest.fn()
        } as any;

        mockArweave = {
            createTransaction: jest.fn(),
            transactions: {
                sign: jest.fn(),
                post: jest.fn(),
                get: jest.fn(),
                getData: jest.fn()
            }
        };

        mockEncryption = {
            encrypt: jest.fn(),
            decrypt: jest.fn()
        } as any;

        dataService = new DataService(
            mockDataRepo,
            mockUsageRepo,
            mockArweave,
            mockEncryption
        );
    });

    describe('storeData', () => {
        it('should successfully store data', async () => {
            const input = {
                data: { test: 'data' },
                type: DataType.CUSTOM,
                permissions: PermissionLevel.PUBLIC
            };
            const userId = 'test-user';

            mockArweave.createTransaction.mockResolvedValue({
                id: 'test-transaction-id',
                addTag: jest.fn()
            });

            const result = await dataService.storeData(input, userId);

            expect(result).toHaveProperty('id', 'test-transaction-id');
            expect(mockDataRepo.save).toHaveBeenCalled();
            expect(mockArweave.transactions.sign).toHaveBeenCalled();
            expect(mockArweave.transactions.post).toHaveBeenCalled();
        });

        it('should encrypt private data', async () => {
            const input = {
                data: { test: 'data' },
                type: DataType.CUSTOM,
                permissions: PermissionLevel.PRIVATE
            };
            const userId = 'test-user';

            mockEncryption.encrypt.mockResolvedValue({
                encryptedData: 'encrypted',
                iv: 'test-iv',
                tag: 'test-tag'
            });

            await dataService.storeData(input, userId);

            expect(mockEncryption.encrypt).toHaveBeenCalled();
        });
    });

    describe('retrieveData', () => {
        it('should retrieve public data', async () => {
            const id = 'test-id';
            const userId = 'test-user';

            mockDataRepo.findOne.mockResolvedValue({
                id,
                permissionLevel: PermissionLevel.PUBLIC,
                metadata: {}
            } as Data);

            mockArweave.transactions.getData.mockResolvedValue(
                JSON.stringify({ test: 'data' })
            );

            const result = await dataService.retrieveData(id, userId);

            expect(result).toHaveProperty('data');
            expect(result.data).toEqual({ test: 'data' });
        });

        it('should throw error for unauthorized access', async () => {
            const id = 'test-id';
            const userId = 'test-user';

            mockDataRepo.findOne.mockResolvedValue({
                id,
                creator: 'other-user',
                permissionLevel: PermissionLevel.PRIVATE,
                metadata: {}
            } as Data);

            await expect(dataService.retrieveData(id, userId))
                .rejects
                .toThrow(AppError);
        });
    });
});