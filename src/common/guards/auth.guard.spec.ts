import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { JwtPayload } from 'jwt-decode';

type MockRequest = {
  headers: { authorization?: string };
  user?: JwtPayload;
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;

  const mockExecutionContext = (options?: {
    isPublic?: boolean;
    token?: string;
  }): ExecutionContext => {
    const request = {
      headers: {
        authorization: options?.token ? `Bearer ${options.token}` : undefined,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    guard = new AuthGuard(reflector, jwtService);
  });

  it('should allow access for public route', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = mockExecutionContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw if token is missing', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = mockExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if token is invalid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('Invalid token'));

    const context = mockExecutionContext({ token: 'bad-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user to request for valid token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const payload = { sub: 'user-id', role: 'user' };
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

    const context = mockExecutionContext({ token: 'valid-token' });
    const request = context.switchToHttp().getRequest<MockRequest>();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual(payload);
  });
});
