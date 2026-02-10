import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtPayload } from './auth.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const user = req.user;

    if (user?.role === 'admin') {
      return true;
    }

    return false;
  }
}
