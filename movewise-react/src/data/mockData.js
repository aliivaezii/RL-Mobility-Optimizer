/* ================================================================
   MoveWise — Comprehensive Mock Data
   All API endpoints are marked with 🔌 API NEEDED comments.
   Replace these with real API calls in production.
   ================================================================ */

// ----- Navigation -----
export const navItems = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "trips", label: "Trips", icon: "🗺️" },
  { key: "pay", label: "Pay", icon: "💳" },
  { key: "rankings", label: "Rank", icon: "🏆" },
  { key: "profile", label: "Profile", icon: "👤" },
];

// ----- Route Options (RL-ranked by Generalized Cost) -----
// 🔌 API NEEDED: GET /api/routes?from={origin}&to={dest}&depart={time}&profile={userId}
//   Returns: Array of route options ranked by the RL engine
//   Providers: Google Routes API / HERE Transit / OpenTripPlanner + GTFS
//   RL Engine: Deep Q-Network selects best route based on HUR behavioral model
export const routeOptions = [
  {
    id: 1,
    title: "\u{1F33F} E-Scooter + Train + Walk",
    label: "RL Recommended",
    subtitle: "Personalized by AI based on your behavioral profile",
    segments: [
      { mode: "\u{1F6F4}", name: "E-Scooter", duration: "7 min", provider: "Voi" },
      { mode: "\u{1F682}", name: "Train SFM1", duration: "18 min", provider: "GTT" },
      { mode: "\u{1F6B6}", name: "Walk", duration: "5 min", provider: "" },
    ],
    totalTime: "30 min",
    cost: "\u20AC4.20",
    co2: "-80%",
    co2Saved: "1.5 kg",
    reliability: "89%",
    comfort: "High",
    greenPoints: 50,
    gcScore: 12.4,
    tags: ["Seated train", "Can study", "Wi-Fi"],
  },
  {
    id: 2,
    title: "\u{1F4B0} Bus + Train + Walk",
    label: "Budget",
    subtitle: "Lowest monetary cost",
    segments: [
      { mode: "\u{1F68C}", name: "Bus 32", duration: "12 min", provider: "GTT" },
      { mode: "\u{1F682}", name: "Train SFM1", duration: "18 min", provider: "Trenitalia" },
      { mode: "\u{1F6B6}", name: "Walk", duration: "8 min", provider: "" },
    ],
    totalTime: "38 min",
    cost: "\u20AC2.80",
    co2: "-62%",
    co2Saved: "1.1 kg",
    reliability: "74%",
    comfort: "Medium",
    greenPoints: 35,
    gcScore: 15.7,
    tags: ["Budget friendly"],
  },
  {
    id: 3,
    title: "\u26A1 E-Scooter + Express + E-Scooter",
    label: "Speed",
    subtitle: "Minimum travel time",
    segments: [
      { mode: "\u{1F6F4}", name: "E-Scooter", duration: "5 min", provider: "Lime" },
      { mode: "\u{1F684}", name: "Express Train", duration: "14 min", provider: "Trenitalia" },
      { mode: "\u{1F6F4}", name: "E-Scooter", duration: "3 min", provider: "Voi" },
    ],
    totalTime: "22 min",
    cost: "\u20AC6.30",
    co2: "-48%",
    co2Saved: "0.8 kg",
    reliability: "81%",
    comfort: "Medium",
    greenPoints: 30,
    gcScore: 14.2,
    tags: ["Time saver"],
  },
  {
    id: 4,
    title: "\u{1F30D} Walk + Train + Bike",
    label: "Eco",
    subtitle: "Maximum CO\u2082 reduction \u2014 zero emissions",
    segments: [
      { mode: "\u{1F6B6}", name: "Walk", duration: "10 min", provider: "" },
      { mode: "\u{1F682}", name: "Train SFM1", duration: "18 min", provider: "GTT" },
      { mode: "\u{1F6B2}", name: "Bike Share", duration: "12 min", provider: "ToBike" },
    ],
    totalTime: "40 min",
    cost: "\u20AC2.50",
    co2: "-95%",
    co2Saved: "2.1 kg",
    reliability: "92%",
    comfort: "Medium",
    greenPoints: 75,
    gcScore: 10.1,
    tags: ["Zero emission", "Exercise", "Scenic route"],
  },
  {
    id: 5,
    title: "\u{1F697} Carpool + Walk",
    label: "Social",
    subtitle: "Share the ride with fellow students",
    segments: [
      { mode: "\u{1F697}", name: "Carpool", duration: "25 min", provider: "MoveWise Pool" },
      { mode: "\u{1F6B6}", name: "Walk", duration: "4 min", provider: "" },
    ],
    totalTime: "29 min",
    cost: "\u20AC2.70",
    co2: "-50%",
    co2Saved: "1.2 kg",
    reliability: "85%",
    comfort: "High",
    greenPoints: 40,
    gcScore: 13.0,
    tags: ["Social", "Door-to-door", "Shared cost"],
  },
];

// ----- Leaderboard -----
// 🔌 API NEEDED: GET /api/gamification/leaderboard?scope=corridor
//   Returns: Ranked users with points and CO₂ savings
//   Provider: Gamification microservice
export const leaderboard = [
  { rank: 1, name: "Marco R.", score: 2450, avatar: "🥇", co2: "89 kg" },
  { rank: 2, name: "Sofia L.", score: 2180, avatar: "🥈", co2: "78 kg" },
  { rank: 3, name: "Luca B.", score: 1920, avatar: "🥉", co2: "71 kg" },
  { rank: 4, name: "You (Giuseppe)", score: 720, avatar: "🌿", co2: "42 kg", isUser: true },
  { rank: 5, name: "Anna M.", score: 650, avatar: "🌱", co2: "38 kg" },
];

// ----- Challenges -----
// 🔌 API NEEDED: GET /api/gamification/challenges?userId=...
//   Returns: Active challenges with progress
//   Provider: Gamification microservice
export const challenges = [
  { id: 1, title: "Try 3 different modes", progress: 2, total: 3, reward: "100 pts", icon: "🎯" },
  { id: 2, title: "5-day PT streak", progress: 3, total: 5, reward: "75 pts + ☕", icon: "🔥" },
  { id: 3, title: "Weekend Warrior", progress: 0, total: 2, reward: "50 pts", icon: "🏅", desc: "Use green transport for 2 leisure trips" },
  { id: 4, title: "Carbon Cutter", progress: 28, total: 50, reward: "200 pts + 🎬", icon: "🌍", desc: "Save 50 kg CO₂ this month" },
];

// ----- Badges -----
export const badges = [
  { id: 1, name: "First Train Ride", icon: "🚂", earned: true },
  { id: 2, name: "10 kg CO₂ Saved", icon: "🌍", earned: true },
  { id: 3, name: "Multimodal Week", icon: "🔀", earned: false },
  { id: 4, name: "Carpool Pioneer", icon: "🤝", earned: false },
  { id: 5, name: "Eco Champion L3", icon: "🏆", earned: true },
  { id: 6, name: "Streak Master 7d", icon: "🔥", earned: false },
  { id: 7, name: "Budget Ninja", icon: "💰", earned: true },
  { id: 8, name: "Weather Warrior", icon: "🌧️", earned: false },
];

// ----- Insurance -----
// 🔌 API NEEDED: GET /api/insurance/policy?userId=...
//   Returns: Policy details, premiums, discount eligibility
//   Provider: Insurance partner API (UnipolSai, Generali) via IVASS-compliant intermediary
export const insuranceData = {
  currentPremium: 560,
  potentialPremium: 476,
  discountPercent: 15,
  ptDaysRequired: 3,
  provider: "UnipolSai",
  renewalDate: "2026-09-15",
  nudge: "Use PT 3+ days/week → 15% lower car insurance premium (less driving = less accident risk)",
};

// ----- True Cost Calculator -----
export const trueCostData = {
  perceived: { label: "What you think you pay", amount: 60, unit: "/month" },
  actual: {
    label: "True monthly cost of car",
    items: [
      { name: "Fuel", amount: 120 },
      { name: "Insurance", amount: 47 },
      { name: "Depreciation", amount: 180 },
      { name: "Maintenance", amount: 45 },
      { name: "Parking", amount: 40 },
      { name: "Fines & tolls", amount: 15 },
      { name: "Time value (VOT)", amount: 63 },
    ],
    total: 510,
  },
  ptAlternative: { label: "MoveWise PT bundle", amount: 55, unit: "/month" },
  savings: 455,
};

// ----- Carbon Budget -----
// 🔌 API NEEDED: GET /api/carbon/budget?userId=...
//   Returns: Monthly budget, usage, breakdown by mode
//   Provider: Carbon calculation using EEA 2024 emission factors
export const carbonData = {
  monthlyBudget: 100,
  used: 58,
  saved: 42,
  yearly: 310,
  breakdown: [
    { mode: "Car (alone)", trips: 5, co2: 42.5, color: "#ef4444" },
    { mode: "Train + E-Scooter", trips: 6, co2: 9.6, color: "#22c55e" },
    { mode: "Carpooling", trips: 2, co2: 5.9, color: "#8b5cf6" },
  ],
};

// ----- Journey Steps (QR Payment Tracking) -----
// 🔌 API NEEDED: GET /api/journey/active?userId=...
//   Returns: Active journey with tap-in/tap-out status per segment
//   Provider: QR payment gateway + GTT/Trenitalia real-time APIs
export const journeySteps = [
  { id: 1, mode: "🛴", name: "E-Scooter", detail: "Caselle → Stazione", time: "07:45", status: "done", provider: "Voi", cost: "€1.20" },
  { id: 2, mode: "🚂", name: "Train SFM1", detail: "Torino Stura → Orbassano", time: "07:55", status: "active", provider: "GTT", cost: "€2.50" },
  { id: 3, mode: "🚂", name: "Train Tap-out", detail: "Orbassano Station", time: "08:18", status: "pending", provider: "GTT", cost: "—" },
  { id: 4, mode: "🚶", name: "Walk to Campus", detail: "5 min to San Luigi", time: "08:25", status: "pending", provider: "", cost: "Free" },
];

// ----- User Profile (Giuseppe) -----
// 🔌 API NEEDED: GET /api/user/profile
//   Returns: User profile with behavioral parameters
//   Provider: User management microservice + RL behavioral profiler
export const userProfile = {
  name: "Giuseppe",
  surname: "S.",
  age: 23,
  role: "Medical Student",
  university: "Università di Torino",
  campus: "San Luigi, Orbassano",
  home: "Caselle Torinese",
  segment: "Hedonic Techy Ecologist",
  greenScore: 720,
  level: 3,
  levelName: "Eco Champion",
  nextLevelPoints: 280,
  totalCO2Saved: 42,
  totalTrips: 13,
  streak: 5,
  monthlySpend: 55,
  priorities: {
    Time: "High",
    Cost: "Medium",
    Comfort: "High",
    "CO₂": "High",
  },
  preferences: [
    { id: "seated", label: "Prefer Seated", icon: "💺", description: "Prefer seated journeys so I can study/work", active: true },
    { id: "wifi", label: "Wi-Fi Needed", icon: "📶", description: "Need Wi-Fi or power outlets during travel", active: true },
    { id: "no_transfers", label: "Fewer Transfers", icon: "🔗", description: "Minimise transfers between modes", active: false },
    { id: "low_walk", label: "Less Walking", icon: "🦶", description: "Keep walking segments under 10 min", active: false },
    { id: "weather_safe", label: "Weather-Proof", icon: "☔", description: "Avoid open-air modes in bad weather", active: true },
    { id: "avoid_crowd", label: "Avoid Crowding", icon: "👥", description: "Prefer less crowded options", active: false },
    { id: "safety_first", label: "Safety First", icon: "🛡️", description: "Prefer dedicated lanes and well-lit routes", active: true },
    { id: "scenic", label: "Scenic Route", icon: "🌳", description: "Prefer greener, quieter paths when possible", active: false },
    { id: "eco_priority", label: "Eco Priority", icon: "🌱", description: "Always show the greenest option first", active: true },
    { id: "cargo", label: "Carry Items", icon: "🛍️", description: "I often carry bags or shopping", active: false },
    { id: "flexible_time", label: "Flexible Schedule", icon: "⏰", description: "I can leave ±15 min for a better route", active: false },
    { id: "open_carpool", label: "Open to Carpooling", icon: "🚗", description: "Include carpool matches in suggestions", active: false },
    { id: "ev_prefer", label: "Prefer Electric", icon: "⚡", description: "Prefer electric/zero-emission vehicles", active: false },
    { id: "accessibility", label: "Accessibility", icon: "♿", description: "Need step-free access and ramps", active: false },
  ],
  behavioralParams: {
    "Habit Strength": 0.7,
    "Eco Sensitivity": 0.6,
    "Loss Aversion": 2.25,
    "Car Status": 0.15,
  },
};

// ----- Nudges (RL-selected) -----
// 🔌 API NEEDED: GET /api/nudge/select?userId=...&context=...
//   Returns: Best nudge for this user in this context
//   Provider: Nudge RL agent — Q(s, nudge; θ_nudge)
export const nudges = [
  { id: 1, type: "social_proof", text: "87% of students on your route take the train. Try it this week!", icon: "👥" },
  { id: 2, type: "loss_frame", text: "You're losing €450/month on hidden car costs. See the breakdown →", icon: "💸" },
  { id: 3, type: "commitment", text: "Try PT for 1 week. If you don't like it, get a free ride back!", icon: "🤝" },
  { id: 4, type: "streak", text: "5-day green streak! Don't break it — ride green tomorrow too!", icon: "🔥" },
  { id: 5, type: "anchor", text: "Car: €510/mo true cost vs PT: €55/mo. That's €5,460/yr saved.", icon: "⚡" },
];

// ----- Carpool Matches -----
// 🔌 API NEEDED: GET /api/carpool/matches?from=caselle&to=orbassano&time=07:30
//   Returns: Available matches with overlap %, detour, cost, safety rating
//   Provider: Carpool matching engine using OD data from QR tap-in/tap-out
export const carpoolMatches = [
  { id: 1, name: "Marco R.", route: "Caselle → Orbassano", overlap: 94, detour: "+6 min", costPerPerson: "€2.70", co2Savings: "-50%", rating: 4.8, seats: 2, time: "07:30" },
  { id: 2, name: "Sofia L.", route: "Borgaro → Orbassano", overlap: 82, detour: "+12 min", costPerPerson: "€2.20", co2Savings: "-45%", rating: 4.6, seats: 3, time: "07:40" },
];

// ----- Carpool History -----
export const carpoolHistory = [
  { id: 1, date: "Mar 5, 2026", driver: "Marco R.", route: "Caselle → Orbassano", cost: "€2.70", co2Saved: "1.2 kg", rating: 5, status: "completed" },
  { id: 2, date: "Mar 3, 2026", driver: "Sofia L.", route: "Borgaro → Orbassano", cost: "€2.20", co2Saved: "1.0 kg", rating: 4, status: "completed" },
  { id: 3, date: "Feb 28, 2026", driver: "You (driver)", route: "Caselle → Orbassano", cost: "€1.80 earned", co2Saved: "1.5 kg", rating: 5, status: "completed" },
  { id: 4, date: "Feb 25, 2026", driver: "Luca B.", route: "Caselle → Torino", cost: "€3.10", co2Saved: "1.8 kg", rating: 4, status: "completed" },
  { id: 5, date: "Feb 22, 2026", driver: "Anna M.", route: "Venaria → Orbassano", cost: "€2.50", co2Saved: "1.1 kg", rating: 5, status: "completed" },
];

// ----- Wallet -----
// 🔌 API NEEDED: GET /api/wallet?userId=...
//   Returns: Balance, plan, transaction history
//   Provider: Payment gateway (Stripe / Satispay / Nexi)
export const walletData = {
  balance: 32.5,
  plan: "Pay-as-you-go",
  monthlySpent: 47.2,
  monthlyBudget: 75,
  transactions: [
    { date: "Mar 7", desc: "E-Scooter Voi", amount: -1.2, mode: "🛴" },
    { date: "Mar 7", desc: "Train SFM1", amount: -2.5, mode: "🚂" },
    { date: "Mar 6", desc: "Bus GTT 32", amount: -1.5, mode: "🚌" },
    { date: "Mar 5", desc: "Wallet top-up", amount: 20.0, mode: "💳" },
    { date: "Mar 4", desc: "E-Scooter Lime", amount: -1.8, mode: "🛴" },
  ],
};

// ----- Phased Adoption Journey -----
export const adoptionPhases = [
  { phase: 0, name: "Onboarding", desc: "Install via insurance/parking services", status: "done", co2: "—", cost: "—" },
  { phase: 1, name: "P&R → Train", desc: "Family car to P&R, then train", status: "done", co2: "-50%", cost: "€45/mo" },
  { phase: 2, name: "E-Scooter → Train → Walk", desc: "Full green commute", status: "active", co2: "-75%", cost: "€55/mo" },
  { phase: 3, name: "Carpooling + PT", desc: "Peer carpooling for non-commute trips", status: "upcoming", co2: "-80%", cost: "€50/mo" },
];
