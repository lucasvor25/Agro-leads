import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class GetLeadsFilterDto {

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    search?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    status?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    city?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'Prioritário') return true;
        if (value === 'Normal') return false;
        if (value === 'true') return true;
        if (value === 'false') return false;

        return undefined;
    })

    priority?: boolean;
}