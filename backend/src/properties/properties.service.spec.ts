import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';

const mockLead = {
  id: 1,
  name: 'Fazenda Boa Vista',
  user_id: 1,
};

const mockProperty = {
  id: 1,
  name: 'Talhão A',
  city: 'Uberlândia',
  culture: 'Soja',
  area: 50,
  user_id: 1,
  lead: mockLead,
};

const mockPropertyRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
};

const mockLeadRepo = {
  findOne: jest.fn(),
};

describe('PropertiesService', () => {
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: getRepositoryToken(Property), useValue: mockPropertyRepo },
        { provide: getRepositoryToken(Lead), useValue: mockLeadRepo },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma propriedade vinculada ao lead do usuário', async () => {
      mockLeadRepo.findOne.mockResolvedValue(mockLead);
      mockPropertyRepo.create.mockReturnValue(mockProperty);
      mockPropertyRepo.save.mockResolvedValue(mockProperty);

      const dto = { name: 'Talhão A', city: 'Uberlândia', culture: 'Soja', area: 50, leadId: 1 };
      const result = await service.create(dto, 1);

      expect(mockLeadRepo.findOne).toHaveBeenCalledWith({ where: { id: 1, user_id: 1 } });
      expect(mockPropertyRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockProperty);
    });

    it('deve lançar NotFoundException se o lead não pertencer ao usuário', async () => {
      mockLeadRepo.findOne.mockResolvedValue(null);

      const dto = { name: 'Talhão A', city: 'Uberlândia', culture: 'Soja', area: 50, leadId: 99 };

      await expect(service.create(dto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar apenas as propriedades do usuário autenticado', async () => {
      mockPropertyRepo.find.mockResolvedValue([mockProperty]);

      const result = await service.findAll(1);

      expect(mockPropertyRepo.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['lead'],
        order: { id: 'DESC' },
      });
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('findOne', () => {
    it('deve retornar a propriedade do usuário pelo id', async () => {
      mockPropertyRepo.findOne.mockResolvedValue(mockProperty);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockProperty);
      expect(mockPropertyRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, user_id: 1 },
        relations: ['lead'],
      });
    });
  });

  describe('update', () => {
    it('deve atualizar a propriedade existente', async () => {
      mockPropertyRepo.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepo.merge.mockReturnValue(undefined);
      mockPropertyRepo.save.mockResolvedValue({ ...mockProperty, culture: 'Milho' });

      const result = await service.update(1, { culture: 'Milho' }, 1);

      expect(mockPropertyRepo.merge).toHaveBeenCalled();
      expect(mockPropertyRepo.save).toHaveBeenCalled();
      expect(result.culture).toBe('Milho');
    });

    it('deve lançar NotFoundException se a propriedade não for encontrada', async () => {
      mockPropertyRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { culture: 'Milho' }, 1)).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar o lead vinculado se leadId for fornecido', async () => {
      const novoLead = { id: 2, name: 'Outra Fazenda', user_id: 1 };
      mockPropertyRepo.findOne.mockResolvedValue({ ...mockProperty });
      mockLeadRepo.findOne.mockResolvedValue(novoLead);
      mockPropertyRepo.merge.mockReturnValue(undefined);
      mockPropertyRepo.save.mockResolvedValue({ ...mockProperty, lead: novoLead });

      await service.update(1, { leadId: 2 } as any, 1);

      expect(mockLeadRepo.findOne).toHaveBeenCalledWith({ where: { id: 2, user_id: 1 } });
    });
  });

  describe('remove', () => {
    it('deve deletar a propriedade e retornar mensagem de sucesso', async () => {
      mockPropertyRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1, 1);

      expect(mockPropertyRepo.delete).toHaveBeenCalledWith({ id: 1, user_id: 1 });
      expect(result).toEqual({ message: 'Propriedade excluída com sucesso' });
    });

    it('deve lançar NotFoundException se a propriedade não existir', async () => {
      mockPropertyRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
