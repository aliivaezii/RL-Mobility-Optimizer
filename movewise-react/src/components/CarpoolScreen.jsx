import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import Card from "./ui/Card";
import { carpoolMatches, carpoolHistory } from "../data/mockData";

function CarpoolMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (!L) return;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([45.09, 7.55], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
    const greenIcon = L.divIcon({ className: "leaflet-marker-green", html: '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>', iconSize: [14, 14] });
    const blueIcon = L.divIcon({ className: "leaflet-marker-blue", html: '<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>', iconSize: [14, 14] });
    L.marker([45.178, 7.647], { icon: greenIcon }).addTo(map).bindPopup("Caselle Torinese");
    L.marker([44.978, 7.538], { icon: blueIcon }).addTo(map).bindPopup("Orbassano");
    L.polyline([[45.178, 7.647], [45.09, 7.60], [44.978, 7.538]], { color: "#7c3aed", weight: 3, dashArray: "8 4" }).addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  return <div ref={mapRef} className="cp-leaflet-map" />;
}

export default function CarpoolScreen({ onNavigate, onFeedback }) {
  const [fromInput, setFromInput] = useState("Caselle Torinese");
  const [toInput, setToInput] = useState("Orbassano (San Luigi)");
  const [timeInput, setTimeInput] = useState("07:30");
  const [seats, setSeats] = useState(1);
  const [role, setRole] = useState("rider");
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <header className="header-gradient compact" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
        <button className="icon-btn" onClick={() => onNavigate("home")}>{"\u2190"}</button>
        <div className="brand"><span>{"\u{1F697}"}</span><span>Carpooling</span></div>
        <button className="icon-btn" onClick={() => setShowHistory(!showHistory)}>{"\u{1F4CB}"}</button>
      </header>

      {/* Carpool History Modal */}
      {showHistory && (
        <div className="cp-history-overlay" onClick={() => setShowHistory(false)}>
          <div className="cp-history-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cp-history-head">
              <h3>{"\u{1F4CB}"} Ride History</h3>
              <button className="icon-btn" onClick={() => setShowHistory(false)}>{"\u2715"}</button>
            </div>
            <div className="cp-history-list">
              {carpoolHistory.map((h) => (
                <div key={h.id} className="cp-history-item">
                  <div className="cp-hist-top">
                    <span className="cp-hist-date">{h.date}</span>
                    <span className={`cp-hist-status ${h.status}`}>{"\u2713"} {h.status}</span>
                  </div>
                  <div className="cp-hist-route">
                    <strong>{h.driver}</strong>
                    <span className="muted">{h.route}</span>
                  </div>
                  <div className="cp-hist-stats">
                    <span>{h.cost}</span>
                    <span className="green-text">{h.co2Saved} CO{"\u2082"}</span>
                    <span>{"\u2B50"} {h.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="cp-hist-summary">
              <strong>Total rides:</strong> {carpoolHistory.length} {"\u2022"} <strong className="green-text">6.6 kg CO{"\u2082"} saved</strong>
            </div>
          </div>
        </div>
      )}

      {/* Role Toggle */}
      <div className="cp-role-toggle">
        <button className={`cp-role-btn${role === "rider" ? " active" : ""}`} onClick={() => setRole("rider")}>
          {"\u{1F9D1}\u200D\u{1F393}"} Find a Ride
        </button>
        <button className={`cp-role-btn${role === "driver" ? " active" : ""}`} onClick={() => setRole("driver")}>
          {"\u{1F698}"} Offer a Ride
        </button>
      </div>

      {/* Same OD Input layout as Route Planner */}
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
          <div className="od-mini-map" style={{ background: "linear-gradient(135deg, #f3e8ff, #ede9fe)" }}>
            <div style={{ textAlign: "center", paddingTop: 24, fontSize: 28 }}>{"\u{1F697}"}</div>
            <div style={{ textAlign: "center", fontSize: 10, color: "#7c3aed", fontWeight: 600 }}>Carpool</div>
          </div>
        </div>
        <div className="od-time-row">
          <div className="cp-field half" style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{"\u23F0"} Departure</label>
            <input type="time" className="od-time-input" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />
          </div>
          <div className="cp-seats-inline">
            <label style={{ fontSize: 11, color: "#64748b" }}>{"\u{1F4BA}"} Seats</label>
            <div className="cp-seats">
              <button onClick={() => setSeats(Math.max(1, seats - 1))}>-</button>
              <span>{seats}</span>
              <button onClick={() => setSeats(Math.min(4, seats + 1))}>+</button>
            </div>
          </div>
          <button className="btn solid sm" onClick={() => onFeedback("Searching for carpool matches...")}>
            {role === "rider" ? "Find" : "Offer"} {"\u{1F50D}"}
          </button>
        </div>
      </Card>

      {/* Live Map */}
      <Card className="cp-map-card">
        <CarpoolMap />
        <div className="cp-map-legend">
          <span><span className="legend-dot green" /> Your pickup</span>
          <span><span className="legend-dot blue" /> Destination</span>
          <span><span className="legend-dot purple" /> Carpool route</span>
        </div>
      </Card>

      {/* Matches */}
      <div className="section-head">
        <h3>{"\u{1F91D}"} Available Matches</h3>
        <small>{carpoolMatches.length} riders on your corridor</small>
      </div>

      {carpoolMatches.map((m) => (
        <Card key={m.id} className="carpool-card">
          <div className="cp-head">
            <span className="cp-avatar">{"\u{1F9D1}\u200D\u{1F393}"}</span>
            <div>
              <strong>{m.name}</strong>
              <p className="muted">{m.route} {"\u2022"} {m.time}</p>
            </div>
            <span className="cp-rating">{"\u2B50"} {m.rating}</span>
          </div>
          <div className="cp-stats">
            <div><strong>{m.overlap}%</strong><span>Overlap</span></div>
            <div><strong>{m.detour}</strong><span>Detour</span></div>
            <div><strong>{m.costPerPerson}</strong><span>Per person</span></div>
            <div className="green-text"><strong>{m.co2Savings}</strong><span>CO{"\u2082"}</span></div>
          </div>
          <div className="btn-row">
            <button className="btn ghost" onClick={() => onFeedback("Safety verification shown")}>Safety {"\u2714"}</button>
            <button className="btn solid" onClick={() => onFeedback("Carpool request sent!")}>
              {role === "rider" ? "Request Ride" : "Accept Rider"}
            </button>
          </div>
        </Card>
      ))}

      {/* Safety & Trust — Redesigned */}
      <Card className="cp-safety-card">
        <h3 className="cp-safety-title">{"\u{1F6E1}\uFE0F"} Safety & Trust</h3>
        <div className="cp-safety-grid">
          <div className="cp-safety-tile">
            <div className="cp-safety-icon-wrap verified">{"\u2705"}</div>
            <strong>University Verified</strong>
            <span>@studenti.unito.it</span>
          </div>
          <div className="cp-safety-tile">
            <div className="cp-safety-icon-wrap tracking">{"\u{1F4F1}"}</div>
            <strong>Live Tracking</strong>
            <span>Share with contacts</span>
          </div>
          <div className="cp-safety-tile">
            <div className="cp-safety-icon-wrap ratings">{"\u2B50"}</div>
            <strong>Ratings System</strong>
            <span>Rate after each trip</span>
          </div>
          <div className="cp-safety-tile">
            <div className="cp-safety-icon-wrap insured">{"\u{1F6E1}\uFE0F"}</div>
            <strong>Fully Insured</strong>
            <span>MoveWise coverage</span>
          </div>
        </div>
      </Card>

      {/* Community Impact — Redesigned */}
      <Card className="cp-impact-card">
        <h3 className="cp-impact-title">{"\u{1F30D}"} Community Impact</h3>
        <div className="cp-impact-stats">
          <div className="cp-impact-stat">
            <span className="cp-impact-num">247</span>
            <span className="cp-impact-label">Active Carpoolers</span>
            <div className="cp-impact-bar"><div className="cp-impact-fill" style={{ width: "72%" }} /></div>
          </div>
          <div className="cp-impact-stat">
            <span className="cp-impact-num green-text">1,420 kg</span>
            <span className="cp-impact-label">CO{"\u2082"} Saved This Month</span>
            <div className="cp-impact-bar"><div className="cp-impact-fill eco" style={{ width: "85%" }} /></div>
          </div>
          <div className="cp-impact-stat">
            <span className="cp-impact-num purple-text">{"\u20AC"}3,200</span>
            <span className="cp-impact-label">Total Savings Shared</span>
            <div className="cp-impact-bar"><div className="cp-impact-fill money" style={{ width: "60%" }} /></div>
          </div>
        </div>
        <p className="cp-impact-cta">{"\u{1F33F}"} Every shared ride = 2.1 kg CO{"\u2082"} saved on average</p>
      </Card>
    </>
  );
}
