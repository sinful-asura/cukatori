import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';

/**
 * Builds the two cookies a signed-in session runs on.
 *
 * Both are HttpOnly and SameSite=Strict. The SPA reaches the API same-origin
 * via the Angular proxy (local) or host nginx (prod), so Strict stays on the
 * app and we do not need CSRF tokens.
 *
 * Access covers `/` (every API call). Refresh is scoped to `/api/auth` so the
 * long-lived credential never rides on ordinary data requests.
 */
export const ACCESS_COOKIE = 'ck_access';
export const REFRESH_COOKIE = 'ck_refresh';

const SITE_PATH = '/';
const REFRESH_PATH = '/api/auth';

@Injectable()
export class AuthCookies {
  access(res: Response, token: string) {
    res.cookie(ACCESS_COOKIE, token, this.build(SITE_PATH, this.accessMaxAgeMs()));
  }

  refresh(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, this.build(REFRESH_PATH, this.refreshMaxAgeMs()));
  }

  issue(res: Response, accessToken: string, refreshToken: string) {
    this.access(res, accessToken);
    this.refresh(res, refreshToken);
  }

  clear(res: Response) {
    res.clearCookie(ACCESS_COOKIE, this.clearOptions(SITE_PATH));
    res.clearCookie(REFRESH_COOKIE, this.clearOptions(REFRESH_PATH));
  }

  private build(path: string, maxAgeMs: number): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.AUTH_COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path,
      maxAge: maxAgeMs,
    };
  }

  private clearOptions(path: string): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.AUTH_COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path,
    };
  }

  accessMaxAgeMs(): number {
    return parseDurationMs(process.env.JWT_EXPIRES_IN ?? '1d');
  }

  refreshMaxAgeMs(): number {
    return parseDurationMs(process.env.REFRESH_EXPIRES_IN ?? '30d');
  }
}

/** Accepts `30d`, `12h`, `15m`, or ISO-8601 such as `PT30M`. */
export function parseDurationMs(configured: string): number {
  const value = configured.trim().toLowerCase();
  const amount = value.slice(0, -1);
  if (/^\d+d$/.test(value)) {
    return Number(amount) * 86_400_000;
  }
  if (/^\d+h$/.test(value)) {
    return Number(amount) * 3_600_000;
  }
  if (/^\d+m$/.test(value)) {
    return Number(amount) * 60_000;
  }
  const iso = value.toUpperCase().startsWith('P') ? value.toUpperCase() : `PT${value.toUpperCase()}`;
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!match) {
    return 86_400_000;
  }
  return (
    Number(match[1] ?? 0) * 3_600_000 +
    Number(match[2] ?? 0) * 60_000 +
    Number(match[3] ?? 0) * 1_000
  );
}
