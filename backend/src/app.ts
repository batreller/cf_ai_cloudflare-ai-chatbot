import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types/env';
import type { Variables } from './types/variables';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './routes/auth';
import textRoutes from './routes/text';
import voiceRoutes from './routes/voice';
import historyRoutes from './routes/history';
import clearRoutes from './routes/clear';

export type AppType = {
  Bindings: Env;
  Variables: Variables;
};

const app = new Hono<AppType>();

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (c) => c.json({
  success: true,
  message: 'ChatBot is running',
  timestamp: new Date().toISOString()
}));

app.route('/api/auth', authRoutes);
app.route('/api/text', textRoutes);
app.route('/api/voice', voiceRoutes);
app.route('/api/history', historyRoutes);
app.route('/api/clear', clearRoutes);

app.notFound((c) => c.json({
  success: false,
  error: 'Route not found',
  timestamp: new Date().toISOString()
}, 404));

app.onError(errorHandler);

export default app;
