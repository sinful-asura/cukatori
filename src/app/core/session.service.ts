import { Injectable, signal } from '@angular/core';

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  theme: string;
};

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly user = signal<SessionUser | null>(null);

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  setFromApi(user: SessionUser): void {
    this.user.set(user);
  }

  logout(): void {
    this.user.set(null);
  }
}
