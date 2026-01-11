import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Max,
    IsObject,
    IsInt
} from 'class-validator';

export class CreatePropertyDto {

    @IsString()
    @IsNotEmpty({ message: 'O nome da propriedade é obrigatório' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'O município é obrigatório' })
    @Transform(({ value }) => value?.trim())
    city: string;

    @IsString()
    @IsNotEmpty({ message: 'A cultura é obrigatória' })
    @Transform(({ value }) => value?.trim())
    culture: string;

    @IsNumber({}, { message: 'A área deve ser um número válido' })
    @Min(0, { message: 'A área não pode ser negativa' })
    area: number;

    @IsOptional()
    @IsObject({ message: 'A geometria deve ser um objeto JSON válido' })
    geometry?: any;

    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    obs?: string;

    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90, { message: 'Latitude inválida (deve ser entre -90 e 90)' })
    lat?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180, { message: 'Longitude inválida (deve ser entre -180 e 180)' })
    lng?: number;

    @IsNotEmpty({ message: 'O ID do lead é obrigatório para vincular a propriedade' })
    @IsNumber()
    @IsInt({ message: 'O ID do lead deve ser um número inteiro' })
    @Min(1)
    leadId: number;
}