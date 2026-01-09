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

    // O "Pulo do Gato" para o Mapbox:
    // PostgreSQL tem um tipo 'jsonb' nativo. Perfeito para salvar GeoJSON!
    @Column({ type: 'jsonb', nullable: true })
    geometry: any;

    @Column({ type: 'text', nullable: true })
    obs: string;

    // Relacionamento: Muitas Propriedades pertencem a UM Lead
    @ManyToOne(() => Lead, (lead) => lead.properties, { onDelete: 'CASCADE' })
    lead: Lead;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}