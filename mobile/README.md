# OliveWatch AI — demo app (Expo)

The screens are built from the Stitch project "OliveWatch AI Mobile App" (Terra Terroir Agritech): Home, Groves,
Scan (leaf scanner), Climate (satellite watch + risk simulator), Profile, and the stack screens Diagnostic Report,
UV Oil Analyzer and Batch Passport. Layout, icons, colours and copy follow the design; strings are bilingual
(Arabic + English) and the layout is left-to-right like the design.

## Language
The «عربي / EN» pill on Home (and the Language row in Profile) switches the whole app. Arabic mode: every string is
Arabic, the layout is right-to-left, and scientific terms keep their English name followed by the Arabic
pronunciation, e.g. `NDVI (إن دي في آي)`. English mode: English text, left-to-right. Strings live in
`src/i18n/dictionary.ts`; `Txt` translates them automatically. On web the choice is kept in localStorage and
`?lang=en|ar` overrides it. A string missing from the dictionary is shown as written.

## Run
    npm install
    npx expo start          # press w for web, or scan the QR with Expo Go

## Content
Following the owner's instruction the screens do not carry sample-data labels. Most figures, names, lab values,
the "Official Seal" and the treatment plan are **placeholder copy taken from the Stitch design**, not real data.
Only the farm, plots and climate inputs come from the Realtime Database (see below).

## Where things are
- `src/theme.ts` design tokens (from the Stitch design theme)
- `src/data/repository.ts` data layer behind one interface (Realtime Database subscriptions + seed.json fallback)
- `src/data/seed.json` source of truth for the farm demo data (also the offline fallback)
- `src/data/climate.ts` Climate Stress Index (46.7 for dT=2, dP=-20, 10 dry days)
- `src/data/ml.ts` calls the ML service; falls back to a mock if `EXPO_PUBLIC_ML_URL` is not set

## Connect the ML service (FastAPI from the ML Build Plan)
    EXPO_PUBLIC_ML_URL=http://<your-ip>:8000 npx expo start
The app posts the leaf photo to `POST /predict/leaf` (field `file`). The response shape it expects is
`{ label, confidence, quality, rejected?, data_source }`; adjust `src/data/ml.ts` if the service differs.

## Firebase Realtime Database
`src/firebase.ts` holds the web config (project identifiers, not secrets). `getRepository()` returns a
`RealtimeRepository`: `subscribeHome` / `subscribeClimate` use `onValue`, so screens update live. If nothing arrives
within 5 s (or the read is denied) the app falls back to `src/data/seed.json` and logs
`[OliveWatch] using local sample data: ...`. Only the climate inputs are stored; the CSI is recomputed in code.
Seed the database with `cd ../firebase && npm run seed`.
