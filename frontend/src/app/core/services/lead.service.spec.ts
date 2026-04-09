import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeadService } from './lead';
import { Lead } from '../models/lead';
import { PaginatedResponse } from '../models/pagination';
import { environment } from '../../../environments/environment';

const mockLead: Lead = {
  id: 1,
  name: 'Fazenda Boa Vista',
  email: 'fazenda@email.com',
  phone: '34999999999',
  city: 'Uberlândia',
  status: 'Novo',
  area: 120,
  isPriority: true,
  cpf: '12345678901',
};

const mockPaginated: PaginatedResponse<Lead> = {
  data: [mockLead],
  meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
};

describe('LeadService', () => {
  let service: LeadService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/leads`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeadService],
    });

    service = TestBed.inject(LeadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getLeads', () => {
    it('deve fazer GET em /leads sem filtros', () => {
      service.getLeads().subscribe((res) => {
        expect(res).toEqual(mockPaginated);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginated);
    });

    it('deve incluir parâmetro de busca na query string', () => {
      service.getLeads({ search: 'Boa Vista' }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === apiUrl && r.params.get('search') === 'Boa Vista'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginated);
    });

    it('deve incluir filtro de status quando não for "Todos"', () => {
      service.getLeads({ status: 'Convertido' }).subscribe();

      const req = httpMock.expectOne((r) => r.params.get('status') === 'Convertido');
      req.flush(mockPaginated);
    });

    it('não deve incluir status "Todos" na query string', () => {
      service.getLeads({ status: 'Todos' }).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.params.has('status')).toBeFalse();
      req.flush(mockPaginated);
    });

    it('deve incluir filtro de prioridade quando não for "Todos"', () => {
      service.getLeads({ priority: 'Prioritário' }).subscribe();

      const req = httpMock.expectOne((r) => r.params.get('priority') === 'Prioritário');
      req.flush(mockPaginated);
    });

    it('não deve incluir priority "Todos" na query string', () => {
      service.getLeads({ priority: 'Todos' }).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.params.has('priority')).toBeFalse();
      req.flush(mockPaginated);
    });

    it('deve incluir parâmetros de paginação', () => {
      service.getLeads({ page: 2, limit: 5 }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.params.get('page') === '2' && r.params.get('limit') === '5'
      );
      req.flush(mockPaginated);
    });
  });

  describe('create', () => {
    it('deve fazer POST em /leads com o payload correto', () => {
      const { id, ...newLead } = mockLead;

      service.create(newLead).subscribe((res) => {
        expect(res).toEqual(mockLead);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newLead);
      req.flush(mockLead);
    });
  });

  describe('getLeadById', () => {
    it('deve fazer GET em /leads/:id', () => {
      service.getLeadById(1).subscribe((res) => {
        expect(res).toEqual(mockLead);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLead);
    });
  });

  describe('update', () => {
    it('deve fazer PATCH em /leads/:id com os dados corretos', () => {
      service.update(1, { name: 'Novo Nome' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Novo Nome' });
      req.flush({ ...mockLead, name: 'Novo Nome' });
    });
  });

  describe('delete', () => {
    it('deve fazer DELETE em /leads/:id', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
