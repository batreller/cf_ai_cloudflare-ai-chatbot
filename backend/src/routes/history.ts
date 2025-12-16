import { Hono } from 'hono';
import type { AppType } from '../app';
import { authMiddleware } from '../middleware/auth';
import { durableObjectMiddleware } from '../middleware/durable-object';
import { ConversationHistorySchema, type DOHistoryResponse, type ConversationHistory } from '../schemas';

const history = new Hono<AppType>();

history.use('*', authMiddleware);
history.use('*', durableObjectMiddleware);

history.get('/', async (c) => {
  const durableObject = c.get('durableObject');

  const historyResponse = await durableObject.fetch(new Request('http://do/history'));
  const raw: unknown = await historyResponse.json();
  const doHistory = raw as DOHistoryResponse;

  const validation = ConversationHistorySchema.safeParse(doHistory.data?.messages);
  const historyData: ConversationHistory = validation.success ? validation.data : [];

  return c.json({
    success: true,
    data: { history: historyData },
    timestamp: new Date().toISOString(),
  });
});

export default history;
