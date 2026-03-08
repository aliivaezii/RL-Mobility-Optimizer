import { useState, Suspense } from "react";
import Card from "./ui/Card";
import { routeOptions } from "../data/mockData";
import RouteArc from "./three/RouteArc";

const routeTabs = [
  { key: "best", label: "\u{1F33F} Best for You", filter: (r) => r, sort: (a, b) => a.gcScore - b.gcScore },
  { key: "cheapest", label: "\u{1F4B0} Cheapest", filter: (r) => r, sort: (a, b) => parseFloat(a.cost.replace("\u20AC", "")) - parseFloat(b.cost.replace("\u20AC", "")) },
  { key: "fastest", label: "\u26A1 Fastest", filter: (r) => r, sort: (a, b) => parseInt(a.totalTime) - parseInt(b.totalTime) },
  { key: "eco", label: "\u{1F30D} Greenest", filter: (r) => r, sort: (a, b) => parseFloat(b.co2) - parseFloat(a.co2) },
];

function MiniMap() {
  return (
    <svg viewBox="0 0 100 120" className="mini-map-svg">
      <path d="M15 10 L50 55 L85 105" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 50 L90 50" fill="none" stroke="#e2e8f0" strokeWidth="2" />
      <path d="M50 5 L50 115" fill="none" stroke="#e2e8f0" strokeWidth="2" />
      <path d="M25 15 L45 45 L75 100" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />
      <circle cx="25" cy="15" r="5" fill="#22c55e" />
      <circle cx="25" cy="15" r="2" fill="#fff" />
      <circle cx="75" cy="100" r="5" fill="#3b82f6" />
      <circle cx="75" cy="100" r="2" fill="#fff" />
      <rect x="43" y="42" width="14" height="10" rx="2" fill="#f59e0b" opacity="0.6" />
      <text x="50" y="49" textAnchor="middle" fontSize="5" fill="#fff">{"\u{1F682}"}</text>
      <text x="25" y="8" textAnchor="middle" fontSize="4.5" fill="#22c55e" fontWeight="bold">Caselle</text>
      <text x="75" y="115" textAnchor="middle" fontSize="4.5" fill="#3b82f6" fontWeight="bold">Orbassano</text>
    </svg>
  );
}

export default function TripsScreen({ onNavigate, onFeedback }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromInput, setFromInput] = useState("Caselle Torinese");
  const [toInput, setToInput] = useState("Orbassano (San Luigi)");
  const [timeMode, setTimeMode] = useState("leave");
  const [timeValue, setTimeValue] = useState("07:40");
  const [activeTab, setActiveTab] = useState("best");

  const refreshRoutes = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onFeedback("Routes re-computed by RL engine");
    }, 800);
  };

  const currentTabDef = routeTabs.find((t) => t.key === activeTab);
  const tabRoutes = [...routeOptions].sort(currentTabDef.sort);
  const routeIndex = selectedRoute ? routeOptions.findIndex((r) => r.id === selectedRoute) : 0;

  return (
    <>
      <header className="header-gradient compact">
        <button className="icon-btn" onClick={() => onNavigate("home")}>{"\u2190"}</button>
        <div className="brand"><span className="brand-leaf">{"\u{1F33F}"}</span><span>Route Planner</span></div>
        <button className="icon-btn" onClick={refreshRoutes} aria-label="Refresh">{"\u21BB"}</button>
      </header>

      {/* Origin / Destination with Mini Map */}
      <Card className="od-input-card">
        <div className="od-input-layout">
          <div className="od-inputs">
            <div className="od-input-row">
              <span className="od-dot green" />
              <div className="od-input-field">
                <label>From</label>
                <input type="text" value={fromInput} onChange={(e) => setFromInput(e.target.value)} placeholder="Enter origin..." />
              </div>
            </div>
            <div className="od-swap-line">
              <button className="od-swap-btn" onClick={() => { const tmp = fromInput; setFromInput(toInput); setToInput(tmp); }} title="Swap">{"\u21C5"}</button>
            </div>
            <div className="od-input-row">
              <span className="od-dot blue" />
              <div className="od-input-field">
                <label>To</label>
                <input type="text" value={toInput} onChange={(e) => setToInput(e.target.value)} placeholder="Enter destination..." />
              </div>
            </div>
          </div>
          <div className="od-mini-map" title="Tap to select on map">
            <MiniMap />
          </div>
        </div>
        <div className="od-time-row">
          <div className="od-time-toggle">
            <button className={`time-toggle-btn${timeMode === "leave" ? " active" : ""}`} onClick={() => setTimeMode("leave")}>Leave at</button>
            <button className={`time-toggle-btn${timeMode === "arrive" ? " active" : ""}`} onClick={() => setTimeMode("arrive")}>Arrive by</button>
          </div>
          <input type="time" className="od-time-input" value={timeValue} onChange={(e) => setTimeValue(e.target.value)} />
          <button className="btn solid sm" onClick={refreshRoutes}>Search</button>
        </div>
      </Card>

      {/* 3D Route Arc Hero */}
      <Card className="route-arc-card">
        <Suspense fallback={null}>
          <RouteArc selected={routeIndex >= 0 ? routeIndex : 0} />
        </Suspense>
        <div className="arc-labels">
          <span className="arc-label start">Caselle</span>
          <span className="arc-label end">Orbassano</span>
        </div>
      </Card>

      {/* Route Tabs */}
      <div className="route-tabs">
        {routeTabs.map((tab) => (
          <button key={tab.key} className={`route-tab${activeTab === tab.key ? " active" : ""}`} onClick={() => { setActiveTab(tab.key); setSelectedRoute(null); }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inline route options for the active tab */}
      {loading ? (
        <Card><p className="loading-msg">{"\u26A1"} Computing optimal routes via RL engine...</p></Card>
      ) : (
        <div className="tab-routes-list">
          {tabRoutes.map((r, idx) => (
            <div
              key={r.id}
              className={`tab-route-item${selectedRoute === r.id ? " expanded" : ""}${idx === 0 ? " top-pick" : ""}`}
              onClick={() => setSelectedRoute(r.id === selectedRoute ? null : r.id)}
            >
              <div className="tab-route-header">
                <div className="tab-route-rank">
                  {idx === 0 && <span className="rl-badge-sm">{activeTab === "best" ? "RL Pick" : "#1"}</span>}
                  <h4>{r.title}</h4>
                </div>
                <div className="tab-route-quick">
                  <span className="trq-time">{r.totalTime}</span>
                  <span className="trq-cost">{r.cost}</span>
                  <span className="trq-co2 green-text">{r.co2}</span>
                </div>
              </div>

              <div className="tab-route-segments">
                {r.segments.map((seg, i) => (
                  <span key={i} className="seg-group">
                    {i > 0 && <span className="seg-arrow">{"\u2192"}</span>}
                    <span className="seg-chip-sm">{seg.mode} {seg.duration}</span>
                  </span>
                ))}
              </div>

              {selectedRoute === r.id && (
                <div className="tab-route-details">
                  <div className="route-detail-row">
                    <span>GC Score: <strong>{r.gcScore}</strong></span>
                    <span>Comfort: <strong>{r.comfort}</strong></span>
                    <span>Reliable: <strong>{r.reliability}</strong></span>
                  </div>
                  {r.tags?.length > 0 && (
                    <div className="route-tags">
                      {r.tags.map((t, i) => <span key={i} className="tag-sm">{t}</span>)}
                    </div>
                  )}
                  <div className="btn-row">
                    <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); onFeedback("Route details opened"); }}>Details</button>
                    <button className="btn solid sm" onClick={(e) => { e.stopPropagation(); onNavigate("pay"); onFeedback(`Booked! +${r.greenPoints} pts`); }}>Book + QR</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Parking · Fuel · Weather */}
      <div className="section-head">
        <h3>{"\u{1F6A8}"} Travel Info</h3>
        <small>Real-time parking, fuel & weather</small>
      </div>

      <div className="travel-info-grid">
        <Card className="info-tile parking-tile" onClick={() => onNavigate("insurance_parking")}>
          <span className="info-tile-icon">{"\u{1F17F}\uFE0F"}</span>
          <div className="info-tile-content">
            <strong>Parking</strong>
            <span className="info-tile-val">Orbassano P2</span>
            <span className="info-tile-sub">{"\u20AC"}1.20/h {"\u2022"} 42 spots</span>
          </div>
        </Card>
        <Card className="info-tile fuel-tile" onClick={() => onNavigate("insurance_parking")}>
          <span className="info-tile-icon">{"\u26FD"}</span>
          <div className="info-tile-content">
            <strong>Cheapest Fuel</strong>
            <span className="info-tile-val">IP Via Torino</span>
            <span className="info-tile-sub">{"\u20AC"}1.72/L</span>
          </div>
        </Card>
        <Card className="info-tile weather-tile">
          <span className="info-tile-icon">{"\u{1F324}\uFE0F"}</span>
          <div className="info-tile-content">
            <strong>Weather</strong>
            <span className="info-tile-val">Clear, 14{"\u00B0"}C</span>
            <span className="info-tile-sub">All modes available</span>
          </div>
        </Card>
        <Card className="info-tile traffic-tile">
          <span className="info-tile-icon">{"\u{1F6A6}"}</span>
          <div className="info-tile-content">
            <strong>Traffic</strong>
            <span className="info-tile-val">Moderate</span>
            <span className="info-tile-sub">SP6 +8 min delay</span>
          </div>
        </Card>
      </div>
    </>
  );
}
