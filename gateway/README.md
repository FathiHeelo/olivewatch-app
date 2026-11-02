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
| `ALLOW_LAN_ORIGINS` | false | `true` also accepts browser origins on private LAN addresses (10.x, 172.16-31.x, 192.168.x, localhost) so the Expo **web** build opened from a phone browser can call the gateway. Not needed for Expo Go (a native app sends no Origin) |
| `RATE_LIMIT_PER_MINUTE` | 30 | per-IP limit on `/ai/*` (separate from Gemini's own free-tier quota) |
| `MAX_BODY_MB` | 5 | max request body (images are sent as base64, so about 3.7 MB of picture) |

Client side: `EXPO_PUBLIC_AI_URL` (mobile), `VITE_AI_URL` (platform, landing). If unset, or the gateway is unreachable, the
apps fall back to their mock and label it simulated (`محاكاة` / `Simulated`).

## Testing on a real phone (Expo Go) over Wi-Fi

The gateway listens on every network interface already (`app.listen(port)`, no host), so no code change is needed.

1. Phone and computer on the **same Wi-Fi** (not a guest network with client isolation).
2. Find the computer's LAN address: `ipconfig` (Windows, the IPv4 address of the Wi-Fi adapter, e.g. `192.168.1.20`).
3. Windows Firewall: allow inbound TCP on the gateway port and on Metro. In an **Administrator** PowerShell:

       New-NetFirewallRule -DisplayName "OliveWatch gateway 8787" -Direction Inbound -Protocol TCP -LocalPort 8787 -Action Allow -Profile Private
       New-NetFirewallRule -DisplayName "OliveWatch Metro 8081"   -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Private

   Run `Get-NetConnectionProfile`: the rules above apply only if your Wi-Fi is **Private**. If it says `Public`, either
   switch it (`Set-NetConnectionProfile -InterfaceAlias "<Wi-Fi alias>" -NetworkCategory Private`) or use
   `-Profile Public` in the rules for the duration of the test. Remove them afterwards:
   `Remove-NetFirewallRule -DisplayName "OliveWatch*"`.
4. Start the gateway: `cd gateway && npm run dev`. Check from the phone's browser: `http://192.168.1.20:8787/health`
   must answer `{"ok":true,...}`.
5. Point the app at it: in `mobile/.env.local` set `EXPO_PUBLIC_AI_URL=http://192.168.1.20:8787`, then restart Expo with
   the cache cleared: `cd mobile && npx expo start -c`. (`EXPO_PUBLIC_*` values are baked in when Metro bundles.)
6. Open Expo Go on the phone (it must support the project's SDK) and scan the QR code.

CORS: Expo Go is a native app and sends no `Origin` header, so CORS does not apply and `ALLOWED_ORIGINS` needs nothing.
Only if you open the Expo **web** build in a phone browser (`http://192.168.1.20:8081`) set `ALLOW_LAN_ORIGINS=true` in
`gateway/.env` (or add that exact origin to `ALLOWED_ORIGINS`). Do not set it on a gateway exposed to the internet.
The `/ai/*` per-IP rate limit counts the phone's address separately from the computer's.

## Recording the demo (browser, one origin)

Some browsers, such as the Claude desktop app's built-in browser pane, block a page from calling another port even on
`localhost` (page on `:8081`, gateway on `:8787`). `scripts/demo-proxy.mjs` (repo root, no dependencies) serves both behind
**one origin**, `http://localhost:8090`: `/ai/*` and `/health` go to the gateway (`:8787`), everything else, including
Metro's WebSocket, goes to the Expo web server (`:8081`). Bodies are streamed unchanged, so photo uploads work. The proxy
removes the `Origin` header on requests to the gateway (page and proxy are one origin, so there is nothing cross-origin
left to check), which means the gateway's `ALLOWED_ORIGINS` needs no change. It logs one line per request (method, path,
target, status), never headers or bodies.

1. Gateway running: `cd gateway && npm run dev` (port 8787).
2. `mobile/.env.local`: `EXPO_PUBLIC_AI_URL=http://localhost:8090`, then `cd mobile && npx expo start -c --web` (port 8081).
3. `node scripts/demo-proxy.mjs` (port 8090; override with `DEMO_PROXY_PORT`).
4. Open `http://localhost:8090/scan`. Check: `http://localhost:8090/health` answers `{"ok":true,...}`, and after a photo the
   proxy prints `POST /ai/leaf -> gateway 200` and the result chip says "Gemini · فحص أولي".

Go back to the phone test by setting `EXPO_PUBLIC_AI_URL` to the LAN address again (see above) and restarting Expo with `-c`.

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
