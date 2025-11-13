import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'gm_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

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
