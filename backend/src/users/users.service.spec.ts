import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const mockUser: User = {
  id: 1,
  name: 'João Silva',
  email: 'joao@email.com',
  password: '$2b$10$hashedpassword',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe criar um usuário com senha hasheada e retornar sem a senha', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({ ...mockUser });
      mockUserRepo.save.mockResolvedValue({ ...mockUser });

      const result = await service.create({
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'senha123',
      });

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: 'joao@email.com' } });
      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: 1, email: 'joao@email.com' });
    });

    it('deve lançar ConflictException se o email já estiver cadastrado', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({ name: 'Outro', email: 'joao@email.com', password: '123456' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário pelo email', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('joao@email.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: 'joao@email.com' } });
    });

    it('deve retornar null se o email não existir', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('naoexiste@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('deve retornar o usuário pelo id sem a senha', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: 1 });
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários sem senha', async () => {
      mockUserRepo.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('deve deletar e retornar mensagem de sucesso', async () => {
      mockUserRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(mockUserRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Usuário removido' });
    });
  });
});
