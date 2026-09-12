import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../users/user.entity.js';
import { ACCESS_COOKIE } from './auth.cookies.js';
import { AuthSessionService } from './auth-session.service.js';

export type AccessPayload = {
  sub: string;
  email: string;
  sid: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly sessions: AuthSessionService,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: User }>();
    const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    let payload: AccessPayload;
    try {
      payload = this.jwt.verify<AccessPayload>(token);
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
    if (!payload.sid || !(await this.sessions.isActive(payload.sid))) {
      throw new UnauthorizedException('Session expired');
    }
    const user = await this.em.findOne(User, { id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    req.user = user;
    return true;
  }
}
