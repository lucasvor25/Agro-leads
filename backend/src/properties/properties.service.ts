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

  async create(createPropertyDto: CreatePropertyDto, userId: number) {
    const { leadId, ...data } = createPropertyDto;

    // Garante que o lead pertence ao usuário autenticado
    const lead = await this.leadRepository.findOne({ where: { id: leadId, user_id: userId } });
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const property = this.propertyRepository.create({
      ...data,
      lead,
      user_id: userId,
    });

    return this.propertyRepository.save(property);
  }

  findAll(userId: number) {
    return this.propertyRepository.find({
      where: { user_id: userId },
      relations: ['lead'],
      order: { id: 'DESC' },
    });
  }

  findOne(id: number, userId: number) {
    return this.propertyRepository.findOne({
      where: { id, user_id: userId },
      relations: ['lead'],
    });
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto, userId: number) {
    const { leadId, ...data } = updatePropertyDto;

    const property = await this.propertyRepository.findOne({ where: { id, user_id: userId } });

    if (!property) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }

    if (leadId) {
      const lead = await this.leadRepository.findOne({ where: { id: leadId, user_id: userId } });
      if (!lead) {
        throw new NotFoundException('Novo Lead informado não encontrado');
      }
      property.lead = lead;
    }

    this.propertyRepository.merge(property, data);

    return this.propertyRepository.save(property);
  }

  async remove(id: number, userId: number) {
    const result = await this.propertyRepository.delete({ id, user_id: userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada para exclusão`);
    }

    return { message: 'Propriedade excluída com sucesso' };
  }
}