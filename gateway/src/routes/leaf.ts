// POST /ai/leaf  { lang, imageBase64, mimeType }  ->  the contract of predictLeaf in mobile/src/data/ml.ts:
// { label, confidence, quality, rejected, reason?, data_source: "gemini" }
import type { Request, Response } from 'express';
import { FEATURES } from '../ai/config.js';
import { finishLeaf, leafUnclear, checkImage, normalizeText } from '../ai/postprocess.js';
import { AiUnavailable, parseJson, runFeature } from '../ai/run.js';
import { leafSchema, imageRequest } from '../ai/schemas.js';
import { badRequest, internal, sendUnavailable } from './respond.js';

export async function leaf(req: Request, res: Response) {
  const p = imageRequest.safeParse(req.body);
  if (!p.success) return badRequest(res, p.error);
  const { lang, imageBase64, mimeType } = p.data;
  const img = checkImage(imageBase64, mimeType);
  if (!img.ok) return res.status(img.status).json({ error: img.error });

  try {
    const r = await runFeature(
      FEATURES.leaf,
      lang,
      [{ role: 'user', parts: [{ inlineData: { mimeType, data: imageBase64.replace(/^data:[^,]+,/, '') } }, { text: 'Classify this olive leaf photo.' }] }],
      (t) => parseJson(t, leafSchema),
    );
    return res.json({ ...finishLeaf(r.data, lang), reason_text: r.data.reason ? normalizeText(r.data.reason, lang) : undefined, model: r.model, used_fallback: r.usedFallback });
  } catch (e) {
    // Invalid model output must never produce a confident label: fall to the "unclear image, retake" state.
    if (e instanceof AiUnavailable && e.reason === 'invalid_output') return res.json({ ...leafUnclear(lang), model: null });
    if (e instanceof AiUnavailable) return sendUnavailable(res, e);
    return internal(res, e);
  }
}
