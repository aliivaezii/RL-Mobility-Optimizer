# MoveWise — AI-Powered Sustainable Mobility Platform

[![CI](https://github.com/Sajjad-Shahali/RL-Mobility-Optimizer/actions/workflows/ci.yml/badge.svg)](https://github.com/Sajjad-Shahali/RL-Mobility-Optimizer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed.svg)](https://docs.docker.com/compose/)

> **NEXUS 2026 Hackathon** | Politecnico di Torino  
> React + Vite + Three.js + Leaflet/OpenStreetMap

**Authors:** Ali Vaezi, Sajjad Shahali, Kiana Salimi

---

## The Problem: Unsustainable Urban Mobility

Urban transportation is the single largest contributor to CO₂ emissions in European cities, accounting for **30% of total EU greenhouse gas emissions** (European Environment Agency, 2024). In the Torino metropolitan area alone:

- **72% of daily commuters** drive alone, despite available public transport alternatives
- The average car sits idle **96% of the time**, yet costs owners €510/month in true costs (fuel, insurance, depreciation, parking, maintenance, time value)
- A typical 30 km car commute produces **4.2 kg CO₂ per day** — over **1 tonne per year** per commuter
- Traffic congestion costs EU economies **€270 billion annually** in lost productivity
- Poor air quality from transport emissions causes **300,000 premature deaths** per year in Europe

Students and young professionals in suburban corridors (like Caselle Torinese → Orbassano) face a particularly difficult challenge: limited direct public transport connections force them into car dependency, even when they would prefer greener alternatives.

### Why Existing Solutions Fall Short

Traditional mobility apps (Google Maps, Moovit, CityMapper) only solve **route planning**. They don't address the deeper behavioral and economic barriers to sustainable transport adoption:

| Barrier | What's Missing |
|---------|---------------|
| **Habit inertia** | People stick with cars out of routine, not rational choice |
| **Perceived cost illusion** | Drivers think they spend €60/mo on transport (just fuel) when the true cost is €510/mo |
| **Information asymmetry** | Users don't know their CO₂ footprint or that PT could save them 80% |
| **Fragmented experience** | Bus, train, scooter, bike — all separate apps, separate tickets |
| **No positive reinforcement** | No rewards for choosing green transport |
| **Insurance disconnect** | Car insurance doesn't reflect actual driving behavior |

---

## The Solution: MoveWise — Mobility-as-a-Service (MaaS)

MoveWise is a **comprehensive MaaS (Mobility-as-a-Service) super-app** that integrates all transport modes into a single platform, uses **Reinforcement Learning** to personalise recommendations, and employs **behavioral economics** to nudge users toward sustainable choices.

### What is MaaS?

**Mobility-as-a-Service (MaaS)** is a paradigm shift in urban transport. Instead of owning a vehicle, users access a spectrum of transport options — public transit, e-scooters, bike-sharing, carpooling, and on-demand rides — through a **single digital platform** with **unified payment** and **seamless journey planning**.

Key MaaS principles implemented in MoveWise:

1. **Integration** — All transport modes (GTT buses, Trenitalia trains, Voi/Lime e-scooters, ToBike, carpooling) under one roof
2. **Personalisation** — AI-powered route ranking based on individual preferences, habits, and behavioral profile
3. **Unified Payment** — One QR code for tap-in/tap-out across all modes; digital wallet with budget tracking
4. **Subscription Models** — Pay-as-you-go, monthly PT bundle (€49/mo), or Premium (€65/mo with insurance)
5. **Behavioral Nudging** — Gamification, social proof, loss framing, and commitment devices to encourage adoption

### How MoveWise Reduces CO₂ Emissions

MoveWise tackles emissions through a **multi-pronged approach**:

#### 1. Modal Shift — From Car to Multimodal
By making it effortless to combine e-scooter → train → walk, MoveWise enables routes that are **80–95% lower in CO₂** than driving alone:

| Route Type | CO₂ per Trip | Reduction vs Car |
|------------|-------------|-----------------|
| Car (alone, 30 km) | 4.20 kg | — |
| E-Scooter + Train + Walk | 0.84 kg | **-80%** |
| Bus + Train + Walk | 1.60 kg | **-62%** |
| Walk + Train + Bike | 0.21 kg | **-95%** |
| Carpool (2 persons) | 2.10 kg | **-50%** |

*Emission factors from EEA 2024: Car = 140 g/km, Bus = 68 g/km, Train = 14 g/km, E-Scooter = 22 g/km, Bike/Walk = 0 g/km*

#### 2. True Cost Transparency
Most drivers dramatically underestimate their car costs. MoveWise's **True Cost Calculator** reveals the full picture:

- **Perceived cost**: €60/month (just fuel "feeling")
- **Actual cost**: €510/month (fuel €120 + insurance €47 + depreciation €180 + maintenance €45 + parking €40 + fines €15 + time value €63)
- **MoveWise PT bundle**: €55/month → **Save €455/month = €5,460/year**

This "loss framing" nudge leverages the psychological principle that people feel losses 2.25× more strongly than equivalent gains (Kahneman & Tversky, 1979).

#### 3. Insurance-Linked Incentives
MoveWise partners with insurance providers (UnipolSai) to offer **premium reductions based on PT usage**:

- Use public transport 3+ days/week → **15% lower car insurance premium**
- Less driving = lower accident risk = actuarially justified discount
- Annual saving: €560 → €476 (€84/year)
- Data sharing is anonymised and GDPR-compliant via IVASS intermediary

#### 4. Gamification & Social Proof
Behavioral science shows that **social norms and rewards** are powerful motivators:

- **Green Points**: Earn points for every eco-trip (50 pts for best route, 75 pts for greenest)
- **Leaderboard**: Compare with peers on your corridor
- **Challenges**: "Try 3 different modes this week" → 100 bonus points
- **Badges**: Achievement system (First Train Ride, 10 kg CO₂ Saved, Multimodal Week)
- **Social proof nudge**: "87% of students on your route take the train"
- **Streak system**: Consecutive green travel days with escalating rewards

#### 5. Phased Adoption Journey
Rather than expecting overnight behavior change, MoveWise guides users through **gradual phases**:

| Phase | Transition | CO₂ Reduction | Monthly Cost |
|-------|-----------|--------------|-------------|
| 0. Onboarding | Install via insurance/parking services | — | — |
| 1. Park & Ride | Drive to P&R, then train | -50% | €45/mo |
| 2. Full Multimodal | E-Scooter → Train → Walk | -75% | €55/mo |
| 3. Carpool + PT | Peer carpooling for non-commute | -80% | €50/mo |

---

## How MoveWise Saves Time

Contrary to the perception that public transport is slower, MoveWise demonstrates that **multimodal routes can match or beat car travel times** in urban settings:

- **Average car commute** Caselle → Orbassano: **45 min** (with traffic, parking, walking to campus)
- **MoveWise optimised route**: **30 min** (e-scooter 7 min + train 18 min + walk 5 min)
- **Time saved**: 15 min per trip = **2.5 hours/week** = **130 hours/year**

Additionally:
- **Productive time**: Train segments allow studying, reading, or working (unlike driving)
- **No parking search**: Eliminates 10–15 min average parking time near campus
- **Real-time optimisation**: Routes adapt to live traffic, delays, and weather
- **Schedule flexibility**: "Leave at" / "Arrive by" planning with ±15 min buffer

---

## Reinforcement Learning (RL) — The Brain of MoveWise

MoveWise uses a **Deep Q-Network (DQN)** as its recommendation engine. The RL agent learns from each user's behavior to rank routes using a **Generalised Cost (GC) function**:

```
GC(route) = α₁·Time + α₂·Cost + α₃·Comfort + α₄·CO₂ + α₅·Transfers + α₆·Reliability
```

Where α₁...α₆ are **personalised weights** derived from the user's behavioral profile.

### HUR Behavioral Model

The RL agent is grounded in the **HUR (Habits–Utility–Rationality) model**, which captures three dimensions of human decision-making:

- **Habits (H)** — Habit strength parameter: how likely the user is to repeat past choices regardless of alternatives
- **Utility (U)** — Traditional utility maximisation: time, cost, comfort trade-offs
- **Rationality (R)** — Bounded rationality: loss aversion, status bias, social influence

### Nudge Selection

A second RL agent selects the **optimal behavioral nudge** for each user and context:

```
Nudge*(i,t) = argmax Q̂(s_i^t, nudge; θ_nudge)
```

Nudge types include:
- **Social proof**: "87% of students on your route take the train"
- **Loss framing**: "You're losing €450/month on hidden car costs"
- **Commitment device**: "Try PT for 1 week — free ride back if you don't like it"
- **Streak reward**: "5-day green streak! Don't break it!"
- **Anchoring**: "Car: €510/mo vs PT: €55/mo — that's €5,460/yr saved"

---

## Features in Detail

### Core Features

#### RL-Powered Route Planner
- **4 smart tabs**: Best For You (RL-ranked), Cheapest, Fastest, Greenest
- **5 multimodal routes** per search with different modal combinations
- Each route shows time, cost, CO₂ savings, comfort level, reliability, and Green Points
- Interactive 3D route arc visualisation
- Origin/Destination inputs with swap, time selection (Leave at / Arrive by)

#### QR Tap-In / Tap-Out Payment
- Unified QR code for all transport modes (bus, train, e-scooter, bike)
- **Expandable journey timeline**: click any step to see provider, cost, departure time, route details
- Real-time status tracking (Done ✅ / Active ⏳ / Pending ○)
- NFC alternative tap
- Digital wallet with balance, budget bar, transaction history
- **3 subscription plans**: Pay-as-you-go, Monthly PT Bundle (€49), Premium (€65)

#### Carpooling
- Peer-to-peer ride matching among university students
- Route overlap % and detour estimation
- Live OpenStreetMap integration via Leaflet
- Ride history with past trips, ratings, and CO₂ savings
- Safety & community features: verified profiles, ride ratings
- Cost splitting with fair pricing

#### Insurance & Parking Hub
- **Premium calculator**: Current vs potential premium with PT usage
- **Coverage management**: 8 coverage options with real-time monthly premium calculation; toggle coverages and see price impact instantly
- **Parking finder**: 3 P&R spots along corridor with live availability
- **Fuel prices**: Nearby stations with current prices
- **AI chatbot**: Insurance assistant with keyword-based responses for premiums, coverage, claims, parking, and discounts
- **Claims center**: Emergency contacts, claim filing

#### Gamification & Rewards
- **Green Points** system with earning and redemption
- **Rewards catalog**: Redeem points for GTT passes, e-scooter rides, café vouchers, bike passes, cinema tickets, tree planting
- **Community leaderboard** with CO₂ savings ranking
- **Active challenges**: Weekly goals with progress tracking
- **Badge collection**: 8 achievement badges (earned + locked)
- **Carbon emissions 3D skyline**: Visual breakdown by transport mode

#### Profile Hub
- **Interactive Priority Levels**: Tap to cycle Time, Cost, Comfort, CO₂ between Low/Medium/High
- **14 travel preferences**: Toggle switches that feed the RL engine (seated, Wi-Fi, fewer transfers, weather-proof, etc.)
- **RL Behavioral Profile**: Live visualisation of HUR model parameters
- **True Cost Calculator**: Side-by-side perceived vs actual car costs with full breakdown
- **Carbon Budget**: Monthly ring chart with yearly projection
- **Privacy & Support**: GDPR data export, account deletion, support chat

### UX & Onboarding

#### Professional Consent Prompt
- GDPR-compliant with 6 legal articles covering:
  - Definitions, Terms of Service, Data Collection & Privacy
  - Your Rights (access, rectification, erasure, portability, objection)
  - Insurance Data Sharing, Carpooling Terms
- Actual logo branding
- Summary cards for Terms, Privacy, and Insurance

#### 9-Step Overlay Tutorial
- Interactive tutorial with 3D robot assistant (Movi)
- Semi-transparent backdrop that shows the actual app underneath
- **Bold keywords** highlighting important concepts
- Progress bar + navigation dots + skip button
- Steps cover: Welcome, AI Recommendations, Route Planning, QR Payment, Adoption Journey, Insurance, Rewards, Carpooling, Completion

#### Interactive Phone Shell
- iPhone-style frame (393×852px) with realistic notch
- 5-tab bottom navigation (Home, Trips, Pay, Rank, Profile)
- Branded gradient headers with contextual icons
- Toast notification system for user feedback

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18.3 + Vite 5 | Component-based UI with fast HMR |
| **3D Graphics** | Three.js + @react-three/fiber + @react-three/drei | Route arc, QR parallax, wallet cards, TutorBot robot, trophy, emissions skyline |
| **Maps** | Leaflet + react-leaflet 4.2 (OpenStreetMap) | Carpool route visualisation, live map |
| **Styling** | CSS custom properties + responsive design | Consistent theming, mobile-first layout |
| **State Management** | React hooks (useState, useEffect, useMemo, useRef) | Local component state, no external state library needed |
| **Build** | Vite 5 with @vitejs/plugin-react | ESM-based bundling, optimised production builds |
| **Data** | Mock data in JS modules | Structured data with API endpoint annotations for production |

### Architecture Decisions

- **No backend required** — All data is mocked for the hackathon demo. Every data source is annotated with `🔌 API NEEDED` comments specifying the exact endpoint, parameters, and provider needed for production
- **Unicode escape sequences** — All emoji in JSX use `\u{XXXXX}` format for cross-platform encoding safety
- **CSS-only animations** — Pulse dots, slide-ups, fade-ins without runtime JS overhead
- **3D performance** — React Three Fiber with Suspense boundaries for lazy loading; lightweight geometries
- **Accessibility** — ARIA labels on interactive elements, semantic HTML, keyboard navigable

### External API Integrations (Production Roadmap)

| API | Provider | Purpose |
|-----|----------|---------|
| Route Planning | Google Routes API / HERE Transit / OpenTripPlanner + GTFS | Multimodal route computation |
| Real-time Transit | GTT Open Data / Trenitalia API | Live departures, delays, capacity |
| E-Scooter Availability | Voi / Lime MDS API | Real-time scooter locations and pricing |
| Bike Sharing | ToBike API | Station availability, bike count |
| QR Payments | Stripe / Satispay / Nexi | Secure tokenised transactions |
| Insurance | UnipolSai / Generali via IVASS | Premium calculation, policy management |
| Carbon Calculation | EEA 2024 emission factors | Per-trip and cumulative CO₂ tracking |
| Gamification | Custom microservice | Points, leaderboard, challenges, badges |
| User Profiling | RL behavioral engine (HUR model) | Personalised weight vectors |
| Maps | OpenStreetMap / Mapbox | Tile rendering, geocoding |

---

## Project Structure

```text
movewise-react/
  src/
    App.jsx                    # Root: consent → splash → onboarding overlay → main routing
    main.jsx                   # Entry point + Leaflet CSS import
    data/
      mockData.js              # All mock data (routes, carpool, insurance, wallet, etc.)
    components/
      PhoneShell.jsx           # iPhone frame + overlay support
      BottomNav.jsx            # 5-tab navigation
      HomeScreen.jsx           # Services grid, RL trip suggestion, adoption journey
      TripsScreen.jsx          # Route planner: OD inputs, 3D arc, 4 tabs with 5 routes each
      PayScreen.jsx            # QR payment, expandable journey timeline, wallet, plans
      RankingsScreen.jsx       # Leaderboard, challenges, badges, rewards catalog
      ProfileScreen.jsx        # Profile hub: priorities, preferences, insurance, carbon, RL profile
      UserProfileScreen.jsx    # Extended behavioral profile
      InsuranceScreen.jsx      # Coverage with pricing, parking, claims, AI chatbot
      CarpoolScreen.jsx        # Ride matching, Leaflet map, history, safety & community
      ConsentPrompt.jsx        # GDPR consent + full legal terms page (6 articles)
      OnboardingTutorial.jsx   # 9-step overlay tutorial with 3D robot + bold keyword text
      SplashScreen.jsx         # Branded splash screen with 3D city
      three/                   # 3D components (RouteArc, QRParallax, CardStack, TutorBot, Trophy, EmissionsSkyline, CityFlyIn)
      ui/                      # Shared UI (Card, NudgeBanner)
    styles/
      app.css                  # All styles (~3200+ lines)
  public/
    assets/
      logo.jpg                 # MoveWise logo
```

---

## Install and Run

```bash
cd movewise-react
npm install
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

## Troubleshooting

If `npm` is not recognized:
1. Install Node.js LTS from https://nodejs.org/
2. Reopen terminal
3. Verify: `node -v` and `npm -v`

### Resetting Consent & Onboarding Tutorial

MoveWise stores two flags in your browser's `localStorage` to remember that you've already accepted the consent screen and completed the onboarding tutorial. This means on subsequent visits the app skips straight to the main experience — exactly like a real production app would behave.

**If you want to see the full onboarding flow again** (e.g. for a demo, presentation, or to show evaluators the consent + tutorial UX), open the browser Developer Console (`F12` → **Console** tab) and run:

```js
localStorage.removeItem("movewise_consent");
localStorage.removeItem("movewise_onboarded");
location.reload();
```

| Command | What it does |
|---------|-------------|
| `localStorage.removeItem("movewise_consent")` | Clears the consent acceptance — you'll see the GDPR consent screen again on reload |
| `localStorage.removeItem("movewise_onboarded")` | Clears the tutorial completion — you'll see the 9-step onboarding tutorial again |
| `location.reload()` | Refreshes the page so the cleared flags take effect |

You can also reset just one of them if you only want to re-trigger the consent **or** the tutorial, not both.

> **Why do we persist these flags?** In a real MaaS app, asking users to re-consent every time they open the app would be a terrible UX and potentially non-compliant with GDPR best practices (consent should be collected once and recorded). The tutorial similarly should only appear for first-time users. `localStorage` provides lightweight client-side persistence that survives page refreshes and browser restarts.

---

## Impact Summary

| Metric | Per User/Year | Scaled (1,000 users) |
|--------|--------------|---------------------|
| CO₂ reduced | 1,000 kg | 1,000 tonnes |
| Money saved | €5,460 | €5.46 million |
| Time saved | 130 hours | 130,000 hours |
| Cars off road (peak) | 1 | 1,000 |
| Green Points generated | 18,000 | 18 million |

MoveWise doesn't just plan routes — it **transforms mobility behavior** through AI personalisation, economic transparency, insurance incentives, and gamification. Every trip planned through MoveWise is a step toward cleaner air, less congestion, and a more sustainable city.

---

> *Built for NEXUS 2026 Hackathon — Politecnico di Torino*  
> *Ali Vaezi, Sajjad Shahali, Kiana Salimi — March 2026*
