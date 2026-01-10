import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Lead } from '../leads/entities/lead.entity';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) { }

  async create(createPropertyDto: CreatePropertyDto) {
    const { leadId, ...data } = createPropertyDto;

    // Busca o Lead dono da propriedade
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new Error('Lead não encontrado');
    }

    const property = this.propertyRepository.create({
      ...data,
      lead: lead
    });

    return this.propertyRepository.save(property);
  }

  findAll() {
    // Traz o lead junto para mostrar o nome do dono na lista
    return this.propertyRepository.find({ relations: ['lead'] });
  }

  findOne(id: number) {
    return this.propertyRepository.findOne({ where: { id }, relations: ['lead'] });
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return `This action updates a #${id} property`;
  }

  remove(id: number) {
    return `This action removes a #${id} property`;
  }
}
