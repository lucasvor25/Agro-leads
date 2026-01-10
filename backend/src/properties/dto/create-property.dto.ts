// backend/src/properties/dto/create-property.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePropertyDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    culture: string;

    @IsNotEmpty()
    @IsNumber()
    area: number;

    @IsOptional()
    geometry: any; // Pode ser um objeto GeoJSON complexo

    @IsOptional()
    @IsString()
    obs: string;

    @IsOptional()
    @IsNumber()
    lat: number;

    @IsOptional()
    @IsNumber()
    lng: number;

    @IsNotEmpty()
    @IsNumber()
    leadId: number; // Precisamos saber de quem é a propriedade
}