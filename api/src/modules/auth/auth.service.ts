import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { User } from '../users/user.entity.js';
import { AuthSessionService } from './auth-session.service.js';
import { GoogleCredentialVerifier } from './google-credential.verifier.js';
import type { GoogleIdentity } from './google-identity.js';

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  theme: string;
  pictureUrl: string | null;
  googleConnected: boolean;
  hasPassword: boolean;
};

export type IssuedAuth = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

export type AuthConfig = {
  googleClientId: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwt: JwtService,
    private readonly sessions: AuthSessionService,
    private readonly google: GoogleCredentialVerifier,
  ) {}

  config(): AuthConfig {
    return { googleClientId: blankToNull(process.env.GOOGLE_CLIENT_ID) };
  }

  toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      theme: user.theme,
      pictureUrl: user.pictureUrl ?? null,
      googleConnected: Boolean(user.googleId),
      hasPassword: Boolean(user.passwordHash),
    };
  }

  issueAccess(user: User, sessionId: string): string {
    return this.jwt.sign(
      { sub: user.id, email: user.email, sid: sessionId },
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as `${number}${'d' | 'h' | 'm'}` },
    );
  }

  async register(email: string, password: string, displayName: string): Promise<IssuedAuth> {
    const normalized = normalizeEmail(email);
    const existing = await this.em.findOne(User, { email: normalized });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const user = this.em.create(User, {
      email: normalized,
      passwordHash: await bcrypt.hash(password, 10),
      displayName: displayName.trim() || normalized.split('@')[0],
    });
    await this.em.persist(user).flush();
    return this.issueSession(user);
  }

  async login(email: string, password: string): Promise<IssuedAuth> {
    const user = await this.em.findOne(User, { email: normalizeEmail(email) });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('Sign in with Google for this account');
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueSession(user);
  }

  async googleSignIn(credential: string): Promise<IssuedAuth> {
    const clientId = blankToNull(process.env.GOOGLE_CLIENT_ID);
    if (!clientId) {
      throw new ForbiddenException('Google sign-in is not configured');
    }
    const identity = await this.google.verify(credential, clientId);
    const email = normalizeEmail(identity.email);
    let user =
      (await this.em.findOne(User, { googleId: identity.subject })) ??
      (await this.em.findOne(User, { email }));
    if (!user) {
      user = this.em.create(User, {
        email,
        passwordHash: null,
        googleId: identity.subject,
        pictureUrl: identity.pictureUrl,
        displayName: displayNameFrom(identity, email),
      });
      await this.em.persist(user).flush();
      return this.issueSession(user);
    }
    if (!user.googleId) {
      user.googleId = identity.subject;
    }
    this.applyGoogleProfile(user, identity);
    await this.em.flush();
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

  private applyGoogleProfile(user: User, identity: GoogleIdentity): void {
    if (identity.pictureUrl) {
      user.pictureUrl = identity.pictureUrl;
    }
    const nextName = displayNameFrom(identity, user.email);
    if (nextName && (user.displayName === user.email.split('@')[0] || !user.displayName)) {
      user.displayName = nextName;
    }
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function displayNameFrom(identity: GoogleIdentity, email: string): string {
  const joined = [identity.givenName, identity.familyName].filter(Boolean).join(' ').trim();
  return joined || email.split('@')[0];
}
