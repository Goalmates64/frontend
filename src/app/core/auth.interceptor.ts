import {inject} from '@angular/core';
import {HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from './auth.service';
import {environment} from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  const isApiCall = req.url.startsWith(environment.apiUrl);

  if (token && isApiCall) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
