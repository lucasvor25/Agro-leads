import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { GetLeadsFilterDto } from './dto/get-leads-filter.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) { }

  async create(createLeadDto: CreateLeadDto) {
    const lead = this.leadsRepository.create(createLeadDto);

    if (lead.area > 100) {
      lead.isPriority = true;
    } else {
      lead.isPriority = false;
    }

    try {
      return await this.leadsRepository.save(lead);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(filterDto: GetLeadsFilterDto): Promise<Lead[]> {
    const { search, status, city, priority } = filterDto;
    const query = this.leadsRepository.createQueryBuilder('lead');

    query.leftJoinAndSelect('lead.properties', 'properties');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('lead.name ILIKE :search', { search: `%${search}%` })
            .orWhere('lead.cpf ILIKE :search', { search: `%${search}%` })
            .orWhere('lead.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (status && status !== 'Todos') {
      query.andWhere('lead.status = :status', { status });
    }

    if (city && city !== 'Todos') {
      query.andWhere('lead.city = :city', { city });
    }

    if (priority !== undefined) {
      query.andWhere('lead.isPriority = :isPriority', { isPriority: priority });
    }

    query.orderBy('lead.isPriority', 'DESC');
    query.addOrderBy('lead.area', 'DESC');
    query.addOrderBy('lead.createdAt', 'DESC');

    return await query.getMany();
  }

  findOne(id: number) {
    return this.leadsRepository.findOne({
      where: { id },
      relations: ['properties'],
    });
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    const { properties, id: leadId, ...leadData } = updateLeadDto as any;

    try {

      return await this.leadsRepository.update(id, leadData);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.leadsRepository.delete(id);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      if (error.detail && error.detail.includes('cpf')) {
        throw new ConflictException('Este CPF já está cadastrado no sistema.');
      }
      if (error.detail && error.detail.includes('email')) {
        throw new ConflictException('Este E-mail já está cadastrado no sistema.');
      }
      throw new ConflictException('Registro duplicado (CPF ou E-mail).');
    }

    console.error(error);

    throw new InternalServerErrorException('Erro ao processar a requisição no banco de dados.');
  }
}