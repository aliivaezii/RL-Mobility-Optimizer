import { useState } from "react";
import Card from "./ui/Card";
import { userProfile, insuranceData, trueCostData, carbonData } from "../data/mockData";

export default function ProfileScreen({ onNavigate, onFeedback }) {
  const [showCost, setShowCost] = useState(false);
  const [prefs, setPrefs] = useState(userProfile.preferences);
  const [priorities, setPriorities] = useState(userProfile.priorities);

  const cyclePriority = (key) => {
    const cycle = { Low: "Medium", Medium: "High", High: "Low" };
    setPriorities((prev) => {
      const next = { ...prev, [key]: cycle[prev[key]] };
      onFeedback(`${key} priority set to ${next[key]}`);
      return next;
    });
  };

  const togglePref = (id) => {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    const pref = prefs.find((p) => p.id === id);
    onFeedback(pref.active ? `${pref.label} disabled` : `${pref.label} enabled \u2014 routes will adapt`);
    /* \u{1F50C} API NEEDED: POST /api/user/preferences */
  };

  const activeCount = prefs.filter((p) => p.active).length;

  return (
    <>
      <header className="header-gradient compact">
        <button className="icon-btn" onClick={() => onNavigate("home")}>{"\u2190"}</button>
        <div className="brand"><span>{"\u{1F464}"}</span><span>Profile Hub</span></div>
        <button className="icon-btn" onClick={() => onFeedback("Settings opened")}>{"\u2699"}</button>
      </header>

      {/* User Card */}
      <Card className="user-card">
        <div className="user-top">
          <div className="user-avatar-lg">{userProfile.name[0]}{userProfile.surname[0]}</div>
          <div>
            <h3>{userProfile.name} {userProfile.surname}</h3>
            <p className="muted">{userProfile.role} {"\u2022"} {userProfile.university}</p>
            <span className="segment-tag">{"\u{1F9EC}"} {userProfile.segment}</span>
          </div>
        </div>
        <div className="user-stats">
          <div><strong>{userProfile.totalTrips}</strong><span>Trips</span></div>
          <div><strong>{userProfile.greenScore}</strong><span>Points</span></div>
          <div><strong>{userProfile.totalCO2Saved} kg</strong><span>CO{"\u2082"} Saved</span></div>
          <div><strong>{"\u20AC"}{userProfile.monthlySpend}</strong><span>Monthly</span></div>
        </div>
      </Card>

      {/* Insurance */}
      <Card title={"\u{1F6E1}\uFE0F Travel Insurance"} className="ins-card">
        <div className="ins-rows">
          <div className="ins-row">
            <span>Current annual premium</span>
            <strong>{"\u20AC"}{insuranceData.currentPremium}</strong>
          </div>
          <div className="ins-row">
            <span>With PT usage ({insuranceData.ptDaysRequired}+ days/wk)</span>
            <strong className="green-text">{"\u20AC"}{insuranceData.potentialPremium}</strong>
          </div>
          <div className="ins-row highlight">
            <span>Potential discount</span>
            <strong className="green-text">{insuranceData.discountPercent}%</strong>
          </div>
        </div>
        <div className="ins-nudge">{"\u{1F4A1}"} {insuranceData.nudge}</div>
        <div className="btn-row">
          <button className="btn ghost" onClick={() => onFeedback("Policy document opened")}>View Policy</button>
          <button className="btn solid" onClick={() => onFeedback("Insurance quote started")}>Get Quote</button>
        </div>
      </Card>

      {/* True Cost Calculator */}
      <Card title={"\u{1F9EE} True Cost Calculator"} className="cost-card">
        <p className="cost-intro">What you <em>think</em> you pay vs what you <strong>actually</strong> pay:</p>

        <div className="cost-compare">
          <div className="cost-box perceived">
            <span className="cost-label">Perceived</span>
            <span className="cost-amount">{"\u20AC"}{trueCostData.perceived.amount}</span>
            <span className="cost-unit">{trueCostData.perceived.unit}</span>
          </div>
          <span className="cost-vs">vs</span>
          <div className="cost-box actual">
            <span className="cost-label">True Cost</span>
            <span className="cost-amount">{"\u20AC"}{trueCostData.actual.total}</span>
            <span className="cost-unit">/month</span>
          </div>
        </div>

        <button className="btn ghost full" onClick={() => setShowCost(!showCost)}>
          {showCost ? "Hide" : "Show"} Full Breakdown {showCost ? "\u25B4" : "\u25BE"}
        </button>

        {showCost && (
          <div className="cost-breakdown">
            {trueCostData.actual.items.map((item, i) => (
              <div key={i} className="cb-row">
                <span>{item.name}</span>
                <strong>{"\u20AC"}{item.amount}</strong>
              </div>
            ))}
            <div className="cb-row total">
              <span>Total real monthly cost</span>
              <strong>{"\u20AC"}{trueCostData.actual.total}</strong>
            </div>
          </div>
        )}

        <div className="savings-box">
          <div>
            <span>{"\u{1F4B0}"} MoveWise PT Bundle</span>
            <strong className="green-text">{"\u20AC"}{trueCostData.ptAlternative.amount}/mo</strong>
          </div>
          <div className="savings-line">
            Save <strong>{"\u20AC"}{trueCostData.savings}/month</strong> = <strong>{"\u20AC"}{trueCostData.savings * 12}/year</strong>
          </div>
        </div>
      </Card>

      {/* Carbon Budget */}
      <Card title={"\u{1F30D} Carbon Budget"} className="carbon-card">
        <div className="carbon-overview">
          <div className="carbon-ring-container">
            <svg viewBox="0 0 100 100" className="carbon-ring">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="8"
                strokeDasharray={`${(carbonData.saved / carbonData.monthlyBudget) * 251} 251`}
                strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div className="carbon-center">
              <strong>{carbonData.saved} kg</strong>
              <span>saved</span>
            </div>
          </div>
          <div className="carbon-legend">
            {carbonData.breakdown.map((item, i) => (
              <div key={i} className="legend-row">
                <span className="legend-dot" style={{ background: item.color }} />
                <span>{item.mode}</span>
                <strong>{item.co2} kg</strong>
              </div>
            ))}
          </div>
        </div>
        <p className="muted center-text">Yearly projection: <strong>{carbonData.yearly} kg CO{"\u2082"}</strong> saved</p>
      </Card>

      {/* Priorities */}
      <Card title={"\u{1F4CA} Priority Levels"} subtitle={"Tap to change \u2014 Low \u2192 Medium \u2192 High"}>
        <div className="pref-grid">
          {Object.entries(priorities).map(([key, val]) => (
            <button key={key} className={`pref-chip interactive ${val.toLowerCase()}`} onClick={() => cyclePriority(key)}>
              {key}: {val}
            </button>
          ))}
        </div>
      </Card>

      {/* 3D Habit Ring */}
      <Card title={"\u2699\uFE0F Travel Preferences"} subtitle={"Tap to toggle \u2014 routes adapt to your choices"}>
        <div className="pref-toggle-grid">
          {prefs.map((p) => (
            <button
              key={p.id}
              className={`pref-toggle ${p.active ? "active" : ""}`}
              onClick={() => togglePref(p.id)}
              title={p.description}
            >
              <span className="pref-toggle-icon">{p.icon}</span>
              <span className="pref-toggle-label">{p.label}</span>
              <span className="pref-toggle-check">{p.active ? "\u2713" : ""}</span>
            </button>
          ))}
        </div>
        <p className="pref-hint">
          {activeCount} active — the RL engine adjusts route suggestions in real-time
        </p>
      </Card>

      {/* RL Behavioral Profile */}
      <Card title={"\u{1F9E0} RL Behavioral Profile"} className="rl-card">
        <p className="rl-note">How the AI models your mobility behavior <small>(HUR Model)</small>:</p>
        <div className="rl-params">
          {Object.entries(userProfile.behavioralParams).map(([key, val]) => (
            <div key={key} className="rl-param">
              <span className="rl-name">{key}</span>
              <div className="rl-bar">
                <div className="rl-fill" style={{ width: `${Math.min((val / 2.5) * 100, 100)}%` }} />
              </div>
              <span className="rl-val">{val}</span>
            </div>
          ))}
        </div>
        <p className="rl-formula">Nudge*(i,t) = argmax Q\u0302(s_i^t, nudge; \u03B8)</p>
      </Card>

      {/* Privacy + Support */}
      <Card title={"\u{1F512} Privacy & Support"}>
        <div className="privacy-btns">
          <button className="btn ghost" onClick={() => onFeedback("GDPR data export initiated")}>Export My Data</button>
          <button className="btn ghost danger" onClick={() => onFeedback("Account deletion requested")}>Delete Account</button>
          <button className="btn solid" onClick={() => onFeedback("Support chat opened")}>Get Support</button>
        </div>
      </Card>
    </>
  );
}
