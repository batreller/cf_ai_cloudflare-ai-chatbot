import { z } from 'zod';

export const TextRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(10000, 'Prompt too long (max 10000 characters)')
    .trim(),
});

export type TextRequest = z.infer<typeof TextRequestSchema>;

export const VoiceFormSchema = z.object({
  audio: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Audio file is empty')
    .refine((file) => file.size < 25 * 1024 * 1024, 'Audio file too large (max 25MB)')
    .refine(
      (file) => ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'].includes(file.type),
      'Invalid audio format (supported: webm, mp3, wav, ogg)',
    ),
});

export type VoiceForm = z.infer<typeof VoiceFormSchema>;

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ConversationHistorySchema = z.array(MessageSchema);
export type ConversationHistory = z.infer<typeof ConversationHistorySchema>;

export type DOHistoryResponse = {
  data?: {
    messages?: Message[];
  };
};

export const ClearResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      message: z.string(),
    })
    .optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
});

export type ClearResponse = z.infer<typeof ClearResponseSchema>;
