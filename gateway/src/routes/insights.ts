// POST /ai/insights  { lang, data }  ->  { title, priority, reason, action, data_source }
// "Your next recommended action". Facts come only from `data`; numbers outside it are rejected.
import type { Request, Response } from 'express';
import { FEATURES } from '../ai/config.js';
import { DATA_SOURCE, deepNormalize, foreignNumbers } from '../ai/postprocess.js';
import { AiUnavailable, parseJson, runFeature } from '../ai/run.js';
import { insightsRequest, insightsSchema } from '../ai/schemas.js';
import { badRequest, internal, sendUnavailable } from './respond.js';

export async function insights(req: Request, res: Response) {
  const p = insightsRequest.safeParse(req.body);
  if (!p.success) return badRequest(res, p.error);
  const { lang, data } = p.data;

  try {
    const r = await runFeature(
      FEATURES.insights,
      lang,
      [{ role: 'user', parts: [{ text: `DATA: ${JSON.stringify(data)}` }] }],
      (t) => {
        const out = parseJson(t, insightsSchema);
        const bad = foreignNumbers([out.title, out.reason, out.action], data);
        if (bad.length) throw new Error(`numbers not in input: ${bad.join(',')}`);
        return out;
      },
    );
    return res.json({ ...deepNormalize(r.data, lang), data_source: DATA_SOURCE, model: r.model, used_fallback: r.usedFallback });
  } catch (e) {
    if (e instanceof AiUnavailable) return sendUnavailable(res, e);
    return internal(res, e);
  }
}
