import type { ErrorHandler } from 'hono';
import type { AppType } from '../app';

export const errorHandler: ErrorHandler<AppType> = (err, c) => {
  console.error('Error:', err);

  let status = 500;
  let message = err.message || 'Internal server error';

  if ('status' in err && typeof err.status === 'number') {
    status = err.status;
  }

  if (message.toLowerCase().includes('json')) {
    status = 400;
    message = 'Invalid JSON format';
  }

  return c.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }, status as 500);
};
