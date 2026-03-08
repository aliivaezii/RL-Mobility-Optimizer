import { useState } from "react";

export default function ConsentPrompt({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  if (showTerms) {
    return (
      <div className="consent-overlay">
        <div className="consent-card legal-full">
          <div className="legal-header">
            <button className="icon-btn" onClick={() => setShowTerms(false)}>{"\u2190"}</button>
            <h2>Legal Terms & Privacy Policy</h2>
          </div>
          <div className="legal-scroll">
            <section className="legal-section">
              <h3>Article 1 — Definitions</h3>
              <p><strong>1.1</strong> "MoveWise" refers to the Mobility-as-a-Service (MaaS) platform operated for the NEXUS 2026 hackathon, Politecnico di Torino.</p>
              <p><strong>1.2</strong> "User" refers to any individual who registers for and uses the MoveWise application.</p>
              <p><strong>1.3</strong> "RL Agent" refers to the Reinforcement Learning-based optimisation engine that personalises route recommendations.</p>
              <p><strong>1.4</strong> "Service Providers" include GTT, Trenitalia, Voi, Lime, ToBike, and other integrated transport operators.</p>
            </section>

            <section className="legal-section">
              <h3>Article 2 — Terms of Service</h3>
              <p><strong>2.1</strong> By using MoveWise, you agree to these terms including route planning, QR-based payments, gamification, and multimodal transport integration.</p>
              <p><strong>2.2</strong> MoveWise provides AI-optimised route suggestions. Users remain responsible for their own travel decisions and safety.</p>
              <p><strong>2.3</strong> The gamification system (Green Points, leaderboards, challenges) is operated in good faith. Points have no monetary value.</p>
            </section>

            <section className="legal-section">
              <h3>Article 3 — Data Collection & Privacy (GDPR)</h3>
              <p><strong>3.1</strong> Data is processed in accordance with <strong>EU Regulation 2016/679 (GDPR)</strong> and Italian <em>D.Lgs. 196/2003</em> as amended by <em>D.Lgs. 101/2018</em>.</p>
              <p><strong>3.2</strong> We collect the following anonymised data:</p>
              <ul>
                <li>Location data for real-time route suggestions</li>
                <li>Travel behaviour patterns (mode choices, tap-in/tap-out times)</li>
                <li>Behavioural preferences for RL-based personalisation</li>
                <li>QR payment transaction records</li>
              </ul>
              <p><strong>3.3</strong> <em>Legal basis:</em> Consent (Art. 6(1)(a) GDPR) and legitimate interest for service improvement (Art. 6(1)(f) GDPR).</p>
              <p><strong>3.4</strong> Data retention period: 24 months from last activity, or until account deletion.</p>
            </section>

            <section className="legal-section">
              <h3>Article 4 — Your Rights</h3>
              <p>Under GDPR, you have the right to:</p>
              <ul>
                <li><strong>Access</strong> — Request a copy of your personal data (Art. 15)</li>
                <li><strong>Rectification</strong> — Correct inaccurate data (Art. 16)</li>
                <li><strong>Erasure</strong> — Request data deletion ("right to be forgotten") (Art. 17)</li>
                <li><strong>Portability</strong> — Export your data in machine-readable format (Art. 20)</li>
                <li><strong>Objection</strong> — Object to processing based on legitimate interest (Art. 21)</li>
                <li><strong>Withdraw consent</strong> — At any time, without affecting prior processing (Art. 7(3))</li>
              </ul>
              <p>Contact: <strong>privacy@movewise.app</strong> | DPO: dpo@movewise.app</p>
            </section>

            <section className="legal-section">
              <h3>Article 5 — Insurance Data Sharing</h3>
              <p><strong>5.1</strong> If you opt into insurance integration, anonymised PT usage data is shared with our insurance partner (UnipolSai) via IVASS-compliant intermediary.</p>
              <p><strong>5.2</strong> Shared data: Number of PT days per week, estimated driving reduction %. No personally identifiable information is transmitted.</p>
              <p><strong>5.3</strong> Purpose: Premium discount calculation based on reduced accident risk from lower driving frequency.</p>
            </section>

            <section className="legal-section">
              <h3>Article 6 — Carpooling Terms</h3>
              <p><strong>6.1</strong> MoveWise facilitates peer-to-peer ride matching among verified university students. MoveWise is not a transport operator.</p>
              <p><strong>6.2</strong> All carpool trips are covered by MoveWise platform insurance. Users must comply with Italian traffic regulations.</p>
            </section>
          </div>
          <button className="btn solid full consent-btn" onClick={() => setShowTerms(false)}>
            Back to Consent {"\u2190"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="consent-overlay">
      <div className="consent-card">
        <div className="consent-hero">
          <img src={`${import.meta.env.BASE_URL}assets/logo.jpg`} alt="MoveWise" className="consent-logo-img" />
          <h2>Welcome to MoveWise</h2>
          <p className="consent-sub">Your AI-powered sustainable mobility companion</p>
        </div>

        <div className="consent-badge-row">
          <span className="consent-badge">{"\u{1F30D}"} NEXUS 2026</span>
          <span className="consent-badge">{"\u{1F3DB}\uFE0F"} Politecnico di Torino</span>
        </div>

        <div className="consent-summary">
          <div className="consent-point">
            <div className="consent-point-circle">{"\u{1F4C4}"}</div>
            <div>
              <strong>Terms of Service</strong>
              <p>Route planning, QR payments, gamification, and multimodal transport integration</p>
            </div>
          </div>
          <div className="consent-point">
            <div className="consent-point-circle">{"\u{1F512}"}</div>
            <div>
              <strong>Privacy & Data (GDPR)</strong>
              <p>Anonymised mobility data for RL-based route optimisation. EU 2016/679 compliant.</p>
            </div>
          </div>
          <div className="consent-point">
            <div className="consent-point-circle">{"\u{1F6E1}\uFE0F"}</div>
            <div>
              <strong>Insurance Integration</strong>
              <p>Optional PT usage sharing for premium discounts with partner insurers</p>
            </div>
          </div>
        </div>

        <button className="consent-terms-link" onClick={() => setShowTerms(true)}>
          {"\u{1F4D6}"} Read Full Legal Terms & Privacy Policy
        </button>

        <label className="consent-check">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>I agree to the Terms of Service, Privacy Policy, and consent to data collection as described above.</span>
        </label>

        <button
          className="btn solid full consent-btn"
          disabled={!checked}
          onClick={onAccept}
        >
          Accept & Continue {"\u{1F33F}"}
        </button>

        <p className="consent-footer">
          {"\u{1F512}"} You can withdraw consent and delete your data at any time from Settings.
        </p>
      </div>
    </div>
  );
}
