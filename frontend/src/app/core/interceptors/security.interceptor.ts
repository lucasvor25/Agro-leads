import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (isApiUrl) {
    const secureReq = req.clone({
      withCredentials: true
    });
    return next(secureReq);
  }

  // Passa a requisição externa limpa, sem credenciais
  return next(req);
};
