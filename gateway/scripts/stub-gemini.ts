// A scripted stand-in for the Gemini API, used ONLY by verify-failures.ts to force failure paths that cannot be
// triggered on demand against the real service (429, malformed JSON, invented numbers, 5xx, safety blocks).
import http from 'node:http';

export type Scenario =
  | 'ok'
  | 'rate-primary' // primary model: 429; fallback model: ok
  | 'rate-all' // every model: 429
  | 'invalid-json-all' // every model: 200 but not valid JSON
  | 'invalid-then-valid' // first answer of each model is invalid, then valid
  | 'low-conf' // valid JSON, confidence below the floor
  | 'poor-quality' // leaf: confidence 0.95 but quality "poor"
  | 'foreign-numbers' // text features: an invented number in the output
  | 'server-error' // every model: 500
  | 'blocked'; // prompt blocked by safety

export type Call = { model: string; scenario: Scenario };

export function startStub(port: number) {
  let scenario: Scenario = 'ok';
  const calls: Call[] = [];
  const seen = new Map<string, number>();

  const ok = (res: http.ServerResponse, text: string) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }] }));
  };
  const err = (res: http.ServerResponse, code: number, status: string, extra: Record<string, unknown> = {}) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { code, status, message: `${status} (stub)`, ...extra } }));
  };

  // A valid answer shaped like the feature's responseSchema.
  const valid = (schema: any, low: boolean, poor: boolean, foreign: boolean): string => {
    const props = schema?.properties ?? {};
    if (!schema) return 'Stub advisor reply.';
    if ('quality' in props) return JSON.stringify({ label: 'peacock_spot', confidence: low ? 0.5 : 0.95, quality: poor ? 'poor' : 'good', reason: 'stub' });
    if ('label' in props) return JSON.stringify({ label: 'reference', confidence: low ? 0.55 : 0.9 });
    if ('headline' in props) return JSON.stringify({ headline: foreign ? 'Stress rose 37.5 percent' : 'Medium stress', explanation: 'The index is 46.7.', caveats: ['Simulated inputs.'] });
    if ('summary' in props) return JSON.stringify({ title: 'Batch', summary: foreign ? 'It holds 9999 litres.' : 'A batch from the farm.', highlights: ['ok'] });
    if ('priority' in props) return JSON.stringify({ title: 'Inspect', priority: 'high', reason: foreign ? 'Humidity hit 77 percent.' : 'There is an alert.', action: 'Inspect the plot.' });
    return '{}';
  };

  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      if (req.url === '/__scenario') {
        scenario = JSON.parse(Buffer.concat(chunks).toString()).name as Scenario;
        calls.length = 0;
        seen.clear();
        res.writeHead(204).end();
        return;
      }
      const m = req.url?.match(/\/models\/([^:]+):generateContent/);
      if (!m) return err(res, 404, 'NOT_FOUND');
      const model = m[1];
      const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      calls.push({ model, scenario });
      const n = (seen.get(model) ?? 0) + 1;
      seen.set(model, n);
      const schema = body.generationConfig?.responseSchema;
      const primary = model === 'gemini-2.5-flash';

      switch (scenario) {
        case 'rate-primary':
          return primary ? err(res, 429, 'RESOURCE_EXHAUSTED', { details: [{ retryDelay: '1s' }] }) : ok(res, valid(schema, false, false, false));
        case 'rate-all':
          return err(res, 429, 'RESOURCE_EXHAUSTED', { details: [{ retryDelay: '30s' }] });
        case 'invalid-json-all':
          return ok(res, 'this is {not valid json');
        case 'invalid-then-valid':
          return n === 1 ? ok(res, '{"label": "nope"}') : ok(res, valid(schema, false, false, false));
        case 'low-conf':
          return ok(res, valid(schema, true, false, false));
        case 'poor-quality':
          return ok(res, valid(schema, false, true, false));
        case 'foreign-numbers':
          return ok(res, valid(schema, false, false, true));
        case 'server-error':
          return err(res, 500, 'INTERNAL');
        case 'blocked':
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return void res.end(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } }));
        default:
          return ok(res, valid(schema, false, false, false));
      }
    });
  });

  return new Promise<{ calls: Call[]; setScenario: (s: Scenario) => void; close: () => void }>((resolve) =>
    server.listen(port, () =>
      resolve({
        calls,
        setScenario: (s) => {
          scenario = s;
          calls.length = 0;
          seen.clear();
        },
        close: () => server.close(),
      }),
    ),
  );
}
