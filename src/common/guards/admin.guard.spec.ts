import { ExecutionContext } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  const mockExecutionContext = (user?: any): ExecutionContext =>
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

  it('should allow access for admin user', async () => {
    const context = mockExecutionContext({ role: 'admin' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access for non-admin user', async () => {
    const context = mockExecutionContext({ role: 'user' });

    const result = await guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should deny access if user is missing', async () => {
    const context = mockExecutionContext(undefined);

    const result = await guard.canActivate(context);

    expect(result).toBe(false);
  });
});
