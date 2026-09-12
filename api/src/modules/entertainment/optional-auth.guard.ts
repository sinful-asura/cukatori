import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';

/** Lets GET/demo calls through when no session exists; still populates `req.user` when it does. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await this.auth.canActivate(context);
    } catch {
      return true;
    }
  }
}
