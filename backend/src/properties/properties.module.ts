import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([Property, Lead])
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule { }