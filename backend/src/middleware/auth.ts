import { createMiddleware } from 'hono/factory';
import type { AppType } from '../app';
import { verifyAuthToken } from '../services/authService';

export const authMiddleware = createMiddleware<AppType>(async (c, next) => {
  const authResult = await verifyAuthToken(c.req.raw, c.env);

  if (!authResult.success || !authResult.sessionId) {
    return c.json({
      success: false,
      error: authResult.error || 'Unauthorized',
      timestamp: new Date().toISOString(),
    }, 401);
  }

  c.set('sessionId', authResult.sessionId);
  await next();
});
