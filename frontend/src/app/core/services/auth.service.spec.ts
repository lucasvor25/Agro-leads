import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from './auth.service';
import { environment } from '../../../environments/environment';

const mockUser: UserProfile = {
  id: 1,
  name: 'João Silva',
  email: 'joao@email.com',
  role: 'user',
  createdAt: new Date().toISOString(),
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('register', () => {
    it('deve fazer POST para /auth/register com os dados corretos', () => {
      const registerData = { name: 'João', email: 'joao@email.com', password: 'senha123' };

      service.register(registerData).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ id: 1, ...registerData });
    });
  });

  describe('login', () => {
    it('deve fazer POST para /auth/login e carregar o perfil do usuário', () => {
      service.login({ email: 'joao@email.com', password: 'senha123' }).subscribe();

      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush({ message: 'Login realizado com sucesso' });

      const meReq = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      meReq.flush(mockUser);
    });
  });

  describe('logout', () => {
    it('deve fazer POST para /auth/logout, limpar usuário e redirecionar', () => {
      service['currentUser$'].next(mockUser);

      service.logout().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Logout realizado com sucesso' });

      expect(service.isAuthenticated()).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('loadMe', () => {
    it('deve chamar GET /auth/me e armazenar o usuário', () => {
      service.loadMe().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar false quando não há usuário logado', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('deve retornar true depois de definir o usuário corrente', () => {
      service['currentUser$'].next(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('getUser', () => {
    it('deve emitir null inicialmente', (done) => {
      service.getUser().subscribe((u) => {
        expect(u).toBeNull();
        done();
      });
    });

    it('deve emitir o usuário após next() no BehaviorSubject', (done) => {
      service['currentUser$'].next(mockUser);

      service.getUser().subscribe((u) => {
        expect(u).toEqual(mockUser);
        done();
      });
    });
  });
});
