export interface Property {
    id?: number;
    leadId: number;
    nome: string;
    municipio: string;
    cultura: string;
    area: number;
    obs?: string;
    geometria?: any; // Para salvar o GeoJSON
}