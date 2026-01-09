import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm'; // Adicionado Brackets
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { GetLeadsFilterDto } from './dto/get-leads-filter.dto'; // Importe seu DTO novo

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) { }

  create(createLeadDto: CreateLeadDto) {
    const lead = this.leadsRepository.create(createLeadDto);

    // Mantive sua lógica de negócio original
    if (lead.area > 100) {
      lead.isPriority = true;
    } else {
      lead.isPriority = false;
    }

    lead.lastContact = new Date();
    return this.leadsRepository.save(lead);
  }

  async findAll(filterDto: GetLeadsFilterDto): Promise<Lead[]> {
    const { search, status, city, priority } = filterDto;

    const query = this.leadsRepository.createQueryBuilder('lead');

    // Trazendo o relacionamento 'properties' (substitui o relations: ['properties'])
    query.leftJoinAndSelect('lead.properties', 'properties');

    // --- 1. FILTROS ---


    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('lead.name ILIKE :search', { search: `%${search}%` })
            .orWhere('lead.cpf ILIKE :search', { search: `%${search}%` })
            .orWhere('lead.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // Filtro de Status
    if (status && status !== 'Todos') {
      query.andWhere('lead.status = :status', { status });
    }

    // Filtro de Município
    if (city && city !== 'Todos') {
      query.andWhere('lead.city = :city', { city });
    }

    // Filtro de Prioridade (Dropdown)
    if (priority && priority !== 'Todos') {
      const isPriority = priority === 'Prioritário'; // Converte string para boolean
      query.andWhere('lead.isPriority = :isPriority', { isPriority });
    }

    query.orderBy('lead.isPriority', 'DESC');

    // 2º: Dentro da prioridade (e dos normais), ordena pelo maior Hectar
    query.addOrderBy('lead.area', 'DESC');

    // 3º: Critério de desempate: Mais novos primeiro
    query.addOrderBy('lead.createdAt', 'DESC');

    return await query.getMany();
  }

  findOne(id: number) {
    return this.leadsRepository.findOne({
      where: { id },
      relations: ['properties'],
    });
  }

  update(id: number, updateLeadDto: UpdateLeadDto) {
    return this.leadsRepository.update(id, updateLeadDto);
  }

  remove(id: number) {
    return this.leadsRepository.delete(id);
  }
}