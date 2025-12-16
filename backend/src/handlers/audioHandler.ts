import type { Env } from '../types/env';
import { transcribeAudio } from '../services/transcriptionService';
import { generateAIResponse } from '../services/aiService';
import {
  ConversationHistorySchema,
  type DOHistoryResponse,
  type ConversationHistory,
} from '../schemas';

export interface AudioHandlerResult {
  transcription: string;
  aiResponse: string;
  processingTime: number;
}

export async function handleAudioTranscription(
  audioBlob: Blob,
  env: Env,
  durableObject: DurableObjectStub,
): Promise<AudioHandlerResult> {
  const startTime = Date.now();

  try {
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioArray = new Uint8Array(audioBuffer);
    const transcription = await transcribeAudio(audioArray, env);

    if (!transcription) {
      throw new Error('Transcription failed or returned empty result');
    }

    await durableObject.fetch(
      new Request('http://do/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: transcription }),
      }),
    );

    let history: ConversationHistory = [];
    try {
      const historyResponse = await durableObject.fetch(new Request('http://do/history'));
      const raw: unknown = await historyResponse.json();
      const doHistory = raw as DOHistoryResponse;
      history = ConversationHistorySchema.parse(doHistory.data?.messages || []);
    } catch (error) {
      console.warn('Failed to fetch history, using empty array:', error);
    }

    const aiResponse = await generateAIResponse(transcription, env, history);

    await durableObject.fetch(
      new Request('http://do/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: aiResponse }),
      }),
    );

    const processingTime = Date.now() - startTime;

    return {
      transcription,
      aiResponse,
      processingTime,
    };
  } catch (error) {
    console.error('Audio handler error:', error);
    throw error;
  }
}
