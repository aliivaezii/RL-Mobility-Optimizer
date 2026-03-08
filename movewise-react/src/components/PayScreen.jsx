import { useState, useEffect, useRef, Suspense } from "react";
import L from "leaflet";
import Card from "./ui/Card";
import { journeySteps, walletData } from "../data/mockData";
import QRParallax from "./three/QRParallax";
import CardStack from "./three/CardStack";

const JOURNEY_COORDS = [
  { lat: 45.178, lng: 7.647, label: "Caselle Torinese" },
  { lat: 45.117, lng: 7.676, label: "Torino Stura Station" },
  { lat: 44.978, lng: 7.538, label: "Orbassano Station" },
  { lat: 44.964, lng: 7.526, label: "San Luigi Campus" },
];

function JourneyMap({ steps }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (!L) return;

    const bounds = L.latLngBounds(JOURNEY_COORDS.map((c) => [c.lat, c.lng]));
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
      .fitBounds(bounds, { padding: [30, 30] });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

    const statusColors = { done: "#22c55e", active: "#f59e0b", pending: "#94a3b8" };

    steps.forEach((step, i) => {
      if (!JOURNEY_COORDS[i]) return;
      const c = JOURNEY_COORDS[i];
      const color = statusColors[step.status] || "#94a3b8";
      const icon = L.divIcon({
        className: "journey-map-marker",
        html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.25);display:grid;place-items:center;font-size:9px;">${step.mode}</div>`,
        iconSize: [16, 16],
      });
      L.marker([c.lat, c.lng], { icon }).addTo(map).bindPopup(
        `<b>${step.name}</b><br/>${c.label}<br/><span style="color:${color};font-weight:600">${step.status === "done" ? "Completed" : step.status === "active" ? "In transit" : "Upcoming"}</span>`
      );
    });

    const routeLine = JOURNEY_COORDS.map((c) => [c.lat, c.lng]);
    L.polyline(routeLine, { color: "#22c55e", weight: 3, opacity: 0.7, dashArray: "6 4" }).addTo(map);

    const activeIdx = steps.findIndex((s) => s.status === "active");
    if (activeIdx >= 0 && JOURNEY_COORDS[activeIdx]) {
      const ac = JOURNEY_COORDS[activeIdx];
      const pulse = L.divIcon({
        className: "journey-pulse",
        html: '<div class="journey-pulse-ring"></div>',
        iconSize: [30, 30],
      });
      L.marker([ac.lat, ac.lng], { icon: pulse }).addTo(map);
    }

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [steps]);

  return (
    <div className="journey-map-wrap">
      <div ref={mapRef} className="journey-leaflet-map" />
      {showHint && (
        <div className="journey-map-hint">
          <div className="map-hint-icon">{"\u{1F50D}"}</div>
          <span>Pinch or scroll to zoom</span>
        </div>
      )}
    </div>
  );
}

export default function PayScreen({ onNavigate, onFeedback }) {
  const plans = ["Pay-as-you-go", "Monthly PT Bundle", "Premium"];
  const [activePlan, setActivePlan] = useState(0);
  const [expandedStep, setExpandedStep] = useState(null);

  return (
    <>
      {/* Orange gradient header */}
      <header className="header-pay">
        <button className="icon-btn" onClick={() => onNavigate("home")}>{"\u2190"}</button>
        <div className="brand"><span>{"\u{1F4B3}"}</span><span>QR Payment</span></div>
        <button className="icon-btn" onClick={() => onNavigate("profile")}>{"\u2699"}</button>
      </header>

      {/* QR Code Card — Compact horizontal layout */}
      {/* \u{1F50C} API NEEDED: POST /api/qr/generate — Dynamic QR for tap-in/tap-out */}
      <Card className="qr-hero-card qr-compact">
        <div className="qr-compact-row">
          <div className="qr-code-sm" aria-label="QR Code for tap-in">
            <div className="qr-pattern" />
            <span className="qr-center">{"\u{1F33F}"}</span>
          </div>
          <div className="qr-compact-info">
            <h3 className="qr-action">Scan to TAP-IN {"\u{1F6F4}"}</h3>
            <p className="qr-location">Caselle Torinese</p>
            <p className="qr-time">7:45 AM — March 7, 2026</p>
            <button className="btn ghost sm" onClick={() => onFeedback("NFC tap simulated")}>
              {"\u{1F4F1}"} NFC Tap
            </button>
          </div>
        </div>
      </Card>

      {/* Journey Timeline — Expandable */}
      <Card title={"\u{1F5FA}\uFE0F Today's Journey"}>
        <JourneyMap steps={journeySteps} />
        <div className="journey-timeline">
          {journeySteps.map((step, i) => (
            <div
              key={step.id}
              className={`tl-step-wrap${expandedStep === step.id ? " expanded" : ""}`}
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              style={{ cursor: "pointer" }}
            >
              <div className={`tl-step ${step.status}`}>
                <div className="tl-left">
                  <div className={`tl-dot ${step.status}`}>{step.mode}</div>
                  {i < journeySteps.length - 1 && <div className={`tl-line ${step.status}`} />}
                </div>
                <div className="tl-content">
                  <div className="tl-main">
                    <strong>{step.name}</strong>
                    <span className="muted">{step.detail}</span>
                  </div>
                  <div className="tl-right">
                    <span className="tl-time">{step.time}</span>
                    <span className={`tl-status ${step.status}`}>
                      {step.status === "done" && "\u2705"}
                      {step.status === "active" && "\u23F3"}
                      {step.status === "pending" && "\u25CB"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Expandable detail panel — below the step row */}
              <div className={`tl-expand${expandedStep === step.id ? " open" : ""}`}>
                <div className="tl-expand-inner">
                  <div className="tl-detail-grid">
                    <div className="tl-detail-item">
                      <span className="tl-detail-label">Provider</span>
                      <span className="tl-detail-val">{step.provider || "On foot"}</span>
                    </div>
                    <div className="tl-detail-item">
                      <span className="tl-detail-label">Cost</span>
                      <span className="tl-detail-val">{step.cost}</span>
                    </div>
                    <div className="tl-detail-item">
                      <span className="tl-detail-label">Departure</span>
                      <span className="tl-detail-val">{step.time}</span>
                    </div>
                    <div className="tl-detail-item">
                      <span className="tl-detail-label">Route</span>
                      <span className="tl-detail-val">{step.detail}</span>
                    </div>
                  </div>
                  {step.status === "active" && (
                    <div className="tl-live-badge">{"\u{1F534}"} Live — In transit</div>
                  )}
                  {step.status === "done" && (
                    <div className="tl-done-badge">{"\u2705"} Completed — QR tapped out</div>
                  )}
                  {step.status === "pending" && (
                    <div className="tl-pending-badge">{"\u23F0"} Upcoming — Scan QR to start</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trip Summary */}
      <Card className="summary-card">
        <div className="summary-grid">
          <div className="summary-item">
            <strong className="blue-text">{"\u20AC"}4.20</strong>
            <span>Est. total</span>
          </div>
          <div className="summary-item">
            <strong className="green-text">-1.5 kg</strong>
            <span>CO{"\u2082"} saved</span>
          </div>
          <div className="summary-item">
            <strong className="orange-text">+50 {"\u{1F331}"}</strong>
            <span>Green Points</span>
          </div>
        </div>
      </Card>

      {/* 3D Wallet Card Stack */}
      <Card title={"\u{1F4B0}"} className="wallet-3d-section">
        <Suspense fallback={null}>
          <CardStack activePlan={activePlan} />
        </Suspense>
      </Card>

      {/* Wallet */}
      <Card title={"\u{1F4B0} Wallet"}>
        <div className="wallet-top">
          <div>
            <span className="wallet-bal">{"\u20AC"}{walletData.balance.toFixed(2)}</span>
            <span className="wallet-plan">{walletData.plan}</span>
          </div>
          <button className="btn solid sm" onClick={() => onFeedback("Top-up initiated")}>+ Top Up</button>
        </div>
        <div className="wallet-bar">
          <div className="wallet-fill" style={{ width: `${(walletData.monthlySpent / walletData.monthlyBudget) * 100}%` }} />
        </div>
        <p className="muted sm-text">{"\u20AC"}{walletData.monthlySpent.toFixed(2)} / {"\u20AC"}{walletData.monthlyBudget} monthly budget</p>

        <div className="tx-list">
          {walletData.transactions.map((tx, i) => (
            <div key={i} className="tx-row">
              <span className="tx-icon">{tx.mode}</span>
              <div className="tx-info">
                <strong>{tx.desc}</strong>
                <span className="muted">{tx.date}</span>
              </div>
              <span className={`tx-amount${tx.amount > 0 ? " positive" : ""}`}>
                {tx.amount > 0 ? "+" : ""}{"\u20AC"}{Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Subscription Plans */}
      <Card title={"\u{1F4E6} Subscription Plans"}>
        <div className="plan-options">
          <div className={`plan${activePlan === 0 ? " active" : ""}`} onClick={() => { setActivePlan(0); onFeedback("Switched to Pay-as-you-go"); }}>
            <strong>Pay-as-you-go</strong>
            <span>{activePlan === 0 ? "Current plan" : "Tap to switch"}</span>
          </div>
          <div className={`plan${activePlan === 1 ? " active" : ""}`} onClick={() => { setActivePlan(1); onFeedback("Switched to Monthly bundle"); }}>
            <strong>Monthly PT Bundle — {"\u20AC"}49/mo</strong>
            <span>Unlimited PT + 20 e-scooter rides</span>
          </div>
          <div className={`plan${activePlan === 2 ? " active" : ""}`} onClick={() => { setActivePlan(2); onFeedback("Switched to Premium"); }}>
            <strong>Premium — {"\u20AC"}65/mo</strong>
            <span>All modes + 5 carpool rides + insurance</span>
          </div>
        </div>
      </Card>
    </>
  );
}
