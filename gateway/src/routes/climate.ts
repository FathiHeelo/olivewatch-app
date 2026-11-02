// POST /ai/climate  { lang, facts }  ->  { headline, explanation, comparison?, caveats, data_source }
// `facts` holds numbers the APP computed (CSI, scenarios). The model only narrates; a number it adds that is not in
// `facts` makes the answer invalid (retried once, then rejected).
import type { Request, Response } from 'express';
import { FEATURES } from '../ai/config.js';
import { deepGlossary } from '../ai/glossary.js';
import { DATA_SOURCE, foreignNumbers } from '../ai/postprocess.js';
import { AiUnavailable, parseJson, runFeature } from '../ai/run.js';
import { climateRequest, climateSchema } from '../ai/schemas.js';
import { badRequest, internal, sendUnavailable } from './respond.js';

export async function climate(req: Request, res: Response) {
  const p = climateRequest.safeParse(req.body);
  if (!p.success) return badRequest(res, p.error);
  const { lang, facts } = p.data;

  try {
    const r = await runFeature(
      FEATURES.climate,
      lang,
      [{ role: 'user', parts: [{ text: `FACTS (computed by the app, quote exactly): ${JSON.stringify(facts)}` }] }],
      (t) => {
        const out = parseJson(t, climateSchema);
        const bad = foreignNumbers([out.headline, out.explanation, ...(out.comparison ?? []), ...out.caveats], facts);
        if (bad.length) throw new Error(`numbers not in input: ${bad.join(',')}`);
        return out;
      },
    );
    return res.json({ ...deepGlossary(r.data, lang), data_source: DATA_SOURCE, model: r.model, used_fallback: r.usedFallback });
  } catch (e) {
    if (e instanceof AiUnavailable) return sendUnavailable(res, e);
    return internal(res, e);
  }
}
