import { useState } from "react";
import Card from "./ui/Card";
import NudgeBanner from "./ui/NudgeBanner";
import { userProfile, nudges, routeOptions } from "../data/mockData";

const services = [
  { key: "insurance", icon: "\u{1F6E1}\uFE0F", name: "Insurance", desc: "Smart coverage", accent: "#e3f2fd", border: "#90caf9" },
  { key: "trips", icon: "\u{1F5FA}\uFE0F", name: "Route Planner", desc: "AI green routes", accent: "#e8f5e9", border: "#a5d6a7" },
  { key: "pay", icon: "\u{1F4B3}", name: "QR Payment", desc: "Tap-in / Tap-out", accent: "#fff3e0", border: "#ffcc80" },
  { key: "carpool", icon: "\u{1F697}", name: "Carpooling", desc: "Match students", accent: "#f3e5f5", border: "#ce93d8" },
];

export default function HomeScreen({ onNavigate, onFeedback }) {
  const [nudgeIdx] = useState(0);
  const nudge = nudges[nudgeIdx];
  const trip = routeOptions[0];

  return (
    <>
      {/* Header */}
      <header className="header-gradient">
        <button className="icon-btn" onClick={() => onNavigate("profile")} aria-label="Menu">{"\u2630"}</button>
        <div className="brand">
          <span className="brand-leaf">{"\u{1F33F}"}</span>
          <span>MoveWise</span>
        </div>
        <button className="avatar-btn" onClick={() => onNavigate("userprofile")} aria-label="Profile">
          {userProfile.name[0]}{userProfile.surname[0]}
        </button>
      </header>

      {/* Greeting */}
      <section className="greeting-block">
        <h2>Buongiorno, {userProfile.name}! {"\u2600\uFE0F"}</h2>
        <p>Ready for a greener commute today?</p>
      </section>

      {/* Green Score */}
      <Card className="score-card floating">
        <div className="score-row">
          <span className="score-label">{"\u{1F331}"} Green Score</span>
          <span className="score-value">{userProfile.greenScore} pts</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(userProfile.greenScore / 1000) * 100}%` }} />
        </div>
        <p className="score-level">
          Level {userProfile.level} — {userProfile.levelName} • {userProfile.nextLevelPoints} pts to Level {userProfile.level + 1}
        </p>
      </Card>

      {/* Services Grid */}
      <section className="services-grid">
        {services.map((s, i) => (
          <button
            key={i}
            className="service-tile"
            style={{ background: s.accent, borderColor: s.border }}
            onClick={() => onNavigate(s.key)}
          >
            <span className="tile-icon">{s.icon}</span>
            <span className="tile-name">{s.name}</span>
            <span className="tile-desc">{s.desc}</span>
          </button>
        ))}
      </section>

      {/* Nudge Banner */}
      <NudgeBanner icon={nudge.icon} text={nudge.text} />

      {/* RL-Powered Trip Suggestion */}
      <Card className="trip-card rl-branded">
        <div className="rl-trip-header">
          <div className="rl-badge-wrap">
            <span className="rl-badge">{"\u{1F9E0}"} RL Agent</span>
            <span className="rl-subtitle">Deep Q-Network Recommendation</span>
          </div>
        </div>
        <h4 className="rl-trip-title">{"\u{1F4CD}"} Personalised Route to Orbassano</h4>
        <p className="rl-trip-context">Based on your behavioral profile: <em>Hedonic Techy Ecologist</em> {"\u2014"} optimised for comfort, Wi-Fi, and low CO{"\u2082"}</p>
        <div className="trip-segments">
          {trip.segments.map((seg, i) => (
            <span key={i} className="seg-group">
              {i > 0 && <span className="seg-arrow">{"\u2192"}</span>}
              <span className="seg-pill">{seg.mode} {seg.duration}</span>
            </span>
          ))}
        </div>
        <div className="trip-metrics">
          <div className="tm">
            <strong>{trip.totalTime}</strong>
            <span>Total time</span>
          </div>
          <div className="tm">
            <strong>{trip.cost}</strong>
            <span>Cost</span>
          </div>
          <div className="tm green-text">
            <strong>{trip.co2}</strong>
            <span>CO{"\u2082"} vs driving</span>
          </div>
        </div>
        <button
          className="btn-book"
          onClick={() => {
            onNavigate("pay");
            onFeedback("Trip booked! +50 Green Points \u{1F33F}");
          }}
        >
          Book Now {"\u{1F33F}"}
          <span className="pts-badge">+{trip.greenPoints} pts</span>
        </button>
      </Card>

      {/* Did You Know */}
      <Card className="dyk-card">
        <p>{"\u{1F4A1}"} <strong>Did you know?</strong> A 20-minute train ride saves 1.5 kg CO{"\u2082"} compared to driving alone. That's like planting 0.07 trees every trip!</p>
      </Card>

      {/* Phased Journey Preview */}
      <Card className="phase-card" title={"\u{1F680} Your Adoption Journey"}>
        <div className="phase-timeline">
          <div className="ph done"><span className="ph-dot">{"\u2714"}</span><div><strong>Phase 0</strong><span>Onboarded via insurance</span></div></div>
          <div className="ph done"><span className="ph-dot">{"\u2714"}</span><div><strong>Phase 1</strong><span>P&R {"\u2192"} Train (-50% CO{"\u2082"})</span></div></div>
          <div className="ph active"><span className="ph-dot">{"\u25C9"}</span><div><strong>Phase 2</strong><span>E-Scooter {"\u2192"} Train {"\u2192"} Walk</span></div></div>
          <div className="ph upcoming"><span className="ph-dot">{"\u25CB"}</span><div><strong>Phase 3</strong><span>Carpooling + PT (-80% CO{"\u2082"})</span></div></div>
        </div>
      </Card>
    </>
  );
}
