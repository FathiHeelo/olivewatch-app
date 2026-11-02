// POST /ai/oil  { lang, imageBase64, mimeType }  ->  the contract of predictOil in mobile/src/data/ml.ts:
// { label, confidence, rejected, needs_lab, data_source: "gemini" }. Below 0.60 no class is named at all.
import type { Request, Response } from 'express';
import { FEATURES } from '../ai/config.js';
import { checkImage, finishOil, oilNeedsLab } from '../ai/postprocess.js';
import { AiUnavailable, parseJson, runFeature } from '../ai/run.js';
import { imageRequest, oilSchema } from '../ai/schemas.js';
import { badRequest, internal, sendUnavailable } from './respond.js';

export async function oil(req: Request, res: Response) {
  const p = imageRequest.safeParse(req.body);
  if (!p.success) return badRequest(res, p.error);
  const { lang, imageBase64, mimeType } = p.data;
  const img = checkImage(imageBase64, mimeType);
  if (!img.ok) return res.status(img.status).json({ error: img.error });

  try {
    const r = await runFeature(
      FEATURES.oil,
      lang,
      [{ role: 'user', parts: [{ inlineData: { mimeType, data: imageBase64.replace(/^data:[^,]+,/, '') } }, { text: 'Screen this UV photo of an olive-oil sample.' }] }],
      (t) => parseJson(t, oilSchema),
    );
    return res.json({ ...finishOil(r.data, lang), model: r.model, used_fallback: r.usedFallback });
  } catch (e) {
    // Invalid model output: say "needs laboratory verification", never name a class.
    if (e instanceof AiUnavailable && e.reason === 'invalid_output') return res.json({ ...oilNeedsLab(lang), model: null });
    if (e instanceof AiUnavailable) return sendUnavailable(res, e);
    return internal(res, e);
  }
}
