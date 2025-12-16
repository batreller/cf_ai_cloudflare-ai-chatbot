import { createMiddleware } from 'hono/factory';
import type { AppType } from '../app';

export const durableObjectMiddleware = createMiddleware<AppType>(async (c, next) => {
  const sessionId = c.get('sessionId');

  const durableObjectId = c.env.CONVERSATION_MEMORY.idFromName(sessionId);
  const durableObject = c.env.CONVERSATION_MEMORY.get(durableObjectId);

  c.set('durableObject', durableObject);
  await next();
});
