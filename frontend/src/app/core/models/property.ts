export interface Property {
    id?: number;
    name: string;
    city: string;
    culture: string;
    area: number;
    geometry?: any;
    obs?: string;
    lat?: number;
    lng?: number;
    lead?: any;
    createdAt?: Date;
    updatedAt?: Date;
}