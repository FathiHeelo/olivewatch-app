# OliveWatch AI (أوليف ووتش)

OliveWatch AI follows Palestinian olive groves from tree to oil: leaf disease check, climate stress index,
oil screening, traceability. UI language is Arabic, RTL. This is a hackathon demo.

## Status

| Part | State |
|---|---|
| `mobile/` Expo app (4 screens) | Working, runs on sample data |
| `firebase/` seed + check scripts, rules | Written. **Not yet run**: Cloud Firestore is not enabled for `olivewatch-ai` |
| `platform/` web dashboard for olive mills | Not built yet |
| `landing/` marketing site | Not built yet |

## Folder map

    mobile/     Expo SDK 58 + Expo Router app (farmer side)
    firebase/   Firestore seed data, seed.mjs, check.mjs, firestore.rules (demo rules, not deployed)
    platform/   (planned) Vite + React + TypeScript dashboard for mills
    landing/    (planned) Vite + React + TypeScript single-page site

Each part is independent: its own `package.json`, dependencies and scripts.

## Run

    # mobile
    cd mobile && npm install && npx expo start      # press w for web

    # firebase (needs Firestore created first, see below)
    cd firebase && npm install
    npm run seed      # idempotent: setDoc with fixed ids
    npm run check     # prints document counts per collection

## Firebase setup

Project id: `olivewatch-ai`. The web config is an identifier, not a secret; Firestore security rules are the
protection.

1. Firebase console > Build > Firestore Database > **Create database** > **(default)** > **Start in test mode**.
2. `cd firebase && npm run seed && npm run check`.
3. `firebase/firestore.rules` is demo-only (test-mode style, expires). It is not deployed by this repo.
   Do not collect personal data while test-mode rules are on: everything is world-readable.

Seed sources: `mobile/src/data/seed.json` (farms, plots, climate; also the app's offline fallback) and
`firebase/mill-data.json` (mills, suppliers, batches, samples).

## Honesty rules

- No invented statistics, customers, testimonials or certifications. Everything not real carries a source chip:
  "حقيقية" (real) / "تجريبية" (sample) / "محاكاة" (simulated). Today nothing is real.
- Oil screening is a preliminary screening, never a quality certificate. Below 60% confidence it says
  "يحتاج تحقق مخبري" and names no class.
- A QR code links a batch to its record; it does not prove authenticity.
- Leaf check is preliminary, not a final diagnosis; the app gives no treatment advice.
- Climate Stress Index: `CSI = 100*(0.4*min(dT/4,1) + 0.4*min(-dP/40,1) + 0.2*min(d/30,1))`.
  Example `(2, -20, 10) -> 46.7`. It is always recomputed in code, never stored.
- KPIs are computed from the batch records. Note: the sample batches add up to 907 L of oil, not 1,237 L.
