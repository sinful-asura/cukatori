import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';
export type MassUnit = 'kg' | 'lb';
export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export interface UserSettings {
  theme: ThemeMode;
  units: MassUnit;
  currency: CurrencyCode;
  displayName: string;
}

const STORAGE_KEY = 'ascend.settings';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  units: 'kg',
  currency: 'EUR',
  displayName: 'Kristijan',
};

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  readonly settings = signal<UserSettings>(loadSettings());

  constructor() {
    this.applyTheme(this.settings().theme);
  }

  patch(partial: Partial<UserSettings>): void {
    const next = { ...this.settings(), ...partial };
    this.settings.set(next);
    persistSettings(next);
    if (partial.theme) {
      this.applyTheme(next.theme);
    }
  }

  reset(): void {
    this.settings.set({ ...DEFAULT_SETTINGS });
    persistSettings(DEFAULT_SETTINGS);
    this.applyTheme(DEFAULT_SETTINGS.theme);
  }

  applyTheme(theme: ThemeMode): void {
    document.documentElement.classList.toggle('app-dark', theme === 'dark');
  }
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function persistSettings(value: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
