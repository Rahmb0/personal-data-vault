import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('tokens')
export class Token {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column('decimal', { precision: 18, scale: 6 })
    balance: number;

    @Column('json')
    transactions: Array<{
        type: 'earn' | 'spend';
        amount: number;
        timestamp: Date;
        reason: string;
    }>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 