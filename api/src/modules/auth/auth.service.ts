import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { User } from '../users/user.entity.js';
import { AuthSessionService } from './auth-session.service.js';

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  theme: string;
};

export type IssuedAuth = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwt: JwtService,
    private readonly sessions: AuthSessionService,
  ) {}

  toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      theme: user.theme,
    };
  }

  issueAccess(user: User, sessionId: string): string {
    return this.jwt.sign(
      { sub: user.id, email: user.email, sid: sessionId },
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as `${number}${'d' | 'h' | 'm'}` },
    );
  }

  async register(email: string, password: string, displayName: string): Promise<IssuedAuth> {
    const user = this.em.create(User, {
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      displayName,
    });
    await this.em.persist(user).flush();
    return this.issueSession(user);
  }

  async login(email: string, password: string): Promise<IssuedAuth> {
    const user = await this.em.findOne(User, { email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueSession(user);
  }

  /** Trades a still-valid refresh cookie for a new access cookie; slides session expiry. */
  async refresh(refreshToken: string | undefined): Promise<IssuedAuth> {
    const session = await this.sessions.renew(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }
    return {
      accessToken: this.issueAccess(session.user, session.id),
      refreshToken: refreshToken as string,
      user: this.toPublic(session.user),
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    await this.sessions.revokeByToken(refreshToken);
  }

  private async issueSession(user: User): Promise<IssuedAuth> {
    const issued = await this.sessions.start(user);
    return {
      accessToken: this.issueAccess(user, issued.session.id),
      refreshToken: issued.refreshToken,
      user: this.toPublic(user),
    };
  }
}
