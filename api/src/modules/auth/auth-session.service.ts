import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { User } from '../users/user.entity.js';
import { AuthCookies } from './auth.cookies.js';
import { AuthSession } from './auth-session.entity.js';

/**
 * Issues and revokes refresh tokens.
 *
 * The refresh token is opaque and is not rotated on use; each refresh slides
 * the session's expiry instead. Rotation would need a grace window to survive
 * two tabs refreshing at once.
 */
@Injectable()
export class AuthSessionService {
  constructor(private readonly em: EntityManager) {}

  async start(user: User): Promise<{ session: AuthSession; refreshToken: string }> {
    await this.deleteStale(user.id);
    const refreshToken = randomBytes(32).toString('base64url');
    const session = this.em.create(AuthSession, {
      user,
      tokenHash: hashToken(refreshToken),
      expiresAt: this.expiry(),
    });
    await this.em.persist(session).flush();
    return { session, refreshToken };
  }

  async renew(refreshToken: string | undefined): Promise<AuthSession | null> {
    if (!refreshToken) {
      return null;
    }
    const session = await this.em.findOne(
      AuthSession,
      {
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { populate: ['user'] },
    );
    if (!session) {
      return null;
    }
    session.expiresAt = this.expiry();
    session.lastUsedAt = new Date();
    await this.em.flush();
    return session;
  }

  async isActive(sessionId: string): Promise<boolean> {
    const session = await this.em.findOne(AuthSession, {
      id: sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    return session !== null;
  }

  async revokeByToken(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const session = await this.em.findOne(AuthSession, {
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    });
    if (!session) {
      return;
    }
    session.revokedAt = new Date();
    await this.em.flush();
  }

  private async deleteStale(userId: string) {
    await this.em.nativeDelete(AuthSession, {
      user: userId,
      expiresAt: { $lte: new Date() },
    });
    await this.em.nativeDelete(AuthSession, {
      user: userId,
      revokedAt: { $ne: null },
    });
  }

  private expiry(): Date {
    return new Date(Date.now() + new AuthCookies().refreshMaxAgeMs());
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
