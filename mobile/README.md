# OliveWatch AI — demo app (Expo)

Four Arabic RTL screens built from the Figma file "Olive": الرئيسية، فحص الورقة، المناخ، الزيت.

## Run
    npm install
    npx expo start          # press w for web, or scan the QR with Expo Go

## Honest labels
Every data block carries a source chip: حقيقية / تجريبية / محاكاة. Right now everything is sample or
simulated. The chips must change when real sources are wired in.

## Where things are
- `src/theme.ts` design tokens (from Figma)
- `src/data/repository.ts` data layer behind one interface (mock now; add Firestore here)
- `src/data/climate.ts` Climate Stress Index (46.7 for dT=2, dP=-20, 10 dry days)
- `src/data/ml.ts` calls the ML service; falls back to a mock if `EXPO_PUBLIC_ML_URL` is not set

## Connect the ML service (FastAPI from the ML Build Plan)
    EXPO_PUBLIC_ML_URL=http://<your-ip>:8000 npx expo start
The app posts the leaf photo to `POST /predict/leaf` (field `file`). The response shape it expects is
`{ label, confidence, quality, rejected?, data_source }`; adjust `src/data/ml.ts` if the service differs.

## Next: Firebase
Add a `FirestoreRepository` implementing `Repository` and return it from `getRepository()`.
