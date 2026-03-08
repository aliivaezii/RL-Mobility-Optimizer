import { useState } from "react";
import Card from "./ui/Card";
import { insuranceData, trueCostData, userProfile } from "../data/mockData";

const parkingSpots = [
  { name: "Orbassano Hub P2", price: "\u20AC1.20/h", spots: 42, type: "Covered", distance: "200m to campus" },
  { name: "Caselle P&R", price: "\u20AC0.80/h", spots: 120, type: "Open air", distance: "Near train station" },
  { name: "Torino Stura P&R", price: "Free", spots: 85, type: "Open air", distance: "At SFM1 station" },
];

const coverageOptions = [
  { id: "liability", name: "Third-Party Liability", icon: "\u{1F6E1}\uFE0F", included: true, mandatory: true, price: 0, desc: "Mandatory coverage for all vehicles" },
  { id: "collision", name: "Collision Coverage", icon: "\u{1F697}", included: true, mandatory: false, price: 12, desc: "Covers damage to your vehicle" },
  { id: "theft", name: "Theft & Fire", icon: "\u{1F525}", included: true, mandatory: false, price: 8, desc: "Protection against theft and fire damage" },
  { id: "roadside", name: "Roadside Assistance", icon: "\u{1F6E0}\uFE0F", included: true, mandatory: false, price: 5, desc: "24/7 emergency roadside help" },
  { id: "glass", name: "Glass Coverage", icon: "\u{1FA9F}", included: false, mandatory: false, price: 4, desc: "Windshield and glass repair/replacement" },
  { id: "medical", name: "Medical Payments", icon: "\u{1FA7A}", included: false, mandatory: false, price: 7, desc: "Medical expenses for driver and passengers" },
  { id: "scooter", name: "E-Scooter Insurance", icon: "\u{1F6F4}", included: false, mandatory: false, price: 3, desc: "Coverage for shared e-scooter accidents" },
  { id: "travel", name: "Travel Delay Cover", icon: "\u23F0", included: false, mandatory: false, price: 2, desc: "Compensation for PT delays >30min" },
];

const chatResponses = [
  { q: "premium", a: "Your current annual premium is \u20AC560. With PT usage (3+ days/week), you can get up to 15% off \u2014 that's \u20AC476/year! \u{1F4B0}" },
  { q: "parking", a: "We have 3 parking spots along your corridor: Orbassano Hub P2 (\u20AC1.20/h), Caselle P&R (\u20AC0.80/h), and Torino Stura P&R (Free). Check the Parking tab for details!" },
  { q: "claim", a: "To file a claim, go to the Claims tab and click 'File a New Claim'. For emergencies, call roadside assistance at +39 800 123 456 (24/7)." },
  { q: "coverage", a: "You currently have 4 active coverages: Third-Party Liability, Collision, Theft & Fire, and Roadside Assistance. Visit the Coverage tab to add optional ones!" },
  { q: "discount", a: "Use public transport 3+ days per week to qualify for up to 15% premium reduction. Less driving = lower risk = bigger savings! \u{1F33F}" },
];

export default function InsuranceScreen({ onNavigate, onFeedback, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [coverages, setCoverages] = useState(coverageOptions);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hi! I'm MoveWise Insurance Assistant. Ask me about premiums, coverage, claims, parking, or discounts! \u{1F916}" }
  ]);

  const toggleCoverage = (id) => {
    setCoverages((prev) =>
      prev.map((c) => {
        if (c.id !== id || c.mandatory) return c;
        return { ...c, included: !c.included };
      })
    );
    onFeedback("Coverage updated \u2014 premium recalculated");
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      const match = chatResponses.find((r) => lower.includes(r.q));
      const reply = match ? match.a : "I can help with premiums, coverage, claims, parking, and discounts. Could you rephrase your question? \u{1F914}";
      setChatMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 600);
  };

  const basePremium = 22;
  const monthlyPremium = basePremium + coverages.filter((c) => c.included && !c.mandatory).reduce((sum, c) => sum + c.price, 0);
  const includedCount = coverages.filter((c) => c.included).length;

  return (
    <>
      <header className="header-gradient compact" style={{ background: "linear-gradient(135deg, #1e40af, #3b82f6)" }}>
        <button className="icon-btn" onClick={() => onNavigate("home")}>{"\u2190"}</button>
        <div className="brand"><span>{"\u{1F6E1}\uFE0F"}</span><span>Insurance & Parking</span></div>
        <button className="icon-btn" onClick={() => setShowChat(!showChat)}>{"\u{1F4AC}"}</button>
      </header>

      {/* Chatbot Panel */}
      {showChat && (
        <div className="chatbot-overlay" onClick={() => setShowChat(false)}>
          <div className="chatbot-panel" onClick={(e) => e.stopPropagation()}>
            <div className="chatbot-header">
              <span>{"\u{1F916}"} Insurance Assistant</span>
              <button className="icon-btn" onClick={() => setShowChat(false)}>{"\u2715"}</button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chatbot-msg ${msg.from}`}>
                  {msg.from === "bot" && <span className="chatbot-avatar">{"\u{1F916}"}</span>}
                  <div className="chatbot-bubble">{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="chatbot-input-row">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                placeholder="Ask about insurance..."
              />
              <button className="btn solid sm" onClick={handleChatSend}>{"\u27A4"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="ins-tabs">
        {[
          { key: "overview", label: "Overview" },
          { key: "coverage", label: "Coverage" },
          { key: "parking", label: "Parking" },
          { key: "claims", label: "Claims" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`ins-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Policy Summary */}
          <Card className="ins-hero-card">
            <div className="ins-hero-top">
              <div>
                <span className="ins-provider">{insuranceData.provider}</span>
                <h3>Auto Insurance Policy</h3>
                <p className="muted">Renewal: {insuranceData.renewalDate}</p>
              </div>
              <div className="ins-status-badge active">Active</div>
            </div>
          </Card>

          {/* Premium Comparison */}
          <Card title={"\u{1F4B0} Premium & Discounts"}>
            <div className="ins-premium-compare">
              <div className="ins-premium-box current">
                <span className="ins-premium-label">Current Annual</span>
                <span className="ins-premium-val">{"\u20AC"}{insuranceData.currentPremium}</span>
                <span className="muted">{"\u20AC"}{(insuranceData.currentPremium / 12).toFixed(0)}/month</span>
              </div>
              <div className="ins-premium-arrow">{"\u2192"}</div>
              <div className="ins-premium-box potential">
                <span className="ins-premium-label">With PT Usage</span>
                <span className="ins-premium-val">{"\u20AC"}{insuranceData.potentialPremium}</span>
                <span className="green-text">{insuranceData.discountPercent}% off</span>
              </div>
            </div>
            <div className="ins-discount-note">
              {"\u{1F4A1}"} {insuranceData.nudge}
            </div>
          </Card>

          {/* How It Works */}
          <Card title={"\u{1F4CB} How PT Discount Works"}>
            <div className="ins-steps">
              <div className="ins-step">
                <span className="ins-step-num">1</span>
                <div>
                  <strong>Use public transport</strong>
                  <p className="muted">Take PT {insuranceData.ptDaysRequired}+ days per week</p>
                </div>
              </div>
              <div className="ins-step">
                <span className="ins-step-num">2</span>
                <div>
                  <strong>Reduce driving km</strong>
                  <p className="muted">Less time on road = lower risk</p>
                </div>
              </div>
              <div className="ins-step">
                <span className="ins-step-num">3</span>
                <div>
                  <strong>Get rewarded</strong>
                  <p className="muted">Up to {insuranceData.discountPercent}% premium reduction</p>
                </div>
              </div>
            </div>
          </Card>

          {/* True Cost Widget */}
          <Card title={"\u{1F9EE} True Cost of Driving"}>
            <div className="ins-true-cost">
              <div className="ins-cost-item">
                <span>Monthly fuel</span>
                <strong>{"\u20AC"}{trueCostData.actual.items[0].amount}</strong>
              </div>
              <div className="ins-cost-item">
                <span>Insurance</span>
                <strong>{"\u20AC"}{trueCostData.actual.items[1].amount}</strong>
              </div>
              <div className="ins-cost-item">
                <span>Parking</span>
                <strong>{"\u20AC"}{trueCostData.actual.items[4].amount}</strong>
              </div>
              <div className="ins-cost-item">
                <span>Depreciation</span>
                <strong>{"\u20AC"}{trueCostData.actual.items[2].amount}</strong>
              </div>
              <div className="ins-cost-item total">
                <span>Total monthly cost</span>
                <strong>{"\u20AC"}{trueCostData.actual.total}</strong>
              </div>
            </div>
            <div className="ins-savings-cta">
              <p>Switch to MoveWise bundle: <strong className="green-text">{"\u20AC"}{trueCostData.ptAlternative.amount}/mo</strong></p>
              <p className="green-text">Save {"\u20AC"}{trueCostData.savings}/month = {"\u20AC"}{trueCostData.savings * 12}/year!</p>
            </div>
          </Card>

          <div className="btn-row center">
            <button className="btn ghost" onClick={() => onFeedback("Policy document opened")}>View Full Policy</button>
            <button className="btn solid" onClick={() => onFeedback("Insurance quote started")}>Get Discount Quote</button>
          </div>
        </>
      )}

      {activeTab === "coverage" && (
        <>
          <Card className="coverage-summary-card">
            <div className="coverage-premium-row">
              <div>
                <span className="muted">Estimated Monthly Premium</span>
                <h3 className="coverage-premium-val">{"\u20AC"}{monthlyPremium}/mo</h3>
              </div>
              <div className="coverage-count">{includedCount}/{coverages.length} active</div>
            </div>
            <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              Tap optional coverages to add or remove. Price adjusts in real-time.
            </p>
          </Card>
          {coverages.map((c) => (
            <Card key={c.id} className={`coverage-card${c.included ? " included" : ""}${c.mandatory ? " mandatory" : ""}`} onClick={() => toggleCoverage(c.id)}>
              <div className="coverage-row">
                <span className="coverage-icon">{c.icon}</span>
                <div className="coverage-info">
                  <strong>{c.name}</strong>
                  <p className="muted">{c.desc}</p>
                  {c.mandatory ? (
                    <span className="coverage-price mandatory-label">Included in base</span>
                  ) : (
                    <span className="coverage-price">+{"\u20AC"}{c.price}/mo</span>
                  )}
                </div>
                <span className={`coverage-toggle${c.included ? " on" : ""}${c.mandatory ? " locked" : ""}`}>
                  {c.mandatory ? "\u{1F512}" : c.included ? "\u2713" : "+"}
                </span>
              </div>
            </Card>
          ))}
        </>
      )}

      {activeTab === "parking" && (
        <>
          <Card>
            <p className="muted" style={{ marginBottom: 8 }}>
              Nearby parking options along your Caselle {"\u2192"} Orbassano corridor.
            </p>
          </Card>
          {parkingSpots.map((p, i) => (
            <Card key={i} className="parking-card">
              <div className="parking-head">
                <div>
                  <strong>{"\u{1F17F}\uFE0F"} {p.name}</strong>
                  <p className="muted">{p.type} {"\u2022"} {p.distance}</p>
                </div>
                <span className="parking-price">{p.price}</span>
              </div>
              <div className="parking-meta">
                <span className="parking-spots">{"\u{1F697}"} {p.spots} spots available</span>
                <button className="btn solid sm" onClick={() => onFeedback(`Navigating to ${p.name}`)}>Navigate</button>
              </div>
            </Card>
          ))}
          <Card title={"\u26FD Fuel Prices Nearby"}>
            <div className="fuel-list">
              <div className="fuel-row">
                <span>{"\u26FD"} <strong>IP Via Torino</strong></span>
                <span>{"\u20AC"}1.72/L</span>
              </div>
              <div className="fuel-row">
                <span>{"\u26FD"} <strong>Eni Orbassano</strong></span>
                <span>{"\u20AC"}1.78/L</span>
              </div>
              <div className="fuel-row">
                <span>{"\u26FD"} <strong>Q8 Caselle</strong></span>
                <span>{"\u20AC"}1.75/L</span>
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === "claims" && (
        <>
          <Card className="claims-empty">
            <div className="claims-empty-content">
              <span className="claims-icon">{"\u2705"}</span>
              <h3>No Active Claims</h3>
              <p className="muted">You have no pending or recent claims. That's great!</p>
              <button className="btn solid" onClick={() => onFeedback("New claim form opened")} style={{ marginTop: 12 }}>
                File a New Claim
              </button>
            </div>
          </Card>
          <Card title={"\u{1F4DE} Emergency Contacts"}>
            <div className="emergency-contacts">
              <div className="emg-row">
                <span>{"\u{1F6E0}\uFE0F"}</span>
                <div>
                  <strong>Roadside Assistance</strong>
                  <p className="muted">+39 800 123 456 (24/7)</p>
                </div>
              </div>
              <div className="emg-row">
                <span>{"\u{1F3E5}"}</span>
                <div>
                  <strong>Emergency Services</strong>
                  <p className="muted">112</p>
                </div>
              </div>
              <div className="emg-row">
                <span>{"\u{1F4DE}"}</span>
                <div>
                  <strong>{insuranceData.provider} Claims</strong>
                  <p className="muted">+39 800 234 567</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
