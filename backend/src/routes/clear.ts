import { Hono } from 'hono';
import type { AppType } from '../app';
import { authMiddleware } from '../middleware/auth';
import { durableObjectMiddleware } from '../middleware/durable-object';
import { ClearResponseSchema } from '../schemas';

const clear = new Hono<AppType>();

clear.use('*', authMiddleware);
clear.use('*', durableObjectMiddleware);

clear.delete('/', async (c) => {
  const durableObject = c.get('durableObject');

  const response = await durableObject.fetch(
    new Request('http://do/clear', { method: 'DELETE' })
  );

  const data: unknown = await response.json();
  const validation = ClearResponseSchema.safeParse(data);

  if (!validation.success) {
    console.error('Clear validation failed:', validation.error);
    return c.json({
      success: false,
      error: 'Invalid response from session storage',
      timestamp: new Date().toISOString(),
    }, 500);
  }

  return c.json({
    success: true,
    data: {
      message: validation.data.data?.message || 'Session cleared',
    },
    timestamp: new Date().toISOString(),
  });
});

export default clear;
