import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany
} from 'typeorm';
import { DataType, PermissionLevel } from '../types';
import { Usage } from './Usage';

@Entity('data')
export class Data {
    @PrimaryColumn()
    id: string; // Arweave transaction ID

    @Column('json')
    metadata: {
        creator: string;
        type: DataType;
        size: number;
        hash: string;
        permissionLevel: PermissionLevel;
        tags: Array<{ name: string; value: string }>;
    };

    @Column()
    creator: string;

    @Column({
        type: 'enum',
        enum: DataType
    })
    type: DataType;

    @Column({
        type: 'enum',
        enum: PermissionLevel,
        default: PermissionLevel.PRIVATE
    })
    permissionLevel: PermissionLevel;

    @Column('simple-array', { nullable: true })
    allowedUsers: string[];

    @OneToMany(() => Usage, usage => usage.data)
    usages: Usage[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 