# OliveWatch landing (marketing site)

Single-page Arabic RTL site about the project. Vite + React + TypeScript. Laid out like a printed annual report:
one vertical axis at about 42% of the width, text pages alternating with full-bleed flat colour pages.
Solid colours only (olive, sage, oil-gold, deep ink); square corners; one 56px solid button.

## Run

    npm install
    npm run dev          # http://localhost:5175
    npm run typecheck    # tsc --noEmit
    npm run test:csi     # asserts the Climate Stress Index formula (2,-20,10 -> 46.7, clamping, bands)
    npm run build        # type-check + production build into dist/

## Sections

Hero, how it works (four run-ins), a live Climate Stress Index demo (three sliders, formula recomputed in
`src/csi.ts` on every input), data sources (what is simulated, stated plainly), frank questions (answers visible),
inverted closing screen, footer with the wordmark fitted to the full width (`src/components/FitText.tsx`).

## Honesty

- Nothing on this page is real data. The demo inputs are illustrative and chipped "تجريبية".
- No statistics, customers, testimonials or certifications. No photos: flat colour fields only.
- Oil screening is not a quality certificate; a QR code does not prove authenticity; no treatment advice.
- There is deliberately **no sign-up form**. While the database uses open demo rules, anything collected (such as
  emails for a pilot) would be world-readable. Add it only after the rules are locked down.
- `src/firebase.ts` holds the shared Firebase config (Realtime Database, project identifiers only). The page does
  not import it, because it needs no live data.
