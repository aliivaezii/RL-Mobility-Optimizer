"""
MoveWise RL Engine — Configuration & Constants
================================================
All parameters from RL_MaaS_Formulation_v3.tex (March 2026):

Sections referenced:
  §2 — Data collection (QR tap-in/tap-out, Rejsekort-inspired)
  §3 — MaaS Super-App service portfolio (Insurance, Route, Payment, Carpool)
  §4 — Behavior change toolkit (4 layers: Nudges, Gamification, Economics, Education)
  §5 — Generalized Cost framework (context-dependent VOT, Prospect Theory)
  §6 — Behavioral Realism: HUR model (Habit-Utility-Regret)
  §7 — RL formulation (Enhanced state/action/reward, 11 constraints)
  §8 — Giuseppe's phased adoption journey (Phase 0–3)

Key equations:
  Eq. 1 — Generalized Cost (multi-component decomposition)
  Eq. 2 — Habit decay: H_t = H₀ · e^{−α·t}
  Eq. 3 — Enhanced state S_t^app
  Eq. 4 — 5-component reward function
  Eq. 5 — Nudge selection: Nudge*(i,t) = argmax Q̂_nudge(s, nudge; θ)
  Eq. 6 — Data quality constraint C11

NEXUS 2026 — Politecnico di Torino
"""

from dataclasses import dataclass, field
from typing import Dict, List, Tuple
import numpy as np

# ═══════════════════════════════════════════════════════════════════
#  TRANSPORT MODES — Turin Metropolitan Area
# ═══════════════════════════════════════════════════════════════════

MODES = [
    "car_passenger",    # Family drives Giuseppe (status quo)
    "car_driver",       # Giuseppe drives himself
    "pr_train",         # Park & Ride → Train (Phase 1)
    "escooter_train",   # E-Scooter → Train → Walk (Phase 2)
    "bus_train",        # Bus → Train → Walk
    "carpool",          # Carpool with fellow students (Phase 3)
    "walk_train_bike",  # Walk → Train → Bike (eco max)
]

NUM_MODES = len(MODES)

# ═══════════════════════════════════════════════════════════════════
#  MODE CHARACTERISTICS — Caselle Torinese → Orbassano corridor
# ═══════════════════════════════════════════════════════════════════

@dataclass
class ModeProfile:
    """Static properties of a transport mode on the corridor."""
    name: str
    travel_time_min: float          # Total door-to-door minutes
    monetary_cost_eur: float        # Per-trip cost (EUR)
    co2_kg_per_trip: float          # kg CO₂ per trip
    comfort_score: float            # 0–1 (1 = most comfortable)
    reliability: float              # 0–1 (1 = perfectly reliable)
    productivity_score: float       # 0–1 (1 = can fully study/work)
    num_transfers: int              # Number of mode changes
    walking_min: float              # Minutes of walking involved
    requires_phase: int             # Minimum adoption phase required
    monthly_cost_eur: float         # Approx monthly cost (3x/week commute)
    accident_risk: float            # Relative risk (1.0 = car baseline)

# Data from RL_MaaS_Formulation_v3.tex + EEA 2024 emission factors
MODE_PROFILES: Dict[str, ModeProfile] = {
    "car_passenger": ModeProfile(
        name="Car (Passenger)", travel_time_min=45, monetary_cost_eur=5.0,
        co2_kg_per_trip=4.2, comfort_score=0.90, reliability=0.75,
        productivity_score=0.85, num_transfers=0, walking_min=2,
        requires_phase=0, monthly_cost_eur=60, accident_risk=1.0,
    ),
    "car_driver": ModeProfile(
        name="Car (Driver)", travel_time_min=45, monetary_cost_eur=5.0,
        co2_kg_per_trip=4.2, comfort_score=0.85, reliability=0.80,
        productivity_score=0.0, num_transfers=0, walking_min=2,
        requires_phase=0, monthly_cost_eur=60, accident_risk=1.0,
    ),
    "pr_train": ModeProfile(
        name="P&R + Train", travel_time_min=40, monetary_cost_eur=3.75,
        co2_kg_per_trip=2.1, comfort_score=0.75, reliability=0.82,
        productivity_score=0.70, num_transfers=1, walking_min=5,
        requires_phase=0, monthly_cost_eur=45, accident_risk=0.55,
        # Phase 0: already shown since user installed app for insurance
    ),
    "escooter_train": ModeProfile(
        name="E-Scooter + Train + Walk", travel_time_min=30, monetary_cost_eur=4.20,
        co2_kg_per_trip=0.84, comfort_score=0.72, reliability=0.89,
        productivity_score=0.60, num_transfers=2, walking_min=5,
        requires_phase=1, monthly_cost_eur=55, accident_risk=0.50,
    ),
    "bus_train": ModeProfile(
        name="Bus + Train + Walk", travel_time_min=38, monetary_cost_eur=2.80,
        co2_kg_per_trip=1.60, comfort_score=0.60, reliability=0.74,
        productivity_score=0.55, num_transfers=2, walking_min=8,
        requires_phase=0, monthly_cost_eur=35, accident_risk=0.45,
        # Phase 0: basic transit always visible
    ),
    "carpool": ModeProfile(
        name="Carpool + Walk", travel_time_min=29, monetary_cost_eur=2.70,
        co2_kg_per_trip=2.10, comfort_score=0.78, reliability=0.85,
        productivity_score=0.75, num_transfers=1, walking_min=4,
        requires_phase=2, monthly_cost_eur=50, accident_risk=0.60,
    ),
    "walk_train_bike": ModeProfile(
        name="Walk + Train + Bike", travel_time_min=40, monetary_cost_eur=2.50,
        co2_kg_per_trip=0.21, comfort_score=0.55, reliability=0.92,
        productivity_score=0.45, num_transfers=2, walking_min=10,
        requires_phase=1, monthly_cost_eur=30, accident_risk=0.40,
    ),
}

# ═══════════════════════════════════════════════════════════════════
#  GIUSEPPE'S PROFILE — from v3 formulation
# ═══════════════════════════════════════════════════════════════════

@dataclass
class UserProfile:
    """
    Behavioral profile of a user (Giuseppe is the default).
    
    Source: v3 §1.1 — Giuseppe's Complete Profile, plus Q&A clarifications.
    VOT values from Wardman (2004) and v3 §5 (context-dependent VOT).
    HUR weights from v3 §6 (Habit-Utility-Regret model).
    Segment from v3 §6 cultural segmentation.
    """
    name: str = "Giuseppe"
    age: int = 23
    # --- Value of Time (EUR/h) — context-dependent (v3 §5) ---
    vot_passenger: float = 3.7      # As car passenger (can study)
    vot_driver: float = 10.0        # As car driver (cannot study)
    vot_train_seated: float = 4.4   # Train with seat (table + Wi-Fi)
    vot_bus_seated: float = 6.5     # Bus with seat (less stable)
    vot_carpool_passenger: float = 5.1  # Carpooling as passenger
    # --- Behavioral parameters (v3 §6 — HUR model) ---
    habit_strength: float = 0.7     # H₀ (initial habit strength)
    eco_sensitivity: float = 0.6    # γ_eco — weight on CO₂ impact
    loss_aversion: float = 2.25     # μ — Prospect Theory (Kahneman & Tversky, 1979)
    car_status: float = 0.15        # Low car identity ("sees car as polluting")
    # --- HUR model weights (v3 §6) ---
    w_utility: float = 0.5          # Weight on utility maximization
    w_regret: float = 0.3           # Weight on regret minimization (Chorus, 2008)
    w_habit: float = 0.2            # Weight on habit persistence
    # --- Budget constraints (v3 §1.1) ---
    wtp_extra: float = 15.0         # Willing to pay EUR 15/mo extra for 30% pollution cut
    current_monthly: float = 60.0   # Current perceived monthly cost (EUR)
    monthly_budget: float = 75.0    # Max budget = current + WTP (EUR 60 + 15)
    co2_target_monthly: float = 50.0  # Target monthly CO₂ (kg) — 30% reduction from ~70 kg
    # --- Segment (v3 §6 — cultural segmentation) ---
    segment: str = "Hedonic Techy Ecologist"
    # --- Trip pattern (v3 §1.1 — all of Giuseppe's weekly trips) ---
    commute_days: int = 3           # Mon/Wed/Fri to Orbassano
    commute_per_week: int = 3       # Caselle → Orbassano (passenger)
    errands_per_week: int = 3       # Shopping/errands (he drives alone)
    leisure_per_week: int = 2       # Social/recreation (he drives alone)
    trip_distance_km: float = 11.0  # Approx one-way corridor distance

GIUSEPPE = UserProfile()

# ═══════════════════════════════════════════════════════════════════
#  GENERALIZED COST WEIGHTS — Reward function (v3 Eq. 4)
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RewardWeights:
    """
    Weights for the 5-component reward function (v3 Eq. 4):
    
    r_t = −[w₁·GC + w₂·E + w₃·Ψ_behavior + w₄·Φ_constraints] + w₅·R_revenue
    
    w₅ (revenue) is new in v3: aligns agent incentives with platform sustainability.
    """
    w_gc: float = 0.35          # w₁: Generalized Cost (lower is better)
    w_emission: float = 0.20    # w₂: Environmental impact (CO₂ savings)
    w_behavior: float = 0.20    # w₃: Behavioral penalty (habit resistance, regret)
    w_constraint: float = 0.10  # w₄: Constraint violations (phase, budget, weather)
    w_revenue: float = 0.15     # w₅: Platform revenue (e-commerce commission)

DEFAULT_WEIGHTS = RewardWeights()

# ═══════════════════════════════════════════════════════════════════
#  NUDGE CATALOG — from v3 §4.2 (Table 3: Nudge strategies)
#  Based on Thaler & Sunstein (2008) Nudge Theory + gamification
# ═══════════════════════════════════════════════════════════════════

NUDGE_TYPES = [
    "default_green",    # Show green option first (Default Effect)
    "social_proof",     # "87% of students take the train" (Conformity)
    "loss_frame",       # "You're LOSING €2,100/yr" (Prospect Theory)
    "carbon_budget",    # Show monthly carbon usage (Salience)
    "streak_reminder",  # "5-day green streak! Don't break it!" (Commitment)
    "commitment",       # "Try PT for 1 week — free ride back" (Foot-in-door)
    "anchoring",        # "Car: €510/mo vs PT: €55/mo" (Anchoring bias)
]

NUM_NUDGES = len(NUDGE_TYPES)

# Effectiveness matrix: nudge_type × user_segment → base effectiveness
# Values calibrated from behavioral economics literature
NUDGE_EFFECTIVENESS = {
    "Hedonic Techy Ecologist": {
        "default_green": 0.6, "social_proof": 0.7, "loss_frame": 0.5,
        "carbon_budget": 0.8, "streak_reminder": 0.7, "commitment": 0.4,
        "anchoring": 0.6,
    },
    "Neo-Luddite": {
        "default_green": 0.3, "social_proof": 0.4, "loss_frame": 0.7,
        "carbon_budget": 0.3, "streak_reminder": 0.2, "commitment": 0.6,
        "anchoring": 0.8,
    },
    "Opportunist Neoclassical": {
        "default_green": 0.2, "social_proof": 0.3, "loss_frame": 0.8,
        "carbon_budget": 0.2, "streak_reminder": 0.3, "commitment": 0.5,
        "anchoring": 0.9,
    },
}

# ═══════════════════════════════════════════════════════════════════
#  EMISSION FACTORS — EEA (European Environment Agency) 2024
#  Used in v3 §9 (Environmental Impact) and GC environmental cost
# ═══════════════════════════════════════════════════════════════════

EMISSION_FACTORS = {
    "car": 140,         # g CO₂/km (single-occupancy)
    "bus": 68,          # g CO₂/km (per passenger, avg load)
    "train": 14,        # g CO₂/km (per passenger, electric)
    "escooter": 22,     # g CO₂/km (lifecycle including manufacture)
    "bike": 0,          # g CO₂/km
    "walk": 0,          # g CO₂/km
}

# ═══════════════════════════════════════════════════════════════════
#  REVENUE MODEL — "Skyscanner for Mobility" (v3 §3.5)
#  MoveWise acts as an e-commerce aggregator: users search/book
#  transport through MoveWise; providers pay commission per booking.
#  Breakeven at ~3,000–4,000 active users (v3 revenue estimate).
# ═══════════════════════════════════════════════════════════════════

COMMISSION_RATE = 0.10          # 10% average commission on bookings (5–15% range)
SUBSCRIPTION_MONTHLY = 29.0     # EUR/mo all-inclusive plan
INSURANCE_COMMISSION = 0.05     # 5% insurance commission (IVASS-compliant)
AVG_MONTHLY_BOOKING_VALUE = 50  # EUR average monthly bookings per user

# ═══════════════════════════════════════════════════════════════════
#  RL HYPERPARAMETERS
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RLConfig:
    """
    Hyperparameters for the DQN agent (v3 §7).
    
    Architecture: Double DQN (Mnih et al., 2015) with:
      - Compound action space: 7 modes × 7 nudges = 49 actions
      - Separate nudge Q-network (v3 Eq. 5)
      - Experience replay + target network for stability
    """
    # --- Network ---
    state_dim: int = 18         # Dimension of state vector
    hidden_dim: int = 128       # Hidden layer size
    num_layers: int = 2         # Number of hidden layers
    # --- Training ---
    learning_rate: float = 1e-3
    gamma: float = 0.95         # Discount factor
    epsilon_start: float = 1.0  # Initial exploration rate
    epsilon_end: float = 0.05   # Final exploration rate
    epsilon_decay: float = 0.995
    # --- Replay buffer ---
    buffer_size: int = 10000
    batch_size: int = 64
    # --- Target network ---
    target_update_freq: int = 20  # Episodes between target network updates
    # --- Training schedule ---
    num_episodes: int = 500
    max_steps_per_episode: int = 56  # ~8 trips/week × 7 weeks
    # --- Habit decay ---
    habit_decay_rate: float = 0.05   # α in H_t = H₀ · e^{-αt}

RL_CONFIG = RLConfig()
