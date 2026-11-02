// POST /ai/trace  { lang, batch }  ->  { title, summary, highlights, notes, data_source }
// The text is built from the batch's real fields only (numbers outside the input are rejected). The two honesty
// notes are added by CODE, not by the model.
import type { Request, Response } from 'express';
import { FEATURES } from '../ai/config.js';
import { DATA_SOURCE, deepNormalize, foreignNumbers } from '../ai/postprocess.js';
import { AiUnavailable, parseJson, runFeature } from '../ai/run.js';
import { traceRequest, traceSchema } from '../ai/schemas.js';
import { badRequest, internal, sendUnavailable } from './respond.js';

const NOTES = {
  qr: { ar: 'رمز QR يربط الدفعة بسجلها ولا يثبت أصالة المنتج.', en: 'The QR code links the batch to its record; it does not prove the product is authentic.' },
  screening: { ar: 'نتيجة الفحص أولية وليست شهادة جودة.', en: 'The screening result is preliminary, not a quality certificate.' },
};

export async function trace(req: Request, res: Response) {
  const p = traceRequest.safeParse(req.body);
  if (!p.success) return badRequest(res, p.error);
  const { lang, batch } = p.data;

  try {
    const r = await runFeature(
      FEATURES.trace,
      lang,
      [{ role: 'user', parts: [{ text: `BATCH (the only facts you may use): ${JSON.stringify(batch)}` }] }],
      (t) => {
        const out = parseJson(t, traceSchema);
        const bad = foreignNumbers([out.title, out.summary, ...out.highlights], batch);
        if (bad.length) throw new Error(`numbers not in input: ${bad.join(',')}`);
        return out;
      },
    );
    const notes = [NOTES.qr[lang], ...('screening' in batch && batch.screening ? [NOTES.screening[lang]] : [])];
    return res.json({ ...deepNormalize(r.data, lang), notes, data_source: DATA_SOURCE, model: r.model, used_fallback: r.usedFallback });
  } catch (e) {
    if (e instanceof AiUnavailable) return sendUnavailable(res, e);
    return internal(res, e);
  }
}
