import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';

const mockLead: Lead = {
  id: 1,
  name: 'Fazenda Boa Vista',
  cpf: '12345678901',
  email: 'fazenda@email.com',
  phone: '11999999999',
  city: 'Uberlândia',
  state: 'MG',
  status: 'Novo',
  area: 120,
  isPriority: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  user_id: 1,
};

const mockPaginatedResult = {
  data: [mockLead],
  meta: {
    totalItems: 1,
    itemCount: 1,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockLead], 1]),
};

const mockLeadsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: getRepositoryToken(Lead), useValue: mockLeadsRepository },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    jest.clearAllMocks();
    mockLeadsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockLead], 1]);
  });

  describe('create', () => {
    it('deve criar um lead com isPriority=true quando área > 100', async () => {
      const createDto = { ...mockLead, area: 150 };
      const leadInstance = { ...createDto, isPriority: false };

      mockLeadsRepository.create.mockReturnValue(leadInstance);
      mockLeadsRepository.save.mockResolvedValue({ ...leadInstance, isPriority: true });

      const result = await service.create(createDto, 1);

      expect(leadInstance.isPriority).toBe(true);
      expect(mockLeadsRepository.save).toHaveBeenCalled();
    });

    it('deve criar um lead com isPriority=false quando área <= 100', async () => {
      const createDto = { ...mockLead, area: 80 };
      const leadInstance = { ...createDto, isPriority: true };

      mockLeadsRepository.create.mockReturnValue(leadInstance);
      mockLeadsRepository.save.mockResolvedValue({ ...leadInstance, isPriority: false });

      await service.create(createDto, 1);

      expect(leadInstance.isPriority).toBe(false);
    });

    it('deve lançar ConflictException em CPF duplicado', async () => {
      const createDto = { ...mockLead };
      mockLeadsRepository.create.mockReturnValue(createDto);
      mockLeadsRepository.save.mockRejectedValue({ code: '23505', detail: 'Key (cpf)' });

      await expect(service.create(createDto, 1)).rejects.toThrow(ConflictException);
    });

    it('deve lançar ConflictException em email duplicado', async () => {
      const createDto = { ...mockLead };
      mockLeadsRepository.create.mockReturnValue(createDto);
      mockLeadsRepository.save.mockRejectedValue({ code: '23505', detail: 'Key (email)' });

      await expect(service.create(createDto, 1)).rejects.toThrow(ConflictException);
    });

    it('deve lançar InternalServerErrorException em erro desconhecido', async () => {
      const createDto = { ...mockLead };
      mockLeadsRepository.create.mockReturnValue(createDto);
      mockLeadsRepository.save.mockRejectedValue(new Error('Erro genérico'));

      await expect(service.create(createDto, 1)).rejects.toThrow(InternalServerErrorException);
    });

    it('deve associar o lead ao userId correto', async () => {
      const createDto = { ...mockLead };
      mockLeadsRepository.create.mockReturnValue({ ...createDto, user_id: 42 });
      mockLeadsRepository.save.mockResolvedValue({ ...createDto, user_id: 42 });

      await service.create(createDto, 42);

      expect(mockLeadsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 42 })
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar dados paginados corretamente', async () => {
      const result = await service.findAll({}, 1);

      expect(result).toMatchObject({
        data: [mockLead],
        meta: expect.objectContaining({ totalItems: 1, currentPage: 1 }),
      });
    });

    it('deve aplicar filtro de busca textual', async () => {
      await service.findAll({ search: 'Boa Vista' }, 1);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('deve aplicar filtro de status quando não for "Todos"', async () => {
      await service.findAll({ status: 'Convertido' }, 1);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lead.status = :status',
        { status: 'Convertido' }
      );
    });

    it('não deve aplicar filtro de status quando for "Todos"', async () => {
      await service.findAll({ status: 'Todos' }, 1);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        'lead.status = :status',
        expect.anything()
      );
    });

    it('deve aplicar filtro de prioridade quando definido', async () => {
      await service.findAll({ priority: true }, 1);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lead.isPriority = :isPriority',
        { isPriority: true }
      );
    });

    it('deve filtrar apenas leads do usuário autenticado', async () => {
      await service.findAll({}, 7);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'lead.user_id = :userId',
        { userId: 7 }
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um lead pelo id do usuário', async () => {
      mockLeadsRepository.findOne.mockResolvedValue(mockLead);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockLead);
      expect(mockLeadsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user_id: 1 },
        relations: ['properties'],
      });
    });
  });

  describe('update', () => {
    it('deve atualizar o lead corretamente', async () => {
      mockLeadsRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { name: 'Novo Nome' }, 1);

      expect(mockLeadsRepository.update).toHaveBeenCalledWith(
        { id: 1, user_id: 1 },
        expect.objectContaining({ name: 'Novo Nome' })
      );
    });
  });

  describe('remove', () => {
    it('deve deletar o lead do usuário autenticado', async () => {
      mockLeadsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1, 1);

      expect(mockLeadsRepository.delete).toHaveBeenCalledWith({ id: 1, user_id: 1 });
    });
  });
});
