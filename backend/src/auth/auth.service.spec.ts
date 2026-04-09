import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const mockUser = {
  id: 1,
  name: 'João Silva',
  email: 'joao@email.com',
  password: '',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findOne: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve delegar o registro para UsersService', async () => {
      const dto = { name: 'João', email: 'joao@email.com', password: 'senha123' };
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.register(dto);

      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({ id: 1 });
    });
  });

  describe('login', () => {
    it('deve retornar um token JWT com credenciais válidas', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, password: hashedPassword });

      const result = await service.login({ email: 'joao@email.com', password: 'senha123' });

      expect(result).toBe('mock.jwt.token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('deve lançar UnauthorizedException se o email não existir', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@email.com', password: 'senha123' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver errada', async () => {
      const hashedPassword = await bcrypt.hash('correta', 10);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, password: hashedPassword });

      await expect(
        service.login({ email: 'joao@email.com', password: 'errada' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('deve retornar os dados do usuário autenticado', async () => {
      const { password, ...userWithoutPassword } = mockUser;
      mockUsersService.findOne.mockResolvedValue(userWithoutPassword);

      const result = await service.getMe(1);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('password');
    });
  });
});
