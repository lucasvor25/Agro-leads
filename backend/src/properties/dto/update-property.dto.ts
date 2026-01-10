import { CreatePropertyDto } from './create-property.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) { }
