import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { inject } from '@angular/core';
import { take } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';

export const guestGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const wantsChangePassword = segments.some((segment) => segment.path === 'change-password');

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuth) => {
      if (isAuth && !wantsChangePassword) {
        return router.createUrlTree(['/']);
      }

      if (!isAuth && wantsChangePassword) {
        return router.createUrlTree(['/auth/login']);
      }

      return true;
    }),
  );
};
