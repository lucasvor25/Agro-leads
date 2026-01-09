import { IsOptional, IsString, IsBooleanString } from 'class-validator';

export class GetLeadsFilterDto {
    @IsOptional()
    @IsString()
    search?: string; // Para Nome, CPF ou Email

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString() // Recebemos como string 'true', 'false' ou undefined
    priority?: string;
}