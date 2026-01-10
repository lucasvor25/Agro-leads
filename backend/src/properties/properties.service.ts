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
    return this.propertyRepository.find({
      relations: ['lead'],
      order: { id: 'DESC' } // Opcional: Ordena do mais novo para o mais antigo
    });
  }

  findOne(id: number) {
    return this.propertyRepository.findOne({ where: { id }, relations: ['lead'] });
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    // 1. Separa o leadId do resto dos dados
    const { leadId, ...data } = updatePropertyDto;

    // 2. Busca a propriedade existente
    const property = await this.propertyRepository.findOne({ where: { id } });

    if (!property) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }

    // 3. Se houver troca de Lead, busca o novo e atualiza a relação
    if (leadId) {
      const lead = await this.leadRepository.findOne({ where: { id: leadId } });
      if (!lead) {
        throw new NotFoundException('Novo Lead informado não encontrado');
      }
      property.lead = lead;
    }

    // 4. Mescla os novos dados (name, area, lat, lng, geometry, etc) com a propriedade existente
    this.propertyRepository.merge(property, data);

    // 5. Salva as alterações
    return this.propertyRepository.save(property);
  }

  async remove(id: number) {
    // O método delete remove direto pelo ID
    const result = await this.propertyRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada para exclusão`);
    }

    return { message: 'Propriedade excluída com sucesso' };
  }
}