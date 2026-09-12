import { Injectable, computed, signal } from '@angular/core';

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  theme: string;
  pictureUrl: string | null;
  googleConnected: boolean;
  hasPassword: boolean;
};

const USER_KEY = 'ao-auth-user';

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function readUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.email !== 'string') {
      return null;
    }
    return {
      id: parsed.id,
      email: parsed.email,
      displayName: asString(parsed.displayName) ?? parsed.email.split('@')[0],
      theme: asString(parsed.theme) ?? 'dark',
      pictureUrl: asString(parsed.pictureUrl),
      googleConnected: parsed.googleConnected === true,
      hasPassword: parsed.hasPassword === true,
    };
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly current = signal<SessionUser | null>(readUser());

  readonly user = this.current.asReadonly();
  readonly isLoggedIn = computed(() => this.current() !== null);
  readonly displayName = computed(() => this.current()?.displayName ?? null);

  setFromApi(user: SessionUser): void {
    const next: SessionUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      theme: user.theme,
      pictureUrl: asString(user.pictureUrl),
      googleConnected: user.googleConnected === true,
      hasPassword: user.hasPassword === true,
    };
    this.current.set(next);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    } catch {
      // private mode / storage disabled
    }
  }

  logout(): void {
    this.current.set(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // private mode / storage disabled
    }
  }
}
