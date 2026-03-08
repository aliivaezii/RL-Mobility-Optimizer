"""
MoveWise RL Engine — MaaS Environment (MDP)
=============================================
Implements the Markov Decision Process from v3:
  - State: user profile + context + habit + phase + app interaction
  - Action: (route_index, nudge_index)
  - Reward: 5-component weighted reward
  - Transitions: habit decay, phase progression, learning

Simulates Giuseppe's 8 weekly trips (3 commute + 3 errands + 2 leisure)
over a configurable number of weeks.
"""

import numpy as np
from typing import Tuple, Optional
from .config import (
    MODES, NUM_MODES, NUM_NUDGES, NUDGE_TYPES, MODE_PROFILES,
    UserProfile, GIUSEPPE, RewardWeights, DEFAULT_WEIGHTS,
    NUDGE_EFFECTIVENESS, COMMISSION_RATE, RL_CONFIG,
)
from .generalized_cost import compute_generalized_cost, get_vot


class MaaSEnvironment:
    """
    MaaS Mobility Environment for RL training.
    
    State vector (dim=18):
        [0]  habit_strength         — H_t (decays over time)
        [1]  eco_sensitivity        — γ_eco
        [2]  loss_aversion          — μ (Prospect Theory)
        [3]  car_status             — car identity weight
        [4]  current_phase          — adoption phase (0-3)
        [5]  week_number            — current week (normalized)
        [6]  trip_type              — 0=commute, 1=errand, 2=leisure
        [7]  weather                — 0=clear, 1=rain, 2=snow
        [8]  time_of_day            — 0=morning, 1=afternoon, 2=evening
        [9]  day_of_week            — 0=weekday, 1=weekend
        [10] green_streak           — consecutive green trips (normalized)
        [11] total_co2_saved        — cumulative kg CO₂ saved (normalized)
        [12] green_points           — gamification points (normalized)
        [13] last_mode_was_car      — 1 if last trip was car, 0 otherwise
        [14] nudge_response_rate    — fraction of nudges accepted
        [15] budget_remaining       — monthly budget remaining (normalized)
        [16] satisfaction           — user satisfaction (0–1)
        [17] app_engagement         — app usage intensity (0–1)
    """
    
    def __init__(
        self,
        user: UserProfile = None,
        weights: RewardWeights = None,
        num_weeks: int = 7,
        seed: int = None,
    ):
        self.user = user or GIUSEPPE
        self.weights = weights or DEFAULT_WEIGHTS
        self.num_weeks = num_weeks
        self.rng = np.random.RandomState(seed)
        
        # Action space: mode × nudge
        self.num_mode_actions = NUM_MODES
        self.num_nudge_actions = NUM_NUDGES
        self.num_actions = NUM_MODES * NUM_NUDGES  # Compound action
        
        # State dimension
        self.state_dim = RL_CONFIG.state_dim  # 18
        
        self.reset()
    
    def reset(self) -> np.ndarray:
        """Reset environment to initial state (Phase 0, Week 0)."""
        self.week = 0
        self.trip_in_week = 0
        self.total_trips = 0
        self.done = False
        
        # Dynamic state variables
        self.habit = self.user.habit_strength  # H₀ = 0.7
        self.phase = 0
        self.green_streak = 0
        self.total_co2_saved = 0.0
        self.green_points = 0
        self.satisfaction = 0.5
        self.app_engagement = 0.3  # Low initially (just installed for insurance)
        self.budget_remaining = self.user.current_monthly
        self.last_mode_was_car = 1  # Starts with car
        self.nudge_accepts = 0
        self.nudge_total = 0
        self.car_trips = 0
        self.green_trips = 0
        
        # History tracking
        self.history = {
            "weeks": [], "trip_types": [], "modes_chosen": [],
            "nudges_used": [], "rewards": [], "co2_saved": [],
            "habits": [], "phases": [], "green_points": [],
            "satisfaction": [], "gc_scores": [],
        }
        
        return self._get_state()
    
    def _get_trip_type(self) -> int:
        """
        Determine trip type based on weekly schedule.
        Giuseppe: 3 commute + 3 errands + 2 leisure = 8 trips/week.
        """
        if self.trip_in_week < 3:
            return 0  # commute
        elif self.trip_in_week < 6:
            return 1  # errand
        else:
            return 2  # leisure
    
    def _get_weather(self) -> int:
        """Stochastic weather: 70% clear, 20% rain, 10% snow."""
        r = self.rng.random()
        if r < 0.70:
            return 0  # clear
        elif r < 0.90:
            return 1  # rain
        else:
            return 2  # snow
    
    def _get_time_of_day(self, trip_type: int) -> int:
        """Time of day depends on trip type."""
        if trip_type == 0:
            return 0  # morning peak (commute)
        elif trip_type == 1:
            return 1  # afternoon (errands)
        else:
            return 2  # evening (leisure)
    
    def _get_state(self) -> np.ndarray:
        """Construct state vector."""
        trip_type = self._get_trip_type()
        weather = self._get_weather()
        tod = self._get_time_of_day(trip_type)
        
        nudge_rate = (self.nudge_accepts / max(self.nudge_total, 1))
        
        state = np.array([
            self.habit,                                    # [0]
            self.user.eco_sensitivity,                     # [1]
            self.user.loss_aversion / 3.0,                 # [2] normalized
            self.user.car_status,                          # [3]
            self.phase / 3.0,                              # [4] normalized
            self.week / self.num_weeks,                    # [5] normalized
            trip_type / 2.0,                               # [6] normalized
            weather / 2.0,                                 # [7] normalized
            tod / 2.0,                                     # [8] normalized
            0.0 if self.week < 5 else 1.0,                 # [9] day type
            min(self.green_streak / 10.0, 1.0),            # [10] normalized
            min(self.total_co2_saved / 50.0, 1.0),         # [11] normalized
            min(self.green_points / 1000.0, 1.0),          # [12] normalized
            float(self.last_mode_was_car),                 # [13]
            nudge_rate,                                    # [14]
            max(self.budget_remaining / 75.0, 0.0),        # [15] normalized
            self.satisfaction,                              # [16]
            self.app_engagement,                            # [17]
        ], dtype=np.float32)
        
        return state
    
    def _decode_action(self, action: int) -> Tuple[int, int]:
        """Decode compound action into (mode_index, nudge_index)."""
        mode_idx = action // NUM_NUDGES
        nudge_idx = action % NUM_NUDGES
        return mode_idx, nudge_idx
    
    def _is_mode_available(self, mode_idx: int, trip_type: int) -> bool:
        """Check if mode is available given phase and trip type."""
        mode = MODES[mode_idx]
        profile = MODE_PROFILES[mode]
        
        # Phase constraint (C10)
        if profile.requires_phase > self.phase:
            return False
        
        # For errands (trip_type=1): car_driver, escooter_train, walk_train_bike
        # For leisure (trip_type=2): all available in current phase
        # For commute (trip_type=0): all available in current phase
        return True
    
    def _compute_reward(
        self, mode_idx: int, nudge_idx: int, trip_type: int,
        weather: int, tod: int,
    ) -> Tuple[float, dict]:
        """
        Compute the 5-component reward from v3 Eq. 4:
        
        r_t = -[w₁·GC + w₂·E + w₃·Ψ_behavior + w₄·Φ_constraints] + w₅·R_revenue
        """
        mode = MODES[mode_idx]
        nudge = NUDGE_TYPES[nudge_idx]
        profile = MODE_PROFILES[mode]
        
        weather_str = ["clear", "rain", "snow"][weather]
        tod_str = ["morning_peak", "afternoon", "evening"][tod]
        
        # --- Component 1: Generalized Cost ---
        gc = compute_generalized_cost(
            mode, self.user, weather_str, tod_str,
            apply_prospect_theory=True,
        )
        gc_normalized = gc["gc_total"] / 20.0  # Normalize to ~[0, 1]
        
        # --- Component 2: Environmental Impact ---
        co2_car = MODE_PROFILES["car_passenger"].co2_kg_per_trip
        co2_saved = co2_car - profile.co2_kg_per_trip
        emission_reward = co2_saved / co2_car  # Normalized reduction
        
        # --- Component 3: Behavioral Penalty ---
        # HUR Model: penalize recommending modes the user won't accept
        # Acceptance probability based on habit, regret, and utility
        
        # Habit penalty: recommending non-car when habit is strong
        is_car = 1.0 if mode in ("car_passenger", "car_driver") else 0.0
        habit_penalty = self.habit * (1.0 - is_car) * 0.5
        
        # Regret estimation: user might regret switching
        regret = 0.0
        if not is_car:
            gc_car = compute_generalized_cost(
                "car_passenger", self.user, weather_str, tod_str,
                apply_prospect_theory=False,
            )["gc_total"]
            gc_alt = gc["gc_raw"]
            if gc_alt > gc_car:
                regret = (gc_alt - gc_car) / gc_car * self.user.w_regret
        
        behavior_penalty = habit_penalty + regret
        
        # --- Component 4: Constraint Violations ---
        constraint_penalty = 0.0
        
        # C10: Phase constraint
        if profile.requires_phase > self.phase:
            constraint_penalty += 2.0
        
        # C11: Data quality — QR observable (car trips give no data)
        if mode in ("car_passenger", "car_driver"):
            constraint_penalty += 0.3  # Prefer modes that generate data
        
        # Budget constraint
        if profile.monthly_cost_eur > self.user.current_monthly + self.user.wtp_extra:
            constraint_penalty += 1.0
        
        # Weather constraint
        if weather >= 1 and mode in ("escooter_train", "walk_train_bike"):
            constraint_penalty += 0.5
        
        # --- Component 5: Platform Revenue ---
        revenue = 0.0
        if mode not in ("car_passenger", "car_driver"):
            revenue = profile.monetary_cost_eur * COMMISSION_RATE
        revenue_normalized = revenue / 1.0  # Normalize
        
        # --- Nudge effectiveness bonus ---
        segment_effects = NUDGE_EFFECTIVENESS.get(self.user.segment, {})
        nudge_bonus = segment_effects.get(nudge, 0.3) * 0.2
        
        # If the nudge matches the context, extra bonus
        if nudge == "streak_reminder" and self.green_streak >= 3:
            nudge_bonus += 0.15
        if nudge == "social_proof" and trip_type == 0:  # Commute
            nudge_bonus += 0.10
        if nudge == "loss_frame" and self.habit > 0.5:
            nudge_bonus += 0.10
        
        # --- Combined Reward ---
        w = self.weights
        reward = (
            -w.w_gc * gc_normalized
            + w.w_emission * emission_reward
            - w.w_behavior * behavior_penalty
            - w.w_constraint * constraint_penalty
            + w.w_revenue * revenue_normalized
            + nudge_bonus
        )
        
        # Green trip bonus: directly reward sustainable choices
        # This encodes the platform's objective of shifting behavior
        if mode not in ("car_passenger", "car_driver"):
            reward += 0.5  # Sustainable mode bonus
        else:
            reward -= 0.2  # Car penalty (platform wants to shift away)
        
        info = {
            "gc": gc["gc_total"],
            "gc_normalized": gc_normalized,
            "co2_saved": co2_saved,
            "emission_reward": emission_reward,
            "behavior_penalty": behavior_penalty,
            "constraint_penalty": constraint_penalty,
            "revenue": revenue,
            "nudge_bonus": nudge_bonus,
            "reward": reward,
        }
        
        return reward, info
    
    def _simulate_user_acceptance(
        self, mode_idx: int, nudge_idx: int, trip_type: int,
    ) -> bool:
        """
        Simulate whether the user accepts the recommendation.
        Based on HUR model: habit, utility, regret, nudge effectiveness.
        
        Giuseppe is a 23-year-old student who installed the app voluntarily
        for insurance benefits. He's car-dependent but open-minded (eco=0.6).
        The acceptance model must allow initial green trips so the agent
        can learn the habit-decay → phase-progression → more-modes loop.
        """
        mode = MODES[mode_idx]
        nudge = NUDGE_TYPES[nudge_idx]
        profile = MODE_PROFILES[mode]
        
        # Base acceptance = 1 - habit (if not car)
        is_car = mode in ("car_passenger", "car_driver")
        if is_car:
            # User always "accepts" car (it's the default)
            return True
        
        # --- Component 1: Cost advantage ---
        # How much cheaper is this mode than car?
        gc_alt = compute_generalized_cost(
            mode, self.user, apply_prospect_theory=False
        )["gc_total"]
        gc_car = compute_generalized_cost(
            "car_passenger", self.user, apply_prospect_theory=False
        )["gc_total"]
        # Positive if alt is cheaper, negative if more expensive
        cost_advantage = (gc_car - gc_alt) / max(gc_car, 1.0)
        # Map to [0, 0.3] — even if more expensive, curiosity gives some prob
        utility_factor = max(0.05, 0.15 + cost_advantage * 0.3)
        
        # --- Component 2: Habit resistance ---
        # Strong habit resists change, but decays over time
        openness = (1.0 - self.habit) * 0.25
        
        # --- Component 3: Eco-motivation ---
        # Giuseppe's eco_sensitivity (0.6) gives intrinsic motivation
        eco_bonus = self.user.eco_sensitivity * 0.15
        
        # --- Component 4: Nudge effectiveness ---
        segment_effects = NUDGE_EFFECTIVENESS.get(self.user.segment, {})
        nudge_factor = segment_effects.get(nudge, 0.3) * 0.20
        
        # --- Component 5: Phase & engagement bonuses ---
        phase_factor = self.phase * 0.05
        engagement_factor = self.app_engagement * 0.08
        
        # --- Component 6: Social/streak momentum ---
        streak_bonus = min(self.green_streak * 0.03, 0.15)
        
        acceptance_prob = (
            utility_factor + openness + eco_bonus
            + nudge_factor + phase_factor + engagement_factor
            + streak_bonus
        )
        acceptance_prob = np.clip(acceptance_prob, 0.08, 0.95)
        
        return self.rng.random() < acceptance_prob
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, dict]:
        """
        Execute one step in the environment.
        
        Args:
            action: compound action = mode_idx * NUM_NUDGES + nudge_idx
        
        Returns:
            next_state, reward, done, info
        """
        if self.done:
            return self._get_state(), 0.0, True, {}
        
        mode_idx, nudge_idx = self._decode_action(action)
        trip_type = self._get_trip_type()
        weather = self._get_weather()
        tod = self._get_time_of_day(trip_type)
        
        # Clip to valid range
        mode_idx = np.clip(mode_idx, 0, NUM_MODES - 1)
        nudge_idx = np.clip(nudge_idx, 0, NUM_NUDGES - 1)
        
        mode = MODES[mode_idx]
        nudge = NUDGE_TYPES[nudge_idx]
        profile = MODE_PROFILES[mode]
        
        # Check phase constraint — fallback to car if mode not available
        if profile.requires_phase > self.phase:
            mode_idx = 0  # Fallback to car_passenger
            mode = MODES[mode_idx]
            profile = MODE_PROFILES[mode]
        
        # Compute reward
        reward, info = self._compute_reward(mode_idx, nudge_idx, trip_type, weather, tod)
        
        # Simulate user acceptance
        accepted = self._simulate_user_acceptance(mode_idx, nudge_idx, trip_type)
        
        if not accepted:
            # User rejects recommendation → stays with car
            actual_mode_idx = 0 if trip_type == 0 else 1  # passenger for commute, driver otherwise
            actual_mode = MODES[actual_mode_idx]
            reward -= 0.3  # Penalty for rejected recommendation
            info["accepted"] = False
            info["actual_mode"] = actual_mode
        else:
            actual_mode_idx = mode_idx
            actual_mode = mode
            info["accepted"] = True
            info["actual_mode"] = actual_mode
        
        # --- Update dynamic state ---
        actual_profile = MODE_PROFILES[actual_mode]
        is_green = actual_mode not in ("car_passenger", "car_driver")
        
        # CO₂ savings
        co2_car = MODE_PROFILES["car_passenger"].co2_kg_per_trip
        co2_saved = co2_car - actual_profile.co2_kg_per_trip
        self.total_co2_saved += max(co2_saved, 0)
        
        # Green streak
        if is_green:
            self.green_streak += 1
            self.green_trips += 1
            self.green_points += 50 if actual_mode == "walk_train_bike" else 35
        else:
            self.green_streak = 0
            self.car_trips += 1
        
        # Nudge tracking
        self.nudge_total += 1
        if accepted and is_green:
            self.nudge_accepts += 1
        
        # Habit decay: H_t = H₀ · e^{-α·green_trips}
        if is_green:
            self.habit = self.user.habit_strength * np.exp(
                -RL_CONFIG.habit_decay_rate * self.green_trips
            )
        
        # App engagement grows with usage
        if is_green:
            self.app_engagement = min(1.0, self.app_engagement + 0.03)
        
        # Satisfaction
        if accepted:
            self.satisfaction = min(1.0, self.satisfaction + 0.02)
        else:
            self.satisfaction = max(0.0, self.satisfaction - 0.05)
        
        # Budget
        self.budget_remaining -= actual_profile.monetary_cost_eur
        
        # Phase progression (C10)
        self._check_phase_progression()
        
        # Track whether last mode was car
        self.last_mode_was_car = 0 if is_green else 1
        
        # --- Record history ---
        self.history["weeks"].append(self.week)
        self.history["trip_types"].append(trip_type)
        self.history["modes_chosen"].append(actual_mode)
        self.history["nudges_used"].append(nudge)
        self.history["rewards"].append(reward)
        self.history["co2_saved"].append(self.total_co2_saved)
        self.history["habits"].append(self.habit)
        self.history["phases"].append(self.phase)
        self.history["green_points"].append(self.green_points)
        self.history["satisfaction"].append(self.satisfaction)
        self.history["gc_scores"].append(info["gc"])
        
        # --- Advance time ---
        self.trip_in_week += 1
        self.total_trips += 1
        if self.trip_in_week >= 8:  # 8 trips per week
            self.trip_in_week = 0
            self.week += 1
            self.budget_remaining = self.user.current_monthly  # Reset monthly budget
        
        if self.week >= self.num_weeks:
            self.done = True
        
        next_state = self._get_state()
        info["week"] = self.week
        info["trip_in_week"] = self.trip_in_week
        info["total_trips"] = self.total_trips
        info["phase"] = self.phase
        info["habit"] = self.habit
        info["green_streak"] = self.green_streak
        info["total_co2_saved"] = self.total_co2_saved
        info["green_trip"] = is_green
        info["green_points_earned"] = (50 if actual_mode == "walk_train_bike" else 35) if is_green else 0
        
        return next_state, reward, self.done, info
    
    def _check_phase_progression(self):
        """
        Phase progression based on behavioral milestones.
        Phase 0 → 1: After first 2 green trips
        Phase 1 → 2: After habit drops below 0.5
        Phase 2 → 3: After 3+ weeks of consistent green travel
        """
        if self.phase == 0 and self.green_trips >= 2:
            self.phase = 1
        elif self.phase == 1 and self.habit < 0.50:
            self.phase = 2
        elif self.phase == 2 and self.green_trips >= 15 and self.week >= 3:
            self.phase = 3
    
    def get_summary(self) -> dict:
        """Get episode summary statistics."""
        modes = self.history["modes_chosen"]
        green_count = sum(1 for m in modes if m not in ("car_passenger", "car_driver"))
        total = len(modes)
        
        return {
            "total_trips": total,
            "green_trips": green_count,
            "car_trips": total - green_count,
            "green_ratio": green_count / max(total, 1),
            "total_co2_saved_kg": round(self.total_co2_saved, 1),
            "final_habit": round(self.habit, 3),
            "final_phase": self.phase,
            "green_points": self.green_points,
            "satisfaction": round(self.satisfaction, 3),
            "avg_reward": round(np.mean(self.history["rewards"]), 3) if self.history["rewards"] else 0,
        }
