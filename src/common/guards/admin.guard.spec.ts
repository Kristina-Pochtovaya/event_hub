import { ExecutionContext } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { userRole } from '../user_role';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  const mockExecutionContext = (user?: {
    role: keyof typeof userRole;
  }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    }) as ExecutionContext;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('should allow access for admin user', () => {
    const context = mockExecutionContext({ role: 'admin' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access for non-admin user', () => {
    const context = mockExecutionContext({ role: 'user' });

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should deny access if user is missing', () => {
    const context = mockExecutionContext(undefined);

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
