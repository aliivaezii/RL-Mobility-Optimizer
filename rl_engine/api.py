"""
MoveWise RL Engine — FastAPI Backend
======================================
REST API for integrating the RL engine with Sajjad's React frontend.
Replaces mockData.js hardcoded values with live RL decisions.

Endpoints:
  GET  /api/health              → Health check
  GET  /api/routes/{trip_type}  → Ranked routes for a trip type
  GET  /api/nudge/select        → Select optimal nudge
  GET  /api/user/profile        → User's current behavioral profile
  POST /api/user/trip           → Record a trip and get updated state
  GET  /api/simulation/run      → Run a full training simulation
  GET  /api/simulation/status   → Get current simulation status
"""

import os
import json
import time
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import (
    MODES, NUM_MODES, NUM_NUDGES, NUDGE_TYPES, MODE_PROFILES,
    GIUSEPPE, RL_CONFIG,
)
from .generalized_cost import compute_generalized_cost, rank_modes
from .environment import MaaSEnvironment
from .agent import DQNAgent

# ─── App Setup ────────────────────────────────────────────────────
app = FastAPI(
    title="MoveWise RL Engine",
    description="Behaviorally-Aware MaaS Recommendation Engine — NEXUS 2026",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global State ─────────────────────────────────────────────────
class AppState:
    """Mutable global state for the API server."""
    def __init__(self):
        self.agent: Optional[DQNAgent] = None
        self.env: Optional[MaaSEnvironment] = None
        self.training_in_progress = False
        self.training_progress = 0
        self.last_training_result = None
        self.trip_count = 0
        self.session_co2_saved = 0.0
        self.session_green_points = 0
        self._init_env()
    
    def _init_env(self):
        """Initialize a fresh environment for the live session."""
        self.env = MaaSEnvironment(user=GIUSEPPE, num_weeks=7, seed=42)
        self.env.reset()
        self.agent = DQNAgent(RL_CONFIG)
        # Try to load pre-trained model
        model_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "movewise_dqn.pth"
        )
        if os.path.exists(model_path):
            self.agent.load(model_path)
            self.agent.epsilon = 0.05  # Low exploration for inference

STATE = AppState()


# ─── Pydantic Models ─────────────────────────────────────────────

class TripRecord(BaseModel):
    mode_chosen: str
    trip_type: str = "commute"
    distance_km: float = 11.0
    weather: str = "clear"

class SimulationRequest(BaseModel):
    num_episodes: int = 200
    num_weeks: int = 7


# ─── Endpoints ────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "engine": "MoveWise RL v0.3.0",
        "model_loaded": STATE.agent is not None,
        "trip_count": STATE.trip_count,
    }


@app.get("/api/routes/{trip_type}")
def get_routes(
    trip_type: str,
    phase: int = Query(0, ge=0, le=3),
    weather: str = Query("clear"),
    peak: bool = Query(True),
):
    """
    Return ranked modes for a given trip type.
    Replaces the hardcoded `routeOptions` in mockData.js.
    """
    ranked = rank_modes(
        GIUSEPPE,
        current_phase=phase,
        weather=weather,
        peak=peak,
    )
    
    # Convert to format matching Sajjad's frontend
    routes = []
    for i, r in enumerate(ranked):
        mode_key = r["mode"]
        profile = MODE_PROFILES[mode_key]
        routes.append({
            "id": i + 1,
            "mode": mode_key,
            "name": r["mode_name"],
            "travelTime": int(r["travel_time_min"]),
            "cost": round(r["cost_eur"], 2),
            "co2": round(r["co2_kg"], 2),
            "gcScore": round(r["gc_total"], 2),
            "comfort": round(profile.comfort, 1),
            "reliability": round(profile.reliability, 2),
            "transfers": profile.transfers,
            "isGreen": mode_key not in ("car_driver", "car_passenger"),
            "rank": i + 1,
            "recommended": i == 0,
        })
    
    return {
        "trip_type": trip_type,
        "phase": phase,
        "weather": weather,
        "peak": peak,
        "routes": routes,
    }


@app.get("/api/nudge/select")
def select_nudge(
    phase: int = Query(0, ge=0, le=3),
    habit: float = Query(0.7, ge=0.0, le=1.0),
):
    """
    Select the optimal nudge for the current user state.
    Replaces the static nudge rotation in the frontend.
    """
    if STATE.agent is None or STATE.env is None:
        # Fallback: rule-based nudge selection
        if habit > 0.6:
            return {"nudge_type": "discount_coupon", "message": "🎫 Get 30% off your next bus trip!"}
        elif habit > 0.3:
            return {"nudge_type": "eco_feedback", "message": "🌱 You've saved 2.3 kg CO₂ this week!"}
        else:
            return {"nudge_type": "gamification", "message": "🏆 You're rank #3 in your community!"}
    
    # Use RL agent to select nudge
    state = STATE.env._get_state()
    action = STATE.agent.select_action(state, training=False)
    nudge_idx = action % NUM_NUDGES
    nudge_type = NUDGE_TYPES[nudge_idx]
    
    messages = {
        "discount_coupon": "🎫 Get 30% off your next train trip! Use code MOVEWISE30",
        "eco_feedback": f"🌱 You've saved {STATE.session_co2_saved:.1f} kg CO₂ — keep it up!",
        "social_comparison": "👥 85% of commuters on your route use public transit",
        "gamification": f"🏆 {STATE.session_green_points} Green Points! Only 50 more for Gold rank!",
        "personalized_info": "📊 The 8:15 train has 94% on-time performance this month",
        "commitment": "🤝 You're committed to 3 green trips/week — 2 done!",
        "default": "🎯 Try a new sustainable route today!",
    }
    
    return {
        "nudge_type": nudge_type,
        "nudge_index": nudge_idx,
        "message": messages.get(nudge_type, messages["default"]),
        "phase": phase,
        "habit": habit,
    }


@app.get("/api/user/profile")
def get_user_profile():
    """
    Return the current user's behavioral profile.
    Powers the ProfileScreen behavioral parameters display.
    """
    user = GIUSEPPE
    env = STATE.env
    
    return {
        "name": "Giuseppe",
        "habit_strength": round(env.habit if env else user.habit_strength, 3),
        "eco_sensitivity": user.eco_sensitivity,
        "loss_aversion": user.loss_aversion,
        "vot_driver": user.vot_driver,
        "vot_passenger": user.vot_passenger,
        "trip_distance_km": user.trip_distance_km,
        "commute_days": user.commute_days,
        "phase": env.phase if env else 0,
        "green_trips_total": env.green_trips_total if env else 0,
        "car_trips_total": env.car_trips_total if env else 0,
        "green_points": env.green_points if env else 0,
        "session_co2_saved": round(STATE.session_co2_saved, 2),
        "budget": {
            "monthly_mobility_eur": user.monthly_budget,
            "co2_target_kg": user.co2_target_monthly,
        },
        "segments": {
            "is_car_dependent": user.habit_strength > 0.5,
            "is_eco_conscious": user.eco_sensitivity > 0.5,
            "is_loss_averse": user.loss_aversion > 2.0,
        },
    }


@app.post("/api/user/trip")
def record_trip(trip: TripRecord):
    """
    Record a trip decision and return updated state.
    This is the key integration point for the React app.
    """
    env = STATE.env
    if env is None or env.done:
        STATE._init_env()
        env = STATE.env
    
    # Find the mode index
    if trip.mode_chosen in MODES:
        mode_idx = MODES.index(trip.mode_chosen)
    else:
        mode_idx = 0  # Default to public_transit
    
    # Select nudge using agent
    state = env._get_state()
    action = STATE.agent.select_action(state, training=False) if STATE.agent else 0
    nudge_idx = action % NUM_NUDGES
    
    # Create compound action
    compound_action = mode_idx * NUM_NUDGES + nudge_idx
    
    # Step the environment
    next_state, reward, done, info = env.step(compound_action)
    
    STATE.trip_count += 1
    if info.get("co2_saved", 0) > 0:
        STATE.session_co2_saved += info["co2_saved"]
    if info.get("green_trip"):
        STATE.session_green_points += info.get("green_points_earned", 0)
    
    return {
        "trip_number": STATE.trip_count,
        "mode_chosen": trip.mode_chosen,
        "reward": round(reward, 3),
        "co2_saved": round(info.get("co2_saved", 0), 3),
        "accepted": info.get("accepted", False),
        "habit": round(env.habit, 3),
        "phase": env.phase,
        "green_points": env.green_points,
        "session_co2_saved": round(STATE.session_co2_saved, 2),
        "done": done,
    }


@app.get("/api/simulation/run")
def run_simulation(
    num_episodes: int = Query(100, ge=10, le=1000),
    num_weeks: int = Query(7, ge=1, le=52),
):
    """
    Run a training simulation and return summary statistics.
    For the demo: shows the RL agent learning in real-time.
    """
    from .train import train, evaluate
    
    STATE.training_in_progress = True
    STATE.training_progress = 0
    
    try:
        result = train(
            num_episodes=num_episodes,
            num_weeks=num_weeks,
            seed=42,
            verbose=False,
        )
        
        eval_result = evaluate(result["agent"], num_episodes=20)
        
        # Update global state with trained agent
        STATE.agent = result["agent"]
        STATE.last_training_result = {
            "episodes_trained": num_episodes,
            "mean_reward": round(eval_result["mean_reward"], 2),
            "mean_green_ratio": round(eval_result["mean_green_ratio"], 3),
            "mean_co2_saved": round(eval_result["mean_co2_saved"], 1),
            "mean_habit": round(eval_result["mean_habit"], 3),
            "mean_phase": round(eval_result["mean_phase"], 1),
            "training_time": time.time(),
        }
        
        return {
            "status": "completed",
            "result": STATE.last_training_result,
        }
    
    finally:
        STATE.training_in_progress = False


@app.get("/api/simulation/status")
def simulation_status():
    return {
        "in_progress": STATE.training_in_progress,
        "last_result": STATE.last_training_result,
    }


# ─── Run ──────────────────────────────────────────────────────────

def start_server(host: str = "0.0.0.0", port: int = 8000):
    """Start the API server."""
    import uvicorn
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    start_server()
