// POST /ai/advisor  { lang, messages: [{role:'user'|'assistant', text}], context? }  ->  { reply, data_source, model }
// Single response (no streaming). `context` is trusted app data (farm, active alert, current CSI) and is passed to
// the model as a separate CONTEXT block, never mixed into the user's messages.
import type { Request, Response } from 'express';
import { FEATURES } from '../ai/config.js';
import type { Content } from '../ai/gemini.js';
import { DATA_SOURCE, normalizeText } from '../ai/postprocess.js';
import { AiUnavailable, runFeature } from '../ai/run.js';
import { advisorRequest } from '../ai/schemas.js';
import { badRequest, internal, sendUnavailable } from './respond.js';

export async function advisor(req: Request, res: Response) {
  const p = advisorRequest.safeParse(req.body);
  if (!p.success) return badRequest(res, p.error);
  const { lang, messages, context } = p.data;
  const cfg = FEATURES.advisor;

  // Keep the last N turns, and make sure the conversation starts with the user (a Gemini requirement).
  let turns = messages.slice(-(cfg.rules.maxHistory ?? 20));
  while (turns.length && turns[0].role !== 'user') turns = turns.slice(1);
  if (!turns.length || turns[turns.length - 1].role !== 'user') return res.status(400).json({ error: 'bad_request', issues: ['the last message must come from the user'] });
  const ctx = context ? JSON.stringify(context) : '';
  if (ctx.length > 4000) return res.status(413).json({ error: 'context_too_large' });

  // The CONTEXT block rides on the LAST user turn (tested: placed in the system instruction, the Arabic answers
  // drifted away from the user's question).
  const contents: Content[] = turns.map((m, i) => {
    const last = i === turns.length - 1;
    const text = last && ctx ? `CONTEXT (trusted data from the app, JSON): ${ctx}\n\nUSER QUESTION: ${m.text}` : m.text;
    return { role: m.role === 'user' ? 'user' : 'model', parts: [{ text }] };
  });

  try {
    const r = await runFeature(cfg, lang, contents, (t) => {
      const text = t.trim();
      if (!text) throw new Error('empty reply');
      return normalizeText(text, lang);
    });
    return res.json({ reply: r.data, lang, data_source: DATA_SOURCE, model: r.model, used_fallback: r.usedFallback });
  } catch (e) {
    if (e instanceof AiUnavailable) return sendUnavailable(res, e);
    return internal(res, e);
  }
}
