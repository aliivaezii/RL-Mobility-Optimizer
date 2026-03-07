# MoveWise - NEXUS 2026 Project Repository

MoveWise is a Mobility-as-a-Service (MaaS) concept developed for the NEXUS 2026 competition.
This repository contains:
- competition analysis inputs,
- the final solution formulation,
- legacy and upgraded frontend demos,
- branding assets,
- and supporting local tooling artifacts.

---

## 1) Project Purpose

The project proposes an RL-powered MaaS super-app that helps shift car-dependent users toward greener travel behavior through:
- personalized multimodal route recommendations,
- QR tap-in/tap-out integrated payment,
- behavior nudges and gamification,
- insurance-linked incentives,
- and practical onboarding for car users (parking/fuel touchpoints).

---

## 2) Repository Structure

```text
nexus/
  Competition matirial/
    RL_MaaS_Formulation_v3.tex
    RL_MaaS_Formulation_v3.pdf
    TOPIC BOOKLET NEXUS 2026 (2).pdf

  movewise-react/
    (React/Vite upgraded demo app)

  Demo/
    index.html
    (single-file merged HTML demo)

  movewise_app_mockup.html
  logo.jpg

  nexus_2026_problem_extract.json
  _pdf_extracted_pages.json

  RL-Mobility-Optimizer/
  texlive/
  .env/
```

### Main folders/files explained

- `Competition matirial/`
  - Core competition documents and final technical formulation in LaTeX/PDF.
- `movewise-react/`
  - Modern React implementation of the app demo (recommended frontend for presentations and future extension).
- `Demo/`
  - Lightweight merged HTML/CSS/JS demo version.
- `movewise_app_mockup.html`
  - Original visual mockup reference (design baseline).
- `logo.jpg`
  - Brand logo, also used by the React splash and app headers.
- `nexus_2026_problem_extract.json`, `_pdf_extracted_pages.json`
  - Structured extracted/problem context data.

---

## 3) Design and Product Scope

### Current UX direction

The latest direction keeps MoveWise Home as the visual center and merges feature areas into practical hubs:
- Home
- Trips
- Pay
- Rankings
- Profile

### Included demo capabilities

- Home dashboard with recommendation card and service tiles
- Route/trips panel with route options, carpool, parking/fuel snapshot
- QR payment journey timeline
- Rewards and leaderboard summary
- Insurance, profile preferences, privacy and support actions
- App feedback via toast messages

---

## 4) Recommended Demo to Run

Use `movewise-react/` for repo/demo quality.
Use `Demo/index.html` for a static fallback.

---

## 5) Running the React App (`movewise-react`)

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm (bundled with Node.js)

## Install and run

```bash
cd D:\hachaton\nexus\movewise-react
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## Build and preview production

```bash
cd D:\hachaton\nexus\movewise-react
npm run build
npm run preview
```

---

## 6) Running the Static HTML Demo

Open directly in browser:
- `D:\hachaton\nexus\Demo\index.html`

No build step required.

---

## 7) React App Architecture (`movewise-react`)

High-level structure:

- `src/App.jsx`
  - app state container, splash timing, active screen routing, feedback toast
- `src/components/`
  - screen-level components (Home/Trips/Pay/Rankings/Profile)
  - `SplashScreen.jsx`
  - `PhoneShell.jsx`
  - `BottomNav.jsx`
- `src/components/ui/Card.jsx`
  - reusable card primitive
- `src/data/mockData.js`
  - mock nav and screen data
- `src/styles/app.css`
  - global tokens, responsive rules, component styles
- `public/logo.jpg`
  - logo asset for splash/header/QR marker

---

## 8) Intro/Splash Behavior

In the React app:
- branded splash screen appears on startup,
- stays for exactly 2 seconds,
- transitions automatically to the main app.

---

## 9) Data and Documentation Inputs

Core source inputs for the competition solution:
- `Competition matirial/RL_MaaS_Formulation_v3.tex`
- `Competition matirial/TOPIC BOOKLET NEXUS 2026 (2).pdf`
- `nexus_2026_problem_extract.json`
- `_pdf_extracted_pages.json`

---

## 10) Known Environment Notes

If terminal shows `npm is not recognized`:
1. Install Node.js from https://nodejs.org/
2. Reopen terminal
3. Verify:
   ```bash
   node -v
   npm -v
   ```
4. Retry install/run commands.

---

## 11) Suggested Next Steps

1. Add React Router for URL-based navigation.
2. Add API abstraction layer and replace mock data.
3. Add charts for impact/rewards analytics.
4. Add test coverage (Vitest + React Testing Library).
5. Add CI workflow for build/lint checks.

---

## 12) License / Usage

No license file is currently included in this repository.
If this repo is being published publicly, add a license (`MIT`, `Apache-2.0`, etc.) before release.
