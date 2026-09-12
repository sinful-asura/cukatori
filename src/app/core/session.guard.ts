import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthApi } from './api/auth.api';
import { safeReturnUrl } from './safe-return-url';
import { SessionService } from './session.service';

/** `/os` is the signed-in shell. Restore cookies or send the visitor to login. */
export const sessionGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthApi);
  const session = inject(SessionService);
  const router = inject(Router);
  return auth.me().pipe(
    map(() => true),
    catchError(() => {
      session.logout();
      return of(
        router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        }),
      );
    }),
  );
};

/** Login / register: bounce signed-in users into the app. */
export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(AuthApi);
  const router = inject(Router);
  const returnUrl = safeReturnUrl(route.queryParamMap.get('returnUrl'));
  return auth.me().pipe(
    map(() => router.parseUrl(returnUrl)),
    catchError(() => of(true)),
  );
};
