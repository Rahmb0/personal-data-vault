export interface StorageMetadata {
    creator: string;
    timestamp: number;
    type: DataType;
    size: number;
    hash: string;
    permissionLevel: PermissionLevel;
    tags?: Array<{ name: string; value: string }>;
}

export interface QueryOptions {
    creator?: string;
    type?: DataType;
    startDate?: string;
    endDate?: string;
    limit?: number;
    cursor?: string;
}

export interface UsageMetrics {
    reads: number;
    writes: number;
    uniqueUsers: number;
    totalSize: number;
    lastAccessed: Date;
} 