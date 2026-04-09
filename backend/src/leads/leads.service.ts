import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { GetLeadsFilterDto } from './dto/get-leads-filter.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) { }

  async create(createLeadDto: CreateLeadDto, userId: number) {
    const lead = this.leadsRepository.create({
      ...createLeadDto,
      user_id: userId,
    });

    if (lead.area > 100) {
      lead.isPriority = true;
    } else {
      lead.isPriority = false;
    }

    try {
      this.logger.log(`Criando lead: ${lead.name}`);
      return await this.leadsRepository.save(lead);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(filterDto: GetLeadsFilterDto, userId: number): Promise<any> {
    const { search, status, city, priority, page = 1, limit = 10 } = filterDto;
    const query = this.leadsRepository.createQueryBuilder('lead');

    query.leftJoinAndSelect('lead.properties', 'properties');

    // Filtro principal: só dados do usuário autenticado
    query.where('lead.user_id = :userId', { userId });

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

    query.skip((page - 1) * limit);
    query.take(limit);

    const [data, totalItems] = await query.getManyAndCount();

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  findOne(id: number, userId: number) {
    return this.leadsRepository.findOne({
      where: { id, user_id: userId },
      relations: ['properties'],
    });
  }

  async update(id: number, updateLeadDto: UpdateLeadDto, userId: number) {
    const { properties, id: leadId, ...leadData } = updateLeadDto as any;

    try {
      return await this.leadsRepository.update({ id, user_id: userId }, leadData);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number, userId: number) {
    return this.leadsRepository.delete({ id, user_id: userId });
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

    this.logger.error('Erro ao processar a requisição no banco de dados', error.stack, { error });

    throw new InternalServerErrorException('Erro ao processar a requisição no banco de dados.');
  }
}