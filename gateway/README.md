# OliveWatch AI gateway

The only service that talks to Google Gemini. `mobile/`, `platform/` and `landing/` call this gateway; they never hold
a key and never call Gemini directly. Node + TypeScript + Express.

## Run

    cd gateway
    npm install
    cp .env.example .env        # then set GEMINI_API_KEY (https://aistudio.google.com/apikey)
    npm run dev                 # http://localhost:8787   (npm start for a single run)

`.env` is git-ignored. The server **refuses to start** (exit code 1, clear message) if `GEMINI_API_KEY` is missing.
Never use an `EXPO_PUBLIC_` / `VITE_` variable for the key: those are bundled into the apps.

| Variable | Default | Meaning |
|---|---|---|
| `GEMINI_API_KEY` | required | read only from the environment at startup |
| `PORT` | 8787 | |
| `ALLOWED_ORIGINS` | none | comma-separated CORS allow-list (requests without an Origin, e.g. curl / native app, are allowed) |
| `RATE_LIMIT_PER_MINUTE` | 30 | per-IP limit on `/ai/*` (separate from Gemini's own free-tier quota) |
| `MAX_BODY_MB` | 5 | max request body (images are sent as base64, so about 3.7 MB of picture) |

Client side: `EXPO_PUBLIC_AI_URL` (mobile), `VITE_AI_URL` (platform, landing). If unset, or the gateway is unreachable, the
apps fall back to their mock and label it simulated (`محاكاة` / `Simulated`).

## Routes

All `POST`, JSON, `lang` is `"ar"` or `"en"`.

| Route | Input | Output |
|---|---|---|
| `/ai/leaf` | `{ lang, imageBase64, mimeType }` | `{ label: healthy\|peacock_spot\|aculus_olearius\|rejected, confidence, quality, rejected, reason?, message?, reason_text?, data_source: "gemini" }` |
| `/ai/oil` | `{ lang, imageBase64, mimeType }` | `{ label: reference\|anomalous\|adulteration_indicator, confidence, rejected:false, needs_lab:false }` or `{ rejected:true, needs_lab:true, confidence, message }` (no class) |
| `/ai/advisor` | `{ lang, messages:[{role:"user"\|"assistant", text}], context? }` | `{ reply, data_source, model }` (single response, no streaming) |
| `/ai/climate` | `{ lang, facts }` (numbers computed by the app) | `{ headline, explanation, comparison?, caveats }` |
| `/ai/trace` | `{ lang, batch }` (the batch's real fields) | `{ title, summary, highlights, notes }` (`notes` are added by code) |
| `/ai/insights` | `{ lang, data }` | `{ title, priority: high\|medium\|low, reason, action }` |
| `GET /health`, `GET /ai/config` | | feature list; non-secret tuning (no instructions, never the key) |

Rules enforced **in code**, not in the prompt: leaf confidence < 0.70 or `poor` quality => rejected "unclear image, retake";
oil confidence < 0.60 => `needs_lab`, no class named; climate / trace / insights answers may not contain a number that
is not in the input (rejected, retried once); the model's JSON is validated with zod (invalid => retry once, then the
safe state); Arabic scientific terms are forced into `English (Arabic pronunciation)` (`src/ai/glossary.ts`).

Errors are normal responses: `429 { error: "rate_limited", limit: true, retry_after, fallback: "mock" }` when the free tier
is exhausted, `502 invalid_output`, `503 unavailable`, `422 blocked`, `413`, `415`, `400`, `403`. The apps treat any of
them as "use the mock".

## Failure policy

primary model -> retry once (429 / 5xx / timeout / invalid JSON) -> the feature's fallback model -> error response.

## Tuning a feature

Everything lives in `src/ai/config.ts`, one entry per feature: `model`, `fallbackModel`, `systemInstruction` (ar / en),
`temperature`, `topP`, `maxOutputTokens`, `thinkingBudget` (gemini-2.5 only), `responseMimeType` + `responseSchema`,
`input`, `timeoutMs`, `rules`. Example: to make the advisor more conservative, set `advisor.temperature` to `0.2`; to
change its model, edit `advisor.model`. This file is the only place a model name appears. Model availability changes: if
a call returns 404 "model no longer available", check https://ai.google.dev/gemini-api/docs/pricing (free tier) and update it.

## Tests

    npm test          # failure paths against a scripted Gemini stub (no key, no quota used)
    npm run test:real # every route with real requests (needs the gateway running with a real key)
    EXPO_PUBLIC_AI_URL=http://localhost:8787 npx tsx scripts/verify-mobile-ml.ts   # mobile predictLeaf / predictOil

## Privacy note

On the Gemini free tier, Google may use submitted content to improve its products. Photos and questions sent through
this gateway therefore leave your control. Do not send personal data; consider the paid tier before real farmers use it.
