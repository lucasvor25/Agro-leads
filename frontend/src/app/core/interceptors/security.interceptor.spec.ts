import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { securityInterceptor } from './security.interceptor';
import { environment } from 'src/environments/environment';

describe('securityInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([securityInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve adicionar withCredentials=true para chamadas à API interna', () => {
    http.get(`${environment.apiUrl}/leads`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/leads`);
    expect(req.request.withCredentials).toBeTrue();
    req.flush([]);
  });

  it('não deve adicionar withCredentials para chamadas externas (IBGE)', () => {
    http.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').subscribe();

    const req = httpMock.expectOne(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
    );
    expect(req.request.withCredentials).toBeFalse();
    req.flush([]);
  });
});
