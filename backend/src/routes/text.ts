import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppType } from '../app';
import { authMiddleware } from '../middleware/auth';
import { durableObjectMiddleware } from '../middleware/durable-object';
import { TextRequestSchema } from '../schemas';
import { handleTextQuery } from '../handlers/textHandler';

const text = new Hono<AppType>();

text.use('*', authMiddleware);
text.use('*', durableObjectMiddleware);

text.post('/', zValidator('json', TextRequestSchema), async (c) => {
  const { prompt } = c.req.valid('json');
  const durableObject = c.get('durableObject');

  const result = await handleTextQuery(prompt, c.env, durableObject);

  return c.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

export default text;
