export enum DataType {
    LOCATION = 'location',
    SENSOR = 'sensor',
    ACTIVITY = 'activity',
    ENVIRONMENTAL = 'environmental',
    CUSTOM = 'custom'
}

export enum PermissionLevel {
    PRIVATE = 'private',
    PUBLIC = 'public',
    SHARED = 'shared'
}

export interface DataInput {
    data: any;
    type: DataType;
    permissions?: PermissionLevel;
    metadata?: Record<string, any>;
} 