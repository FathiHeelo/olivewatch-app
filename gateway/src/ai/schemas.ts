// Output validation. The model's JSON is checked against these zod schemas IN CODE; an invalid answer is retried
// once and then turned into a safe state by the caller (unclear image / unavailable).
import { z } from 'zod';

export const leafSchema = z.object({
  label: z.enum(['healthy', 'peacock_spot', 'aculus_olearius', 'rejected']),
  confidence: z.number().min(0).max(1),
  quality: z.enum(['good', 'acceptable', 'poor']),
  reason: z.string().max(400).optional(),
});

export const climateSchema = z.object({
  headline: z.string().min(1).max(300),
  explanation: z.string().min(1).max(2000),
  comparison: z.array(z.string().max(500)).max(10).optional(),
  caveats: z.array(z.string().max(500)).max(10),
});

export const traceSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  highlights: z.array(z.string().max(300)).max(10),
});

export const insightsSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['high', 'medium', 'low']),
  reason: z.string().min(1).max(600),
  action: z.string().min(1).max(600),
});

// ---- request bodies -------------------------------------------------------------------------------------------
const lang = z.enum(['ar', 'en']).default('en');

export const imageRequest = z.object({
  lang,
  imageBase64: z.string().min(100),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export const advisorRequest = z.object({
  lang,
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().min(1).max(2000) })).min(1).max(40),
  context: z.record(z.unknown()).optional(),
});

export const climateRequest = z.object({ lang, facts: z.record(z.unknown()) });
export const traceRequest = z.object({ lang, batch: z.record(z.unknown()) });
export const insightsRequest = z.object({ lang, data: z.record(z.unknown()) });
