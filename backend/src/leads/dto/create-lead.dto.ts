import { Transform } from 'class-transformer';
import {
    IsString,
    IsEmail,
    IsNumber,
    IsOptional,
    IsNotEmpty,
    Min,
    Length
} from 'class-validator';

export class CreateLeadDto {

    @IsString({ message: 'O nome deve ser um texto' })
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    @Transform(({ value }) => value?.trim()) // Remove espaços em branco no início/fim
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'O CPF é obrigatório' })
    @Length(11, 14, { message: 'O CPF deve ter entre 11 e 14 caracteres' })
    cpf: string;

    @IsEmail({}, { message: 'O e-mail informado é inválido' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'O telefone é obrigatório' })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: 'O município é obrigatório' })
    city: string;

    @IsString()
    @IsOptional()
    @Length(2, 2, { message: 'O estado deve ser a sigla de 2 letras (ex: MG)' })
    @Transform(({ value }) => value?.toUpperCase())
    state?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber({}, { message: 'A área deve ser um número (use ponto para decimais)' })
    @Min(0, { message: 'A área não pode ser negativa' })
    area: number;

    @IsString()
    @IsOptional()
    obs?: string;
}