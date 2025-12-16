import { Hono } from 'hono';
import type { AppType } from '../app';
import { createAuthToken } from '../services/authService';

const auth = new Hono<AppType>();

auth.post('/', async (c) => {
  const sessionId = crypto.randomUUID();
  const token = await createAuthToken(sessionId, c.env);

  return c.json({
    success: true,
    data: {
      token,
      expiresIn: 3600 * 24 * 30, // 30 days
    },
    timestamp: new Date().toISOString(),
  });
});

export default auth;
