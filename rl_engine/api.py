"""
MoveWise RL Engine — FastAPI Backend
======================================
REST API for integrating the RL engine with Sajjad's React frontend.
Replaces the hardcoded mockData.js values with live RL-powered decisions.

Architecture (v3 §3 — MaaS Super-App Service Portfolio):
  The API serves as the "AI Engine" (v3 §3.2) that powers:
  - Multi-modal route ranking with personalized GC (v3 §5)
  - Nudge selection using the dedicated Q-network (v3 Eq. 5)
  - User behavioral profile tracking (v3 §6 — HUR model)
  - Real-time trip recording with habit/phase updates

Interface contract:
  All response shapes match the data structures in movewise-react/src/data/mockData.js
  so the React components can switch from static imports to fetch() with zero changes.

Endpoints:
  GET  /api/health              → Health check + model status
  GET  /api/routes/{trip_type}  → Ranked routes (matches mockData.routeOptions)
  GET  /api/nudge/select        → Optimal nudge (matches mockData.nudges[i])
  GET  /api/nudge/all           → All nudges for current state (matches mockData.nudges)
  GET  /api/user/profile        → Full user profile (matches mockData.userProfile)
  GET  /api/carbon              → Carbon budget (matches mockData.carbonData)
  GET  /api/adoption            → Adoption phases (matches mockData.adoptionPhases)
  POST /api/user/trip           → Record a trip and get updated state
  GET  /api/simulation/run      → Run a full training simulation (demo mode)
  GET  /api/simulation/status   → Get current simulation status

CORS enabled for React frontend integration (http://localhost:5173).
"""

import os
import math
import time
from typing import Optional, List, Dict

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import (
    MODES, NUM_MODES, NUM_NUDGES, NUDGE_TYPES, MODE_PROFILES,
    GIUSEPPE, RL_CONFIG, EMISSION_FACTORS,
)
from .generalized_cost import compute_generalized_cost, rank_modes
from .environment import MaaSEnvironment
from .agent import DQNAgent

# ─── App Setup ────────────────────────────────────────────────────
app = FastAPI(
    title="MoveWise RL Engine",
    description="Behaviorally-Aware MaaS Recommendation Engine — NEXUS 2026",
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════
#  MODE DISPLAY METADATA
#  Maps internal mode keys → frontend-friendly display data that
#  matches the shape of mockData.routeOptions[].
# ═══════════════════════════════════════════════════════════════════

MODE_DISPLAY = {
    "car_passenger": {
        "icon": "🚗",
        "title_prefix": "🚗",
        "segments": [
            {"mode": "🚗", "name": "Car (Passenger)", "provider": "Family"},
        ],
        "label": "Status Quo",
        "subtitle": "Current habit — family drives you",
        "tags": ["Door-to-door", "Can study"],
    },
    "car_driver": {
        "icon": "🚙",
        "title_prefix": "🚙",
        "segments": [
            {"mode": "🚙", "name": "Car (Driver)", "provider": "Own car"},
        ],
        "label": "Drive",
        "subtitle": "Drive yourself — maximum flexibility",
        "tags": ["Door-to-door", "Flexible"],
    },
    "pr_train": {
        "icon": "🅿️",
        "title_prefix": "🅿️",
        "segments": [
            {"mode": "🚗", "name": "Drive to P&R", "provider": "Family"},
            {"mode": "🚂", "name": "Train SFM1", "provider": "GTT"},
            {"mode": "🚶", "name": "Walk", "provider": ""},
        ],
        "label": "P&R",
        "subtitle": "Park & Ride — best of both worlds",
        "tags": ["Seated train", "Can study", "Parking included"],
    },
    "escooter_train": {
        "icon": "🌿",
        "title_prefix": "🌿",
        "segments": [
            {"mode": "🛴", "name": "E-Scooter", "provider": "Voi"},
            {"mode": "🚂", "name": "Train SFM1", "provider": "GTT"},
            {"mode": "🚶", "name": "Walk", "provider": ""},
        ],
        "label": "RL Recommended",
        "subtitle": "Personalized by AI based on your behavioral profile",
        "tags": ["Seated train", "Can study", "Wi-Fi"],
    },
    "bus_train": {
        "icon": "💰",
        "title_prefix": "💰",
        "segments": [
            {"mode": "🚌", "name": "Bus 32", "provider": "GTT"},
            {"mode": "🚂", "name": "Train SFM1", "provider": "Trenitalia"},
            {"mode": "🚶", "name": "Walk", "provider": ""},
        ],
        "label": "Budget",
        "subtitle": "Lowest monetary cost",
        "tags": ["Budget friendly"],
    },
    "carpool": {
        "icon": "🚗",
        "title_prefix": "🚗",
        "segments": [
            {"mode": "🚗", "name": "Carpool", "provider": "MoveWise Pool"},
            {"mode": "🚶", "name": "Walk", "provider": ""},
        ],
        "label": "Social",
        "subtitle": "Share the ride with fellow students",
        "tags": ["Social", "Door-to-door", "Shared cost"],
    },
    "walk_train_bike": {
        "icon": "🌍",
        "title_prefix": "🌍",
        "segments": [
            {"mode": "🚶", "name": "Walk", "provider": ""},
            {"mode": "🚂", "name": "Train SFM1", "provider": "GTT"},
            {"mode": "🚲", "name": "Bike Share", "provider": "ToBike"},
        ],
        "label": "Eco",
        "subtitle": "Maximum CO₂ reduction — zero emissions",
        "tags": ["Zero emission", "Exercise", "Scenic route"],
    },
}

# Nudge display metadata: matches mockData.nudges shape
NUDGE_DISPLAY = {
    "default_green": {
        "type": "default_green",
        "icon": "🌿",
        "text": "Your greenest option is shown first — one tap to book!",
    },
    "social_proof": {
        "type": "social_proof",
        "icon": "👥",
        "text": "87% of students on your route take the train. Try it this week!",
    },
    "loss_frame": {
        "type": "loss_frame",
        "icon": "💸",
        "text": "You're losing €450/month on hidden car costs. See the breakdown →",
    },
    "carbon_budget": {
        "type": "carbon_budget",
        "icon": "🌍",
        "text": "You've used 58% of your monthly carbon budget. Switch to train to stay on track!",
    },
    "streak_reminder": {
        "type": "streak",
        "icon": "🔥",
        "text": "5-day green streak! Don't break it — ride green tomorrow too!",
    },
    "commitment": {
        "type": "commitment",
        "icon": "🤝",
        "text": "Try PT for 1 week. If you don't like it, get a free ride back!",
    },
    "anchoring": {
        "type": "anchor",
        "icon": "⚡",
        "text": "Car: €510/mo true cost vs PT: €55/mo. That's €5,460/yr saved.",
    },
}


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
        self.total_trips = 13            # Matches mockData.userProfile.totalTrips
        self.session_co2_saved = 0.0
        self.total_co2_saved = 42.0      # Matches mockData.userProfile.totalCO2Saved
        self.session_green_points = 0
        self.green_score = 720           # Matches mockData.userProfile.greenScore
        self.streak = 5                  # Matches mockData.userProfile.streak
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


# ─── Helpers ──────────────────────────────────────────────────────

def _car_co2_per_trip() -> float:
    """Baseline CO₂ for car_passenger (kg) — used for % comparisons."""
    return MODE_PROFILES["car_passenger"].co2_kg_per_trip


def _co2_percent_vs_car(co2_kg: float) -> str:
    """Format CO₂ as '−XX%' compared to driving, matching mockData.routeOptions[].co2."""
    car_co2 = _car_co2_per_trip()
    if car_co2 <= 0:
        return "0%"
    reduction = (1 - co2_kg / car_co2) * 100
    return f"-{reduction:.0f}%"


def _co2_saved_kg(co2_kg: float) -> str:
    """Format CO₂ saved in kg vs car, matching mockData.routeOptions[].co2Saved."""
    saved = _car_co2_per_trip() - co2_kg
    return f"{max(saved, 0):.1f} kg"


def _comfort_label(score: float) -> str:
    """Convert 0–1 comfort score to text label matching mockData."""
    if score >= 0.8:
        return "High"
    elif score >= 0.6:
        return "Medium"
    else:
        return "Low"


def _green_points_for_mode(mode_key: str) -> int:
    """Approximate green points per trip, matching mockData.routeOptions[].greenPoints."""
    points = {
        "car_passenger": 0, "car_driver": 0,
        "pr_train": 25, "escooter_train": 50,
        "bus_train": 35, "carpool": 40,
        "walk_train_bike": 75,
    }
    return points.get(mode_key, 10)


def _distribute_segment_durations(profile, segments_meta: list) -> list:
    """
    Distribute total travel time across segments proportionally.
    Returns segments with 'duration' field added, matching mockData shape.
    """
    n_segments = len(segments_meta)
    if n_segments == 1:
        return [{**s, "duration": f"{int(profile.travel_time_min)} min"} for s in segments_meta]

    # Heuristic: walking segments get walking_min, rest split proportionally
    walking_min = profile.walking_min
    remaining = profile.travel_time_min - walking_min
    walk_segments = sum(1 for s in segments_meta if s["mode"] in ("🚶",))
    non_walk = n_segments - walk_segments
    walk_each = int(walking_min / max(walk_segments, 1))
    other_each = int(remaining / max(non_walk, 1))

    result = []
    for s in segments_meta:
        if s["mode"] == "🚶":
            result.append({**s, "duration": f"{walk_each} min"})
        else:
            result.append({**s, "duration": f"{other_each} min"})
    return result


def _level_from_score(score: int) -> tuple:
    """Compute level, level name, and next-level points from green score."""
    levels = [
        (0, "Seedling"), (200, "Sprout"), (500, "Eco Explorer"),
        (750, "Eco Champion"), (1200, "Green Hero"), (2000, "Planet Guardian"),
    ]
    current_level = 0
    current_name = levels[0][1]
    next_threshold = levels[1][0] if len(levels) > 1 else 9999

    for i, (threshold, name) in enumerate(levels):
        if score >= threshold:
            current_level = i
            current_name = name
            next_threshold = levels[i + 1][0] if i + 1 < len(levels) else threshold + 500
    points_to_next = max(next_threshold - score, 0)
    return current_level, current_name, points_to_next


# ─── Pydantic Models ─────────────────────────────────────────────

class TripRecord(BaseModel):
    mode_chosen: str
    trip_type: str = "commute"
    distance_km: float = 11.0
    weather: str = "clear"

class SimulationRequest(BaseModel):
    num_episodes: int = 200
    num_weeks: int = 7


# ═══════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "engine": "MoveWise RL v0.4.0",
        "model_loaded": STATE.agent is not None,
        "trip_count": STATE.trip_count,
    }


# ───────────────────────────────────────────────────────────────────
#  GET /api/routes/{trip_type}
#  Response shape matches: mockData.routeOptions
#  Consumed by: TripsScreen.jsx, HomeScreen.jsx
# ───────────────────────────────────────────────────────────────────

@app.get("/api/routes/{trip_type}")
def get_routes(
    trip_type: str,
    phase: Optional[int] = Query(None, ge=0, le=3),
    weather: str = Query("clear"),
    peak: bool = Query(True),
):
    """
    Return ranked modes for a given trip type.
    Replaces the hardcoded `routeOptions` array in mockData.js.

    Response shape matches what TripsScreen.jsx expects:
      { id, title, label, subtitle, segments[], totalTime, cost,
        co2, co2Saved, reliability, comfort, greenPoints, gcScore, tags }
    """
    # Use live phase from environment if not specified
    current_phase = phase if phase is not None else (STATE.env.phase if STATE.env else 0)

    ranked = rank_modes(
        GIUSEPPE,
        current_phase=current_phase,
        weather=weather,
        time_of_day="morning_peak" if peak else "afternoon",
    )

    routes = []
    for i, r in enumerate(ranked):
        mode_key = r["mode"]
        profile = MODE_PROFILES[mode_key]
        display = MODE_DISPLAY.get(mode_key, MODE_DISPLAY["bus_train"])

        # Build segments with distributed durations
        segments = _distribute_segment_durations(profile, display["segments"])

        # The top-ranked route gets the "RL Recommended" label
        label = "RL Recommended" if i == 0 else display["label"]
        subtitle = ("Personalized by AI based on your behavioral profile"
                     if i == 0 else display["subtitle"])

        routes.append({
            "id": i + 1,
            "title": f"{display['title_prefix']} {profile.name}",
            "label": label,
            "subtitle": subtitle,
            "segments": segments,
            "totalTime": f"{int(profile.travel_time_min)} min",
            "cost": f"€{profile.monetary_cost_eur:.2f}",
            "co2": _co2_percent_vs_car(profile.co2_kg_per_trip),
            "co2Saved": _co2_saved_kg(profile.co2_kg_per_trip),
            "reliability": f"{profile.reliability * 100:.0f}%",
            "comfort": _comfort_label(profile.comfort_score),
            "greenPoints": _green_points_for_mode(mode_key),
            "gcScore": round(r["gc_total"], 1),
            "tags": display["tags"],
            # Extra fields for programmatic use (not in mockData but harmless)
            "_mode_key": mode_key,
            "_co2_kg": round(profile.co2_kg_per_trip, 2),
            "_cost_eur": round(profile.monetary_cost_eur, 2),
            "_travel_time_min": int(profile.travel_time_min),
            "_isGreen": mode_key not in ("car_driver", "car_passenger"),
        })

    return routes   # Return array directly — matches `export const routeOptions = [...]`


# ───────────────────────────────────────────────────────────────────
#  GET /api/nudge/select   → single best nudge
#  GET /api/nudge/all      → all nudges (matches mockData.nudges)
#  Consumed by: HomeScreen.jsx (NudgeBanner)
# ───────────────────────────────────────────────────────────────────

@app.get("/api/nudge/select")
def select_nudge(
    phase: Optional[int] = Query(None, ge=0, le=3),
    habit: Optional[float] = Query(None, ge=0.0, le=1.0),
):
    """
    Select the optimal nudge for the current user state.
    Response shape matches a single mockData.nudges[i]:
      { id, type, text, icon }
    """
    current_phase = phase if phase is not None else (STATE.env.phase if STATE.env else 0)
    current_habit = habit if habit is not None else (STATE.env.habit if STATE.env else 0.7)

    # Choose nudge
    if STATE.agent is not None and STATE.env is not None:
        state = STATE.env._get_state()
        action = STATE.agent.select_action(state, training=False)
        nudge_idx = action % NUM_NUDGES
    else:
        # Fallback: rule-based
        if current_habit > 0.6:
            nudge_idx = 2  # loss_frame
        elif current_habit > 0.3:
            nudge_idx = 4  # streak_reminder
        else:
            nudge_idx = 1  # social_proof

    nudge_key = NUDGE_TYPES[nudge_idx]
    display = NUDGE_DISPLAY.get(nudge_key, NUDGE_DISPLAY["social_proof"])

    # Personalise dynamic nudges using live state
    text = display["text"]
    if nudge_key == "carbon_budget" and STATE.env:
        co2_used = STATE.env.car_trips * _car_co2_per_trip()
        budget = GIUSEPPE.co2_target_monthly
        pct = min(co2_used / budget * 100, 100) if budget > 0 else 0
        text = f"You've used {pct:.0f}% of your monthly carbon budget. Switch to train to stay on track!"
    elif nudge_key == "streak_reminder":
        text = f"{STATE.streak}-day green streak! Don't break it — ride green tomorrow too!"

    return {
        "id": nudge_idx + 1,
        "type": display["type"],
        "text": text,
        "icon": display["icon"],
    }


@app.get("/api/nudge/all")
def get_all_nudges():
    """
    Return all nudge options. Matches mockData.nudges array shape:
      [{ id, type, text, icon }, ...]
    """
    nudges = []
    for i, key in enumerate(NUDGE_TYPES):
        display = NUDGE_DISPLAY.get(key, NUDGE_DISPLAY["social_proof"])
        nudges.append({
            "id": i + 1,
            "type": display["type"],
            "text": display["text"],
            "icon": display["icon"],
        })
    return nudges


# ───────────────────────────────────────────────────────────────────
#  GET /api/user/profile
#  Response shape matches: mockData.userProfile
#  Consumed by: HomeScreen, ProfileScreen, UserProfileScreen,
#               RankingsScreen, InsuranceScreen
# ───────────────────────────────────────────────────────────────────

@app.get("/api/user/profile")
def get_user_profile():
    """
    Return the full user profile matching mockData.userProfile shape.
    Behavioral parameters are updated live from the RL environment.
    """
    user = GIUSEPPE
    env = STATE.env
    current_habit = round(env.habit if env else user.habit_strength, 2)
    current_phase = env.phase if env else 0
    current_green_pts = env.green_points if env else 0

    # Compute level from live green score
    live_score = STATE.green_score + current_green_pts
    level, level_name, next_level_pts = _level_from_score(live_score)

    return {
        "name": user.name,
        "surname": "S.",
        "age": user.age,
        "role": "Medical Student",
        "university": "Università di Torino",
        "campus": "San Luigi, Orbassano",
        "home": "Caselle Torinese",
        "segment": user.segment,
        "greenScore": live_score,
        "level": level,
        "levelName": level_name,
        "nextLevelPoints": next_level_pts,
        "totalCO2Saved": round(STATE.total_co2_saved + STATE.session_co2_saved, 1),
        "totalTrips": STATE.total_trips + STATE.trip_count,
        "streak": STATE.streak,
        "monthlySpend": 55,
        "priorities": {
            "Time": "High",
            "Cost": "Medium",
            "Comfort": "High",
            "CO₂": "High",
        },
        "preferences": [
            {"id": "seated", "label": "Prefer Seated", "icon": "💺",
             "description": "Prefer seated journeys so I can study/work", "active": True},
            {"id": "wifi", "label": "Wi-Fi Needed", "icon": "📶",
             "description": "Need Wi-Fi or power outlets during travel", "active": True},
            {"id": "no_transfers", "label": "Fewer Transfers", "icon": "🔗",
             "description": "Minimise transfers between modes", "active": False},
            {"id": "low_walk", "label": "Less Walking", "icon": "🦶",
             "description": "Keep walking segments under 10 min", "active": False},
            {"id": "weather_safe", "label": "Weather-Proof", "icon": "☔",
             "description": "Avoid open-air modes in bad weather", "active": True},
            {"id": "avoid_crowd", "label": "Avoid Crowding", "icon": "👥",
             "description": "Prefer less crowded options", "active": False},
            {"id": "safety_first", "label": "Safety First", "icon": "🛡️",
             "description": "Prefer dedicated lanes and well-lit routes", "active": True},
            {"id": "scenic", "label": "Scenic Route", "icon": "🌳",
             "description": "Prefer greener, quieter paths when possible", "active": False},
            {"id": "eco_priority", "label": "Eco Priority", "icon": "🌱",
             "description": "Always show the greenest option first", "active": True},
            {"id": "cargo", "label": "Carry Items", "icon": "🛍️",
             "description": "I often carry bags or shopping", "active": False},
            {"id": "flexible_time", "label": "Flexible Schedule", "icon": "⏰",
             "description": "I can leave ±15 min for a better route", "active": False},
            {"id": "open_carpool", "label": "Open to Carpooling", "icon": "🚗",
             "description": "Include carpool matches in suggestions", "active": False},
            {"id": "ev_prefer", "label": "Prefer Electric", "icon": "⚡",
             "description": "Prefer electric/zero-emission vehicles", "active": False},
            {"id": "accessibility", "label": "Accessibility", "icon": "♿",
             "description": "Need step-free access and ramps", "active": False},
        ],
        "behavioralParams": {
            "Habit Strength": current_habit,
            "Eco Sensitivity": user.eco_sensitivity,
            "Loss Aversion": user.loss_aversion,
            "Car Status": user.car_status,
        },
        # Extra RL fields (not in original mockData, but useful for advanced displays)
        "_rl": {
            "phase": current_phase,
            "green_trips": env.green_trips if env else 0,
            "car_trips": env.car_trips if env else 0,
            "vot_driver": user.vot_driver,
            "vot_passenger": user.vot_passenger,
            "trip_distance_km": user.trip_distance_km,
            "commute_days": user.commute_days,
            "monthly_budget": user.monthly_budget,
            "co2_target_monthly": user.co2_target_monthly,
        },
    }


# ───────────────────────────────────────────────────────────────────
#  GET /api/carbon
#  Response shape matches: mockData.carbonData
#  Consumed by: ProfileScreen, RankingsScreen
# ───────────────────────────────────────────────────────────────────

@app.get("/api/carbon")
def get_carbon_data():
    """
    Return carbon budget data matching mockData.carbonData shape:
      { monthlyBudget, used, saved, yearly, breakdown[] }
    """
    env = STATE.env
    car_trips = env.car_trips if env else 5
    green_trips = env.green_trips if env else 6
    carpool_trips = 2  # Baseline from mockData

    car_co2 = round(car_trips * _car_co2_per_trip(), 1)
    green_co2 = round(green_trips * 0.84, 1)     # avg green mode emission
    carpool_co2 = round(carpool_trips * 2.1, 1)
    total_used = round(car_co2 + green_co2 + carpool_co2, 1)
    saved = round(STATE.total_co2_saved + STATE.session_co2_saved, 1)

    return {
        "monthlyBudget": 100,
        "used": total_used,
        "saved": saved,
        "yearly": round(saved * 12 / max(STATE.total_trips + STATE.trip_count, 1) * 52, 0),
        "breakdown": [
            {"mode": "Car (alone)", "trips": car_trips,
             "co2": car_co2, "color": "#ef4444"},
            {"mode": "Train + E-Scooter", "trips": green_trips,
             "co2": green_co2, "color": "#22c55e"},
            {"mode": "Carpooling", "trips": carpool_trips,
             "co2": carpool_co2, "color": "#8b5cf6"},
        ],
    }


# ───────────────────────────────────────────────────────────────────
#  GET /api/adoption
#  Response shape matches: mockData.adoptionPhases
#  Consumed by: HomeScreen (phased adoption journey)
# ───────────────────────────────────────────────────────────────────

@app.get("/api/adoption")
def get_adoption_phases():
    """
    Return adoption phase data matching mockData.adoptionPhases shape:
      [{ phase, name, desc, status, co2, cost }, ...]
    Live: the 'status' field reflects the user's actual phase.
    """
    current_phase = STATE.env.phase if STATE.env else 0

    phases = [
        {"phase": 0, "name": "Onboarding",
         "desc": "Install via insurance/parking services",
         "co2": "—", "cost": "—"},
        {"phase": 1, "name": "P&R → Train",
         "desc": "Family car to P&R, then train",
         "co2": "-50%", "cost": "€45/mo"},
        {"phase": 2, "name": "E-Scooter → Train → Walk",
         "desc": "Full green commute",
         "co2": "-75%", "cost": "€55/mo"},
        {"phase": 3, "name": "Carpooling + PT",
         "desc": "Peer carpooling for non-commute trips",
         "co2": "-80%", "cost": "€50/mo"},
    ]

    for p in phases:
        if p["phase"] < current_phase:
            p["status"] = "done"
        elif p["phase"] == current_phase:
            p["status"] = "active"
        else:
            p["status"] = "upcoming"

    return phases


# ───────────────────────────────────────────────────────────────────
#  POST /api/user/trip
#  Records a trip and returns updated state.
# ───────────────────────────────────────────────────────────────────

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
        mode_idx = 0  # Default to car_passenger

    # Select nudge using agent
    state = env._get_state()
    action = STATE.agent.select_action(state, training=False) if STATE.agent else 0
    nudge_idx = action % NUM_NUDGES

    # Create compound action
    compound_action = mode_idx * NUM_NUDGES + nudge_idx

    # Step the environment
    next_state, reward, done, info = env.step(compound_action)

    STATE.trip_count += 1
    co2_saved = info.get("co2_saved", 0)
    is_green = info.get("green_trip", False)

    if co2_saved > 0:
        STATE.session_co2_saved += co2_saved
    if is_green:
        pts_earned = info.get("green_points_earned", 0)
        STATE.session_green_points += pts_earned
        STATE.green_score += pts_earned
        STATE.streak += 1
    else:
        STATE.streak = 0

    return {
        "trip_number": STATE.trip_count,
        "mode_chosen": trip.mode_chosen,
        "reward": round(reward, 3),
        "co2_saved": round(co2_saved, 3),
        "accepted": info.get("accepted", False),
        "habit": round(env.habit, 3),
        "phase": env.phase,
        "green_points": env.green_points,
        "greenScore": STATE.green_score,
        "streak": STATE.streak,
        "session_co2_saved": round(STATE.session_co2_saved, 2),
        "done": done,
    }


# ───────────────────────────────────────────────────────────────────
#  GET /api/simulation/run & /api/simulation/status
# ───────────────────────────────────────────────────────────────────

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
