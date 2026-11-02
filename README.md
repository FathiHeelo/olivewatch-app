# OliveWatch AI (أوليف ووتش)

OliveWatch AI follows Palestinian olive groves from tree to oil: leaf disease check, climate stress index,
oil screening, traceability. UI language is Arabic, RTL. This is a hackathon demo: **nothing in it is real data**.

## Folder map

    mobile/     Expo SDK 58 + Expo Router app (farmer side)
    platform/   Vite + React + TypeScript dashboard for olive mills (port 5174)
    landing/    Vite + React + TypeScript single-page marketing site (port 5175)
    gateway/    Node + TypeScript AI gateway: the only service that talks to Google Gemini (see gateway/README.md)
    firebase/   Realtime Database seed data, seed.mjs, check.mjs, demo rules file (not deployed)

Each part is independent: its own `package.json`, README, dev script and build script.

## Run

    # 1. database (once)
    cd firebase && npm install && npm run seed && npm run check

    # 2. AI gateway (optional: without it the apps use their mock, labelled simulated)
    cd gateway && npm install && cp .env.example .env   # set GEMINI_API_KEY, then: npm run dev

    # 3. each part
    cd mobile   && npm install && npx expo start        # press w for web
    cd platform && npm install && npm run dev            # http://localhost:5174
    cd landing  && npm install && npm run dev            # http://localhost:5175

    # checks
    npm run typecheck && npm run build                   # in platform/ and landing/
    npx tsc --noEmit                                     # in mobile/
    npm run test:csi                                     # in landing/

## Firebase setup (Realtime Database, not Firestore)

Project `olivewatch-ai`, instance `https://olivewatch-ai-default-rtdb.firebaseio.com`. The web config is in
`src/firebase.ts` of each app; these are project identifiers, not secrets. The database rules are the protection.

1. Firebase console > Build > Realtime Database > Create Database > **test mode**.
2. Rules tab: `{ "rules": { ".read": true, ".write": true } }` for the demo (see `firebase/database.rules.json`).
   This repo never deploys rules. Open rules mean anything stored is world-readable and writable: keep personal
   data out until the rules are locked down.
3. `cd firebase && npm run seed` writes the whole tree idempotently (`update()` with fixed ids).

Tree: `/farms/farm-east`, `/plots/{p1,p2,p3}`, `/climate/latest` (inputs only), `/mills/{id}`, `/suppliers/{id}`,
`/batches/{id}`, `/samples/{id}`. Sources: `mobile/src/data/seed.json` and `firebase/mill-data.json`.
Realtime Database drops `null`, so a missing value is an omitted field and the UI shows a grey dash.

Both `seed.mjs` and `check.mjs` first run a REST preflight (`/.json?shallow=true`, 10 s timeout): 401 = rules deny,
404 = instance does not exist, and print what to click.

## How the apps stay live

`mobile/` and `platform/` read with `onValue` subscriptions, so changes show without a reload. If the database does
not answer within 5 s they show the bundled sample data and say so (`console.warn("[OliveWatch] using local sample
data: ...")`; the dashboard also shows a visible banner and refuses to save).

## Honesty rules

- **Mobile exception:** at the owner's request the mobile screens copy the Stitch design and show no sample-data labels; much of their copy (Official Seal, certified grade, lab values, treatment plan, blockchain wording) is placeholder, not real. Do not show it as real to farmers, buyers or certifiers.
- On platform/ and landing/: no invented statistics, customers, testimonials or certifications. Everything not real carries a source chip:
  "حقيقية" (real) / "تجريبية" (sample) / "محاكاة" (simulated). Today nothing is real.
- Oil screening is a preliminary screening, never a quality certificate. Below 60% confidence it says
  "يحتاج تحقق مخبري" and names no class.
- A QR code links a batch to its record; it does not prove authenticity.
- Leaf check is preliminary, not a final diagnosis; the app gives no treatment advice.
- Climate Stress Index: `CSI = 100*(0.4*min(dT/4,1) + 0.4*min(-dP/40,1) + 0.2*min(d/30,1))`.
  Example `(2, -20, 10) -> 46.7`. It is always recomputed in code, never stored.
- KPIs are computed from the batch records: with the seed data 5 batches, 6,390 kg olives, **907 L** oil (the batch
  that is not pressed yet has no oil value), 4 of 5 samples screened, 1 needs a lab check.
- There is no pilot sign-up form: with open demo rules, collected emails would be public.
- **AI features** (leaf scan, oil screening, advisor, climate narration, traceability text, insights) go through
  `gateway/` to Google Gemini on its free tier. Results carry the chip "Gemini · Preliminary" (never "real"); the confidence
  floors (leaf 0.70, oil 0.60) are enforced in code; the model may not introduce numbers that are not in the input; the key
  lives only in `gateway/.env` (git-ignored). Free-tier content may be used by Google to improve its products.
