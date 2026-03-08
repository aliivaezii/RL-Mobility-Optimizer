"""
MoveWise RL Engine — Configuration & Constants
================================================
All parameters from RL_MaaS_Formulation_v3.tex:
  - Generalized Cost components
  - Behavioral parameters (HUR model)
  - Prospect Theory coefficients
  - Transport mode characteristics (Turin metro area)
  - Revenue model parameters
  - Nudge catalog
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
    """Behavioral profile of a user (Giuseppe is the default)."""
    name: str = "Giuseppe"
    age: int = 23
    # --- Value of Time (EUR/h) — context-dependent ---
    vot_passenger: float = 3.7      # As passenger (can study)
    vot_driver: float = 10.0        # As driver (can't study)
    vot_train_seated: float = 4.4   # Train with seat
    vot_bus_seated: float = 6.5     # Bus with seat
    vot_carpool_passenger: float = 5.1  # Carpooling as passenger
    # --- Behavioral parameters ---
    habit_strength: float = 0.7     # H₀ (initial habit strength)
    eco_sensitivity: float = 0.6    # γ_eco — weight on CO₂
    loss_aversion: float = 2.25     # μ — Prospect Theory parameter
    car_status: float = 0.15        # Low car identity
    # --- HUR model weights ---
    w_utility: float = 0.5          # Weight on utility maximization
    w_regret: float = 0.3           # Weight on regret minimization
    w_habit: float = 0.2            # Weight on habit persistence
    # --- Budget constraints ---
    wtp_extra: float = 15.0         # Willing to pay EUR 15/mo extra
    current_monthly: float = 60.0   # Current perceived monthly cost
    # --- Segment ---
    segment: str = "Hedonic Techy Ecologist"
    # --- Commute pattern ---
    commute_per_week: int = 3
    errands_per_week: int = 3
    leisure_per_week: int = 2

GIUSEPPE = UserProfile()

# ═══════════════════════════════════════════════════════════════════
#  GENERALIZED COST WEIGHTS — Reward function (v3 Eq. 4)
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RewardWeights:
    """Weights for the 5-component reward function."""
    w_gc: float = 0.35          # w₁: Generalized cost
    w_emission: float = 0.20    # w₂: Environmental impact
    w_behavior: float = 0.20    # w₃: Behavioral penalty (habit, regret)
    w_constraint: float = 0.10  # w₄: Constraint violations
    w_revenue: float = 0.15     # w₅: Platform revenue (new in v3)

DEFAULT_WEIGHTS = RewardWeights()

# ═══════════════════════════════════════════════════════════════════
#  NUDGE CATALOG — from v3 Section 4
# ═══════════════════════════════════════════════════════════════════

NUDGE_TYPES = [
    "default_green",    # Show green option first
    "social_proof",     # "87% of students take the train"
    "loss_frame",       # "You're LOSING €2,100/yr"
    "carbon_budget",    # Show monthly carbon usage
    "streak_reminder",  # "5-day green streak! Don't break it!"
    "commitment",       # "Try PT for 1 week — free ride back"
    "anchoring",        # "Car: €510/mo vs PT: €55/mo"
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
#  EMISSION FACTORS — EEA 2024
# ═══════════════════════════════════════════════════════════════════

EMISSION_FACTORS = {
    "car": 140,         # g CO₂/km
    "bus": 68,          # g CO₂/km
    "train": 14,        # g CO₂/km
    "escooter": 22,     # g CO₂/km
    "bike": 0,          # g CO₂/km
    "walk": 0,          # g CO₂/km
}

# ═══════════════════════════════════════════════════════════════════
#  REVENUE MODEL — "Skyscanner for Mobility"
# ═══════════════════════════════════════════════════════════════════

COMMISSION_RATE = 0.10          # 10% average commission on bookings
SUBSCRIPTION_MONTHLY = 29.0     # EUR/mo all-inclusive plan
INSURANCE_COMMISSION = 0.05     # 5% insurance commission
AVG_MONTHLY_BOOKING_VALUE = 50  # EUR average monthly bookings/user

# ═══════════════════════════════════════════════════════════════════
#  RL HYPERPARAMETERS
# ═══════════════════════════════════════════════════════════════════

@dataclass
class RLConfig:
    """Hyperparameters for the DQN agent."""
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
