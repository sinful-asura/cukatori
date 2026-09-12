import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../environment';
import { SessionService, SessionUser } from '../session.service';

/** No tokens here: both live in HttpOnly cookies that only the browser and the server touch. */
export interface AuthResponse {
  user: SessionUser;
}

export interface AuthConfig {
  googleClientId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly base = `${environment.apiUrl}/auth`;
  private refreshInFlight: Observable<SessionUser> | null = null;
  private configInFlight: Observable<AuthConfig> | null = null;

  getConfig(): Observable<AuthConfig> {
    this.configInFlight ??= this.http
      .get<AuthConfig>(`${this.base}/config`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.configInFlight;
  }

  googleSignIn(credential: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/google`, { credential })
      .pipe(tap((res) => this.storeSession(res)));
  }

  register(email: string, password: string, displayName?: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, { email, password, displayName })
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  me(): Observable<SessionUser> {
    return this.http.get<AuthResponse>(`${this.base}/me`).pipe(
      tap((res) => this.session.setFromApi(res.user)),
      map((res) => res.user),
    );
  }

  hasSession(): boolean {
    return this.session.isLoggedIn();
  }

  /**
   * Exchanges the refresh cookie for a new access cookie. Concurrent callers share one request.
   */
  refresh(): Observable<SessionUser> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.http.post<AuthResponse>(`${this.base}/refresh`, null).pipe(
        tap((res) => this.storeSession(res)),
        map((res) => res.user),
        catchError((error: unknown) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshInFlight = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.refreshInFlight;
  }

  restore(): void {
    this.me().subscribe({
      error: () => this.clearSession(),
    });
  }

  logout(): Observable<void> {
    return this.http.post<{ ok: true }>(`${this.base}/logout`, null).pipe(
      catchError(() => of({ ok: true as const })),
      tap(() => this.clearSession()),
      map(() => undefined),
    );
  }

  private clearSession(): void {
    this.session.logout();
  }

  private storeSession(res: AuthResponse): void {
    this.session.setFromApi(res.user);
  }
}
