export interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    city: string;
    status: 'Novo' | 'Contato Inicial' | 'Em Negociação' | 'Convertido' | 'Perdido';
    area: number;
    lastContact: string;
    isPriority: boolean;
    cpf?: string;
    propertiesCount?: number;
    createdAt?: string;
    updatedAt?: string;
    obs?: string;
}