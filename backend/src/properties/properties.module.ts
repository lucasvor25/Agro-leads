import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importe isso
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity'; // <--- Importe a Entity Property
import { Lead } from '../leads/entities/lead.entity'; // <--- Importe a Entity Lead

@Module({
  imports: [

    TypeOrmModule.forFeature([Property, Lead])
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule { }