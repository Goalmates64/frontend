import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { take } from 'rxjs';
import { map } from 'rxjs/operators';

export const guestGuard: CanMatchFn = (_route, _segments) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuth) => {
      if (isAuth) {
        return router.createUrlTree(['/']);
      }
      return true;
    }),
  );
};
