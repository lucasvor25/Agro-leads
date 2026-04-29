import { Lead } from 'src/leads/entities/lead.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** Subconjunto dos tipos GeoJSON aceitos pelo PostGIS */
type GeoJsonGeometry =
  | { type: 'Point'; coordinates: [number, number] }
  | { type: 'LineString'; coordinates: [number, number][] }
  | { type: 'Polygon'; coordinates: [number, number][][] }
  | { type: 'MultiPolygon'; coordinates: [number, number][][][]} ;

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    city: string;

    @Column()
    culture: string;

    @Column('decimal', { precision: 10, scale: 2 })
    area: number;

    @Column({ type: 'geometry', spatialFeatureType: 'Geometry', srid: 4326, nullable: true })
    geometry: GeoJsonGeometry | null;

    @Column({ type: 'text', nullable: true })
    obs?: string;

    @ManyToOne(() => Lead, (lead) => lead.properties, { onDelete: 'CASCADE' })
    lead: Lead;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column({ nullable: true })
    user_id?: number;
}