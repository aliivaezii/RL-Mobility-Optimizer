# MoveWise RL Engine 🧠🚌

> **Reinforcement Learning for Behaviorally-Aware MaaS Route Recommendation**  
> NEXUS 2026 — Politecnico di Torino

## Overview

This module implements a complete RL engine that powers the MoveWise MaaS super-app. It uses a **Deep Q-Network (DQN)** to learn optimal recommendations that gradually shift car-dependent users toward sustainable multimodal transport.

### Key Features

| Feature | Implementation |
|---------|---------------|
| **Generalized Cost** | Multi-component GC with context-dependent VOT, Prospect Theory (μ=2.25), weather/peak adjustments |
| **Behavioral Model** | HUR (Habit-Utility-Regret) acceptance model with habit decay H_t = H₀·e^{-αt} |
| **State Space** | 18-dimensional (habit, eco-sensitivity, loss aversion, phase, weather, trip type, engagement...) |
| **Action Space** | Compound actions: 7 transport modes × 7 nudge types = 49 actions |
| **Reward** | 5-component: −[w₁·GC + w₂·CO₂ + w₃·Ψ_behavior + w₄·Φ_constraints] + w₅·Revenue |
| **Phased Adoption** | 4-phase progressive mode introduction (C10 constraint) |
| **Nudge Selection** | Separate DQN network for personalized nudge optimization |

## Architecture

```
rl_engine/
├── __init__.py           # Module exports
├── config.py             # Mode profiles, user profiles, hyperparameters
├── generalized_cost.py   # Full GC computation with Prospect Theory
├── environment.py        # MDP environment with HUR behavioral model
├── agent.py              # Double DQN agent with replay buffer
├── train.py              # Training pipeline + visualization
├── api.py                # FastAPI backend for React frontend
└── requirements.txt      # Python dependencies
```

## Quick Start

### 1. Install Dependencies

```bash
pip install -r rl_engine/requirements.txt
```

### 2. Train the Agent

```bash
python -m rl_engine.train
```

This runs the full pipeline:
1. **GC Analysis** — Ranks transport modes for each phase
2. **DQN Training** — 500 episodes, 7-week simulation per episode
3. **Evaluation** — 50 episodes with no exploration
4. **Visualization** — Saves `RL_Training_Results.pdf`

### 3. Start the API Server

```bash
cd rl_engine && uvicorn api:app --reload --port 8000
```

API endpoints:
- `GET /api/routes/{trip_type}` — Ranked routes with GC scores
- `GET /api/nudge/select` — Optimal nudge for current state
- `GET /api/user/profile` — Behavioral parameters
- `POST /api/user/trip` — Record a trip, get updated state
- `GET /api/simulation/run` — Run training demo

## Results

Training on Giuseppe's profile (23-year-old student, Giaveno → Politecnico, 11 km):

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Green Trip Ratio | 0% | **70.5%** | ↑ 70.5pp |
| CO₂ Saved | 0 kg | **85.4 kg** | per 7-week sim |
| Car Habit Strength | 0.70 | **0.10** | ↓ 85.7% |
| Adoption Phase | 0 | **3** | Full adoption |
| User Satisfaction | 0.50 | **0.52** | Maintained |

## Theory Reference

Based on `RL_MaaS_Formulation_v3.tex` (March 2026):
- **Generalized Cost**: §5 / Eq. 1 (multi-component with context-dependent VOT, Prospect Theory)
- **Habit Decay**: §6 / Eq. 2 (H_t = H₀·e^{-αt}, HUR behavioral model)
- **Enhanced State**: §7.1 / Eq. 3 (18-dim including app interaction data)
- **Reward Function**: §7.3 / Eq. 4 (5-component: GC + CO₂ + Ψ_behavior + Φ_constraints + Revenue)
- **Nudge Selection**: §4 / Eq. 5 (separate Q-network, 7 nudge types from Thaler & Sunstein)
- **Data Quality**: §7.4 / Eq. 6 (C11 constraint — QR observability)
- **Constraints**: C1–C11 (budget, time, capacity, phase C10, data quality C11)
- **Behavior Change**: §4 (4-layer toolkit: Nudges, Gamification, Economics, Education)

## Integration with React Frontend

The FastAPI backend (`api.py`) provides REST endpoints that replace the hardcoded `mockData.js` in Sajjad's React app. Connect by updating the frontend to fetch from `http://localhost:8000/api/` instead of using static data.

---

*NEXUS 2026 — Team [NUMBER] — Politecnico di Torino*
