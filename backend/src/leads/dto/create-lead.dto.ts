import { IsString, IsEmail, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLeadDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    cpf: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsString()
    city: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber()
    area: number;

    @IsString()
    @IsOptional()
    obs?: string;
}