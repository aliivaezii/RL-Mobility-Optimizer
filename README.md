# MoveWise - NEXUS 2026 Repository

MoveWise is a MaaS (Mobility-as-a-Service) concept developed for NEXUS 2026.
This repository contains the competition formulation, source materials, branding assets, and the production-style React demo.

---

## Repository Contents

```text
nexus/
  Competition matirial/
    RL_MaaS_Formulation_v3.tex
    RL_MaaS_Formulation_v3.pdf
    TOPIC BOOKLET NEXUS 2026 (2).pdf

  movewise-react/
    React + Vite app (main demo)

  movewise_app_mockup.html
  nexus_2026_problem_extract.json
  _pdf_extracted_pages.json

  RL-Mobility-Optimizer/
  texlive/
  .env/
```

## Important Notes
- `Demo/` static folder was removed; `movewise-react/` is now the main demo.
- Logo is now inside React public assets: `movewise-react/public/assets/logo.jpg`.

---

## Project Goal

MoveWise proposes behavior-aware sustainable mobility through:
- RL-based multimodal route recommendation
- QR tap-in/tap-out trip flow
- gamification and rankings
- insurance-linked incentives
- profile/privacy controls

---

## Main App to Run

Use:
- `D:\hachaton\nexus\movewise-react`

---

## Run Instructions

## Prerequisites
- Node.js 18+ (Node 20 LTS recommended)
- npm

## Start development server

```bash
cd D:\hachaton\nexus\movewise-react
npm install
npm run dev
```

Open URL shown in terminal (typically `http://localhost:5173`).

## Build and preview

```bash
cd D:\hachaton\nexus\movewise-react
npm run build
npm run preview
```

---

## If npm is not recognized

Install Node.js LTS from:
- https://nodejs.org/

Then restart terminal and verify:

```bash
node -v
npm -v
```

---

## Recommended Next Improvements

1. Add React Router for URL-based navigation.
2. Replace mock data with real API integration.
3. Add analytics/event tracking.
4. Add automated tests (Vitest + RTL).
5. Add CI workflow for lint/build/test.
