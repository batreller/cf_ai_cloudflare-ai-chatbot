import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppType } from '../app';
import { authMiddleware } from '../middleware/auth';
import { durableObjectMiddleware } from '../middleware/durable-object';
import { VoiceFormSchema } from '../schemas';
import { handleAudioTranscription } from '../handlers/audioHandler';

const voice = new Hono<AppType>();

voice.use('*', authMiddleware);
voice.use('*', durableObjectMiddleware);

voice.post('/', zValidator('form', VoiceFormSchema), async (c) => {
  const { audio } = c.req.valid('form');

  const audioBlob = new Blob([await audio.arrayBuffer()], { type: audio.type });

  const durableObject = c.get('durableObject');
  const result = await handleAudioTranscription(audioBlob, c.env, durableObject);

  return c.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

export default voice;
