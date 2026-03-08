"""
MoveWise RL Engine — Generalized Cost Framework
=================================================
Implements the full decomposed Generalized Cost from v3 §5 (Eq. 1):

  GC(mode) = C_time + C_monetary + P_transfer + P_reliability
             + P_comfort + P_walking + C_environment
             + P_weather + P_peak

With adjustments:
  - Context-dependent VOT (v3 §5): productivity-adjusted for each mode
    Car passenger: 3.7 EUR/h | Car driver: 10.0 EUR/h | Train: 4.4 EUR/h
  - Prospect Theory (Kahneman & Tversky, 1979): μ = 2.25 loss aversion
    Losses (switching cost vs car) feel 2.25× worse than equivalent gains
  - Transfer penalty: 3.5 EUR/transfer (Wardman, 2004)
  - Environmental cost: γ_eco × CO₂ × social cost of carbon

Transport engineering context (Prof. Pronello — ITS/MaaS course):
  - Generalised Cost (GC) is the cornerstone of transport supply models.
    It expresses the total disutility of a trip in monetary units and
    serves as the link cost function in network assignment models.
  - In classical demand modelling, GC feeds into the systematic utility
    V_j of Random Utility Theory (RUT): P(j) = exp(V_j) / Σ exp(V_k),
    giving the Multinomial Logit (MNL) probability.  Here the RL agent
    uses GC directly as its reward signal instead of logit probabilities.
  - Context-dependent VOT reflects the concept of derived demand:
    travel is not consumed for its own sake, so productive travel time
    (studying on the train) has a lower VOT than unproductive time.
  - The transfer penalty is non-additive — transfers cannot be simply
    decomposed as the sum of link costs (cf. separable vs non-separable
    cost functions and the Jacobian matrix classification of networks).
  - Weather and peak adjustments are analogous to BPR-style congestion
    functions: travel cost increases when demand (peak) or adverse
    conditions (weather) exceed comfortable capacity.

References:
  Wardman, M. (2004). Public Transport Values of Time. Transport Policy.
  Kahneman, D. & Tversky, A. (1979). Prospect Theory. Econometrica.
  BPR (1964). Traffic Assignment Manual. US Bureau of Public Roads.
"""

import numpy as np
from .config import (
    ModeProfile, UserProfile, MODE_PROFILES, GIUSEPPE, MODES,
)


def get_vot(user: UserProfile, mode: str) -> float:
    """
    Context-dependent Value of Time (EUR/h).
    Key insight from v3: VOT depends on whether the user can be
    productive during travel (studying as a passenger).
    
    Car passenger:        3.7 EUR/h  (can study)
    Carpool passenger:    5.1 EUR/h  (can study, less comfortable)
    Train (seated):       4.4 EUR/h  (can study with table/Wi-Fi)
    Bus (seated):         6.5 EUR/h  (less stable, can read)
    Car driver:          10.0 EUR/h  (cannot study)
    Walking/scooter:     12.0 EUR/h  (active travel)
    """
    vot_map = {
        "car_passenger": user.vot_passenger,
        "car_driver": user.vot_driver,
        "pr_train": user.vot_train_seated,
        "escooter_train": user.vot_train_seated,  # Train segment dominates
        "bus_train": user.vot_bus_seated,
        "carpool": user.vot_carpool_passenger,
        "walk_train_bike": user.vot_train_seated,
    }
    return vot_map.get(mode, 10.0)


def compute_time_cost(mode: str, profile: ModeProfile, user: UserProfile) -> float:
    """
    Time cost = VOT × travel_time (hours) × (1 - productivity_score).
    Productivity-adjusted: if the user can study during travel,
    the effective time cost is reduced.
    """
    vot = get_vot(user, mode)
    hours = profile.travel_time_min / 60.0
    # Productivity adjustment: productive time "costs" less
    effective_hours = hours * (1.0 - 0.6 * profile.productivity_score)
    return vot * effective_hours


def compute_monetary_cost(profile: ModeProfile) -> float:
    """Direct monetary cost per trip (EUR)."""
    return profile.monetary_cost_eur


def compute_transfer_penalty(profile: ModeProfile) -> float:
    """
    Non-additive transfer penalty.
    Each transfer adds discomfort + risk of missing connection.
    Penalty: 3.5 EUR equivalent per transfer (Wardman, 2004).
    """
    return profile.num_transfers * 3.5


def compute_reliability_penalty(profile: ModeProfile) -> float:
    """
    Reliability penalty: cost of uncertainty.
    Lower reliability → higher perceived cost.
    Penalty = (1 - reliability) × 5.0 EUR equivalent.
    """
    return (1.0 - profile.reliability) * 5.0


def compute_comfort_penalty(profile: ModeProfile) -> float:
    """
    Comfort penalty: discomfort of mode relative to car.
    Penalty = (1 - comfort_score) × 4.0 EUR equivalent.
    """
    return (1.0 - profile.comfort_score) * 4.0


def compute_walking_penalty(profile: ModeProfile) -> float:
    """
    Walking/access time penalty.
    Walking is perceived as 2× as burdensome as in-vehicle time.
    Penalty = walking_min × 0.2 EUR/min.
    """
    return profile.walking_min * 0.20


def compute_environmental_cost(profile: ModeProfile, user: UserProfile) -> float:
    """
    Perceived environmental cost (internalized by eco-sensitive users).
    Cost = γ_eco × co2_per_trip × social_cost_of_carbon.
    Social cost of carbon ≈ 0.05 EUR/kg (conservative).
    """
    social_cost = 0.05  # EUR per kg CO₂
    return user.eco_sensitivity * profile.co2_kg_per_trip * social_cost


def prospect_theory_adjustment(gc_mode: float, gc_reference: float,
                                loss_aversion: float = 2.25) -> float:
    """
    Prospect Theory (Kahneman & Tversky, 1979) adjustment.
    
    When switching FROM the reference mode (car), any INCREASE in cost
    is weighted μ times more heavily than equivalent decreases.
    
    V(Δ) = Δ         if Δ ≤ 0  (gain — mode is cheaper/better)
    V(Δ) = μ × Δ     if Δ > 0  (loss — mode is worse)
    
    This captures why car users resist switching: the perceived
    losses (comfort, flexibility) feel 2.25× worse than the gains
    (money, environment).
    """
    delta = gc_mode - gc_reference
    if delta > 0:
        return gc_reference + loss_aversion * delta
    return gc_mode


def compute_generalized_cost(
    mode: str,
    user: UserProfile = GIUSEPPE,
    weather: str = "clear",
    time_of_day: str = "morning_peak",
    apply_prospect_theory: bool = True,
) -> dict:
    """
    Compute the FULL generalized cost for a mode.
    
    GC = time_cost + monetary_cost + transfer_penalty + reliability_penalty
         + comfort_penalty + walking_penalty + environmental_cost
         + weather_penalty + peak_penalty
    
    Then optionally apply Prospect Theory relative to car_passenger (status quo).
    
    Returns a dict with all component costs and total GC.
    """
    profile = MODE_PROFILES[mode]
    
    # --- Component costs ---
    time_cost = compute_time_cost(mode, profile, user)
    monetary = compute_monetary_cost(profile)
    transfer = compute_transfer_penalty(profile)
    reliability = compute_reliability_penalty(profile)
    comfort = compute_comfort_penalty(profile)
    walking = compute_walking_penalty(profile)
    environmental = compute_environmental_cost(profile, user)
    
    # --- Context adjustments ---
    weather_penalty = 0.0
    if weather in ("rain", "snow") and mode in ("escooter_train", "walk_train_bike"):
        weather_penalty = 3.0  # E-scooter/bike bad in rain
    elif weather == "rain" and mode == "bus_train":
        weather_penalty = 1.0  # Waiting at bus stop in rain
    
    peak_penalty = 0.0
    if time_of_day == "morning_peak" and mode in ("bus_train", "escooter_train"):
        peak_penalty = 1.5  # Crowding during peak
    
    # --- Raw GC ---
    gc_raw = (time_cost + monetary + transfer + reliability +
              comfort + walking + environmental + weather_penalty + peak_penalty)
    
    # --- Prospect Theory adjustment ---
    gc_adjusted = gc_raw
    if apply_prospect_theory and mode != "car_passenger":
        gc_ref = compute_generalized_cost(
            "car_passenger", user, weather, time_of_day,
            apply_prospect_theory=False,
        )["gc_total"]
        gc_adjusted = prospect_theory_adjustment(gc_raw, gc_ref, user.loss_aversion)
    
    return {
        "mode": mode,
        "mode_name": profile.name,
        "gc_total": gc_adjusted,
        "gc_raw": gc_raw,
        "components": {
            "time_cost": round(time_cost, 2),
            "monetary_cost": round(monetary, 2),
            "transfer_penalty": round(transfer, 2),
            "reliability_penalty": round(reliability, 2),
            "comfort_penalty": round(comfort, 2),
            "walking_penalty": round(walking, 2),
            "environmental_cost": round(environmental, 2),
            "weather_penalty": round(weather_penalty, 2),
            "peak_penalty": round(peak_penalty, 2),
        },
        "travel_time_min": profile.travel_time_min,
        "cost_eur": profile.monetary_cost_eur,
        "co2_kg": profile.co2_kg_per_trip,
        "comfort": profile.comfort_score,
        "reliability": profile.reliability,
        "productivity": profile.productivity_score,
    }


def rank_modes(
    user: UserProfile = GIUSEPPE,
    available_modes: list = None,
    current_phase: int = 0,
    weather: str = "clear",
    time_of_day: str = "morning_peak",
) -> list:
    """
    Rank all available modes by Generalized Cost (lower = better).
    Filters by current adoption phase (Constraint C10).
    """
    if available_modes is None:
        available_modes = MODES
    
    results = []
    for mode in available_modes:
        profile = MODE_PROFILES[mode]
        # Constraint C10: respect phased adoption
        if profile.requires_phase > current_phase:
            continue
        gc = compute_generalized_cost(mode, user, weather, time_of_day)
        results.append(gc)
    
    # Sort by GC (lower is better)
    results.sort(key=lambda x: x["gc_total"])
    return results
