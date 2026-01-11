import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';

describe('LeadService (Unit)', () => {
    let service: LeadsService;
    let repositoryMock: any;

    const mockLeadRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LeadsService,
                {
                    provide: getRepositoryToken(Lead),
                    useValue: mockLeadRepository,
                },
            ],
        }).compile();

        service = module.get<LeadsService>(LeadsService);
        repositoryMock = module.get(getRepositoryToken(Lead));

        jest.clearAllMocks();
    });

    it('deve ser definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const fullDto = {
            name: 'Teste',
            cpf: '12345678901',
            email: 'teste@exemplo.com',
            phone: '3199999999',
            city: 'BH',
            area: 100
        };

        it('deve criar um lead com sucesso se o CPF não existir', async () => {
            const resultLead = { id: 1, ...fullDto };

            repositoryMock.findOne.mockResolvedValue(null);
            repositoryMock.create.mockReturnValue(fullDto);
            repositoryMock.save.mockResolvedValue(resultLead);

            const result = await service.create(fullDto as any);

            expect(result).toHaveProperty('id');
            expect(result.id).toBe(1);
            expect(repositoryMock.save).toHaveBeenCalled();
        });
    });
});