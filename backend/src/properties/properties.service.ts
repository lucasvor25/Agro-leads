import { Injectable, NotFoundException } from '@nestjs/common';
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

    return this.propertyRepository.find({
      relations: ['lead'],
      order: { id: 'DESC' }
    });
  }

  findOne(id: number) {
    return this.propertyRepository.findOne({ where: { id }, relations: ['lead'] });
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {

    const { leadId, ...data } = updatePropertyDto;

    const property = await this.propertyRepository.findOne({ where: { id } });

    if (!property) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }

    if (leadId) {
      const lead = await this.leadRepository.findOne({ where: { id: leadId } });
      if (!lead) {
        throw new NotFoundException('Novo Lead informado não encontrado');
      }
      property.lead = lead;
    }

    this.propertyRepository.merge(property, data);

    return this.propertyRepository.save(property);
  }

  async remove(id: number) {

    const result = await this.propertyRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada para exclusão`);
    }

    return { message: 'Propriedade excluída com sucesso' };
  }
}