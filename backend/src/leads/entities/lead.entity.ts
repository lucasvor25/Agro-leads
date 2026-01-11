import { Property } from 'src/properties/entities/property.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('leads')
export class Lead {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 14 })
    cpf: string;

    @Column({ length: 100 })
    email: string;

    @Column({ length: 20 })
    phone: string;

    @Column()
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ default: 'Novo' })
    status: string;

    @Column('decimal', { precision: 10, scale: 2 })
    area: number;

    @Column({ type: 'text', nullable: true })
    obs?: string;

    @Column({ default: false })
    isPriority: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Property, (property) => property.lead)
    properties?: Property[];
}