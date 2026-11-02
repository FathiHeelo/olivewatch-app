# OliveWatch platform (web dashboard for olive mills)

Vite + React + TypeScript + react-router. Arabic, RTL. Reads live from Firebase Realtime Database.
Everything shown is sample data (تجريبية); oil screening results are simulated (محاكاة).

## Run

    npm install
    npm run dev          # http://localhost:5174
    npm run typecheck    # tsc --noEmit
    npm run build        # type-check + production build into dist/

The Firebase web config is in `src/firebase.ts` (project identifiers, not secrets). Seed the database first:
`cd ../firebase && npm install && npm run seed`.

## Look and language
The shell and the home page (`/`) follow the Stitch design "OliveWatch AI - Farmer Web Dashboard": brand card,
five-item nav (Home, My Farms, AI Tools, Analytics, Profile), top bar, pledge banner, grove + weather, threat alert,
six metrics, AI toolkit, activity + satellite view, recommended action. The grove (name, area, trees, health) is live
from Firebase (`src/data/farm.ts`); the weather, metrics and activity feed are placeholder copy from the design.

The language button (sidebar, top bar, Profile) switches Arabic (RTL) and English (LTR) and is remembered
(`?lang=en|ar` overrides). In Arabic every string is Arabic except scientific terms, which keep their English name with
the Arabic pronunciation in parentheses, e.g. `NDVI (إن دي في آي)`. Strings: `src/i18n/dictionary.ts`.
The AI tools from the design open as overlays (`src/components/overlays/`): the AI agronomist drawer (chat with canned
replies), farm details, the leaf scanner (file picker; the result is the design's fixed Peacock Spot example, with a
"preliminary" note) and "Certify Press Lot" (UI only: it shows a toast and writes nothing). Other buttons show the toasts the
design has.

The mill pages built earlier (`/mill`, `/batches`, `/suppliers`, `/samples`, `/climate`, `/traceability`) keep working
and take the new colours, but they are still Arabic-only and are not translated yet; they are reachable from `/tools`.

## Pages

| Route | Page |
|---|---|
| `/` | نظرة عامة: KPIs computed from the batches, weekly olives chart, latest batches, "تسجيل دفعة جديدة" |
| `/batches` | الدفعات: tabs, search, count, sort, table |
| `/batches/:id` | تفاصيل الدفعة: screening card, timeline, supplier, QR |
| `/suppliers`, `/samples` | الموردون، فحص العينات |
| `/climate` | المناخ والأقمار الصناعية: villages ranked by CSI, map, NDVI (simulated) |
| `/traceability` | التتبع والتقارير: batch passports, consumer page preview, CSV season report |

## Data flow

- `src/data/repository.ts`: `subscribeBatches / subscribeSuppliers / subscribeSamples / subscribeMill`, each an
  `onValue` subscription that returns an unsubscribe function. Writes: `addBatch` (set at `/batches/<id>`),
  `requestLabCheck` (an internal note on the batch; nothing is sent to a lab).
- `src/data/DataProvider.tsx` subscribes once and shares the data. Pages update the moment the database changes.
- If the database does not answer within 5 s (or refuses the read) the bundled copy `src/data/mill-data.json`
  is shown with a visible warning, `console.warn("[OliveWatch] using local sample data: ...")`, and saving is
  disabled. The source of that copy is `../firebase/mill-data.json`; keep them in sync.
- Realtime Database drops `null`, so a missing value is an omitted field (for example `oilLitres` on a batch
  that is not pressed yet). The UI shows a grey dash.
- KPIs are computed in `src/data/kpis.ts` from the batch and sample records; nothing is stored.
  With the seed data: 5 batches, 6,390 kg olives, 907 L oil, 4 of 5 samples screened, 1 needs lab.
- The Climate Stress Index is recomputed in `src/data/csi.ts` (never stored):
  `CSI = 100*(0.4*min(dT/4,1) + 0.4*min(-dP/40,1) + 0.2*min(d/30,1))`, `(2,-20,10) -> 46.7`.

## Honesty rules

- Source chips: حقيقية / تجريبية / محاكاة. Today nothing is real.
- Oil screening is preliminary, not a quality certificate. Below 60% confidence it says "يحتاج تحقق مخبري" and
  names no class.
- A QR code links a batch to its record; it does not prove authenticity.
- The NDVI series is simulated and needs interpretation; it does not diagnose disease on its own.
- The map uses OpenStreetMap tiles with attribution; if tiles are blocked it falls back to an SVG schematic.

## Design

Flat, light theme; tokens in `src/styles/tokens.css`. Font: IBM Plex Sans Arabic via `@fontsource` (no CDN).
Olive at full strength only on small marks (the one filled button, chart marks, the active nav icon).
