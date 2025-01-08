import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne
} from 'typeorm';
import { Data } from './Data';

@Entity('usage')
export class Usage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Data, data => data.usages)
    data: Data;

    @Column()
    userId: string;

    @Column()
    accessType: 'read' | 'query';

    @Column('json', { nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    timestamp: Date;
} 