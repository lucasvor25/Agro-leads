import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

const mockUserProfile = {
  id: 1,
  name: 'João',
  email: 'joao@email.com',
  role: 'user',
  createdAt: new Date().toISOString(),
};

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'loadMe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('deve retornar true imediatamente se o usuário já está autenticado', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = runGuard();

    expect(result).toBeTrue();
  });

  it('deve retornar true via observable se loadMe() resolver (cookie válido)', (done) => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.loadMe.and.returnValue(of(mockUserProfile as any));

    const result$ = runGuard() as any;

    result$.subscribe((allowed: boolean) => {
      expect(allowed).toBeTrue();
      done();
    });
  });

  it('deve redirecionar para /login e retornar false se loadMe() falhar', (done) => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.loadMe.and.returnValue(throwError(() => new Error('Unauthorized')));

    const result$ = runGuard() as any;

    result$.subscribe((allowed: boolean) => {
      expect(allowed).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
