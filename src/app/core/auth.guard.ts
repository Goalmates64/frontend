import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return combineLatest([authService.isAuthenticated$, authService.passwordChangeRequired$]).pipe(
    take(1),
    map(([isAuth, mustChange]) => {
      if (!isAuth) {
        return router.createUrlTree(['/auth/login']);
      }

      if (mustChange && state.url !== '/auth/change-password') {
        return router.createUrlTree(['/auth/change-password']);
      }

      if (!mustChange && state.url === '/auth/change-password') {
        return router.createUrlTree(['/']);
      }

      return true;
    }),
  );
};
