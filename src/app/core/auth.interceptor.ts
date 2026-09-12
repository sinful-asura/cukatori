import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthApi } from './api/auth.api';
import { environment } from './environment';

/**
 * Cookies are HttpOnly; the browser attaches them. A 401 is the first sign the
 * access cookie is stale: exchange the refresh cookie and retry once.
 */
const SESSION_LIFECYCLE = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/config',
  '/auth/refresh',
  '/auth/logout',
  '/auth/me',
];

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${environment.apiUrl}/`) && !req.url.startsWith('/api/')) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true }));
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/') && !req.url.startsWith(`${environment.apiUrl}/`)) {
    return next(req);
  }
  if (SESSION_LIFECYCLE.some((path) => req.url.includes(path))) {
    return next(req);
  }

  const injector = inject(Injector);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      const auth = injector.get(AuthApi);
      if (!auth.hasSession()) {
        return throwError(() => error);
      }
      return auth.refresh().pipe(switchMap(() => next(req)));
    }),
  );
};
