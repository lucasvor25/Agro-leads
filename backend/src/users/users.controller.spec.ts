import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUser = {
  id: 1,
  name: 'João Silva',
  email: 'joao@email.com',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  create: jest.fn().mockResolvedValue(mockUser),
  findAll: jest.fn().mockResolvedValue([mockUser]),
  findOne: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(mockUser),
  remove: jest.fn().mockResolvedValue({ message: 'Usuário removido' }),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('create() deve chamar usersService.create com o dto correto', async () => {
    const dto = { name: 'João', email: 'joao@email.com', password: 'senha123' };
    mockUsersService.create.mockResolvedValue(mockUser);

    const result = await controller.create(dto as any);

    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockUser);
  });

  it('findAll() deve retornar lista de usuários', async () => {
    mockUsersService.findAll.mockResolvedValue([mockUser]);

    const result = await controller.findAll();

    expect(result).toEqual([mockUser]);
  });

  it('findOne() deve retornar um usuário pelo id', async () => {
    mockUsersService.findOne.mockResolvedValue(mockUser);

    const result = await controller.findOne('1');

    expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });

  it('update() deve atualizar e retornar o usuário', async () => {
    const dto = { name: 'Novo Nome' };
    mockUsersService.update.mockResolvedValue({ ...mockUser, ...dto });

    const result = await controller.update('1', dto as any);

    expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove() deve remover o usuário pelo id', async () => {
    mockUsersService.remove.mockResolvedValue({ message: 'Usuário removido' });

    const result = await controller.remove('1');

    expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Usuário removido' });
  });
});
