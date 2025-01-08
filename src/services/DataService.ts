import { Repository } from 'typeorm';
import { Data, Usage } from '../models';
import { Encryption } from '../utils/encryption';
import { AppError } from '../middlewares/errorHandler';
import { 
    DataType, 
    PermissionLevel, 
    StorageMetadata, 
    QueryOptions 
} from '../types';
import { logger } from '../config/logger';

export class DataService {
    constructor(
        private dataRepo: Repository<Data>,
        private usageRepo: Repository<Usage>,
        private arweave: any,
        private encryption: Encryption
    ) {}

    async storeData(
        input: {
            data: any;
            type: DataType;
            permissions: PermissionLevel;
            metadata?: Record<string, any>;
        },
        userId: string
    ) {
        try {
            // Encrypt sensitive data if needed
            let processedData = input.data;
            let encryptionMeta = null;

            if (input.permissions === PermissionLevel.PRIVATE) {
                const encryptionKey = await this.generateEncryptionKey();
                const encrypted = await this.encryption.encrypt(input.data, encryptionKey);
                processedData = encrypted.encryptedData;
                encryptionMeta = {
                    iv: encrypted.iv,
                    tag: encrypted.tag,
                    key: encryptionKey
                };
            }

            // Create Arweave transaction
            const transaction = await this.arweave.createTransaction({
                data: JSON.stringify(processedData)
            });

            // Add tags
            transaction.addTag('App-Name', 'personal-data-vault');
            transaction.addTag('Content-Type', 'application/json');
            transaction.addTag('Type', input.type);
            transaction.addTag('Creator', userId);
            transaction.addTag('Permission-Level', input.permissions);

            // Sign and post transaction
            await this.arweave.transactions.sign(transaction);
            await this.arweave.transactions.post(transaction);

            // Store metadata in local database
            const data = new Data();
            data.id = transaction.id;
            data.creator = userId;
            data.type = input.type;
            data.permissionLevel = input.permissions;
            data.metadata = {
                ...input.metadata,
                size: Buffer.from(JSON.stringify(processedData)).length,
                hash: transaction.id,
                encryptionMeta
            };

            await this.dataRepo.save(data);

            return {
                id: transaction.id,
                size: data.metadata.size,
                timestamp: new Date()
            };
        } catch (error) {
            logger.error('Error storing data:', error);
            throw new AppError(500, 'Failed to store data');
        }
    }

    async retrieveData(id: string, userId: string) {
        try {
            // Get metadata from local database
            const data = await this.dataRepo.findOne({ where: { id } });
            if (!data) {
                throw new AppError(404, 'Data not found');
            }

            // Check permissions
            if (data.permissionLevel === PermissionLevel.PRIVATE && data.creator !== userId) {
                throw new AppError(403, 'Access denied');
            }

            // Get data from Arweave
            const transaction = await this.arweave.transactions.get(id);
            let retrievedData = JSON.parse(
                await this.arweave.transactions.getData(id, { decode: true, string: true })
            );

            // Decrypt if necessary
            if (data.metadata.encryptionMeta) {
                retrievedData = await this.encryption.decrypt(
                    retrievedData,
                    data.metadata.encryptionMeta.key,
                    data.metadata.encryptionMeta.iv,
                    data.metadata.encryptionMeta.tag
                );
            }

            // Track usage
            await this.trackUsage(id, userId, 'read');

            return {
                id,
                data: retrievedData,
                metadata: data.metadata,
                timestamp: new Date(transaction.timestamp * 1000)
            };
        } catch (error) {
            logger.error('Error retrieving data:', error);
            throw error instanceof AppError ? error : new AppError(500, 'Failed to retrieve data');
        }
    }

    // ... Additional methods for querying, updating permissions, etc.
} 