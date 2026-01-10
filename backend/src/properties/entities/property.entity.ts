import { Lead } from 'src/leads/entities/lead.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    city: string;

    @Column()
    culture: string; // Soja, Milho...

    @Column('decimal', { precision: 10, scale: 2 })
    area: number;

    @Column({ type: 'jsonb', nullable: true })
    geometry: any;

    @Column({ type: 'text', nullable: true })
    obs?: string;

    @ManyToOne(() => Lead, (lead) => lead.properties, { onDelete: 'CASCADE' })
    lead: Lead;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('decimal', { precision: 10, scale: 6, nullable: true })
    lat: number;

    @Column('decimal', { precision: 10, scale: 6, nullable: true })
    lng: number;
}