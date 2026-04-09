import { Lead } from './lead';
import { Geometry } from 'geojson';

export interface Property {
    id?: number;
    name: string;
    city: string;
    culture: string;
    area: number;
    geometry?: Geometry | null;
    obs?: string;
    lead?: Lead;
    createdAt?: Date;
    updatedAt?: Date;
}