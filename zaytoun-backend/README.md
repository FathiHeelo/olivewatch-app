# Zaytoun Vision backend (UV screening)

Built on the **Zaytoun Vision** project: https://github.com/Mutasem-mk4/zaytoun-vision
(copied from commit `6a6d49a`, used with the authors' permission). The Python files are unchanged.

Not copied: `model.pkl` (an XGBoost pickle that `/api/analyze` never calls; loading an external pickle runs arbitrary
code, so it stays out) and `dist/` (the original web frontend). Without `dist/`, unknown paths answer 404 instead of the
frontend page.

## What it really does

`POST /api/analyze` runs `uv_analysis.analyze_uv_sample`: a rule-based analyzer of the phone photo's RGB channels.

1. A dark-room quality gate (bright background, glare on glass edges, a red hotspot at the surface, no liquid, too small).
2. Red, green and blue proxies inside the liquid, their fractions and the red/blue and green/blue ratios.
3. Rules that map those signals to a category.

It is **not** a trained image network with measured accuracy on phone photos. The 96.2% / 88.7% figures in the
original project belong to a separate spectral (EEM) model on 314 lab records and say nothing about phone photos.
OliveWatch never shows them.

## API (the real one)

| Method | Path | Body | Notes |
|---|---|---|---|
| `POST` | `/api/analyze` | JSON `{ "imageUrl": "data:image/jpeg;base64,...", "sampleName": "..." }` | the analysis |
| `GET` | `/api/health` | | `{"status":"ok", ...}` (`/health` is not a route) |
| `GET` | `/api/history` | | the backend's own SQLite history (OliveWatch keeps its own in Firebase) |

There is no `/predict` route and no `mode` field. Main response keys: `category`
(`fresh_evoo`, `real_but_aged`, `expired_olive_oil`, `fake_or_refined`, `invalid_image`), `photoSetup.validForAnalysis`,
`photoSetup.retakeInstructions`, `qualityFlags`, `uvFingerprint`, `decisionTrace`, `confidence` (0-1).
OliveWatch also receives `purityScore`, `fakeProbability` and the backend's own verdict text, and never displays them:
`mobile/src/data/zaytounService.ts` and `platform/src/data/zaytounService.ts` turn the response into
`{ valid, decision, indicators, confidence_level, raw }` with honest wording.

## Run locally

    cd zaytoun-backend
    python -m venv .venv
    .venv\Scripts\activate            # Windows   (source .venv/bin/activate on macOS / Linux)
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Check: `http://localhost:8000/api/health` and the API docs at `http://localhost:8000/docs`.
The apps read the address from `EXPO_PUBLIC_ZAYTOUN_API_URL` (mobile) and `VITE_ZAYTOUN_API_URL` (platform).
Never hardcode it, and never put Azure keys or `.env` files in the repository: this backend needs none.

Before relying on a deployed URL (for example the original Azure one), make one real `POST /api/analyze` call against it.
`/api/health` answering is not enough.

## Tests

`python -m unittest test_uv_analysis -v`. The reference-cache test needs the original project's `Raw_data/` folder,
which is not copied here.
