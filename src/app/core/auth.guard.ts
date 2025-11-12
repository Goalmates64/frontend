import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {take} from 'rxjs';
import {map} from 'rxjs/operators';

import {AuthService} from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuth) => (isAuth ? true : router.createUrlTree(['/auth/login'])))
  );
};
