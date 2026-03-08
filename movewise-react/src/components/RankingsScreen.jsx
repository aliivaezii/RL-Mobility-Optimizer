import { useState, Suspense } from "react";
import Card from "./ui/Card";
import { leaderboard, challenges, badges, userProfile, carbonData } from "../data/mockData";
import TrophyScene from "./three/TrophyScene";
import EmissionsSkyline from "./three/EmissionsSkyline";

export default function RankingsScreen({ onNavigate, onFeedback }) {
  const [trophySpin, setTrophySpin] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const rewardsCatalog = [
    { name: "GTT Monthly Pass \u2014 10% Off", cost: 500, icon: "\u{1F68C}" },
    { name: "Free E-Scooter Ride (30 min)", cost: 200, icon: "\u{1F6F4}" },
    { name: "Campus Caf\u00E9 \u20AC5 Voucher", cost: 350, icon: "\u2615" },
    { name: "ToBike Weekly Pass", cost: 300, icon: "\u{1F6B2}" },
    { name: "Cinema Ticket \u2014 50% Off", cost: 450, icon: "\u{1F3AC}" },
    { name: "Tree Planted In Your Name", cost: 1000, icon: "\u{1F333}" },
  ];

  const handleRedeem = () => {
    setTrophySpin(true);
    onFeedback("Points redeemed! Check rewards.");
    setTimeout(() => setTrophySpin(false), 2000);
  };

  return (
    <>
      <header className="header-gradient compact">
        <button className="icon-btn" onClick={() => onNavigate("home")}>{"\u2190"}</button>
        <div className="brand"><span>{"\u{1F3C6}"}</span><span>Rewards & Rankings</span></div>
        <button className="icon-btn" onClick={() => setShowRewards(!showRewards)}>{"\u{1F381}"}</button>
      </header>

      {/* Rewards Catalog Panel */}
      {showRewards && (
        <Card className="rewards-catalog-card">
          <div className="rewards-catalog-header">
            <h3>{"\u{1F381}"} Rewards Catalog</h3>
            <span className="rewards-balance">{userProfile.greenScore} pts available</span>
          </div>
          <div className="rewards-list">
            {rewardsCatalog.map((r, i) => (
              <div key={i} className="reward-item">
                <span className="reward-icon">{r.icon}</span>
                <div className="reward-info">
                  <strong>{r.name}</strong>
                  <span className="reward-cost">{r.cost} pts</span>
                </div>
                <button
                  className={`btn sm ${userProfile.greenScore >= r.cost ? "solid" : "ghost"}`}
                  disabled={userProfile.greenScore < r.cost}
                  onClick={() => onFeedback(`Redeemed: ${r.name}`)}
                >
                  {userProfile.greenScore >= r.cost ? "Redeem" : "Locked"}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3D Trophy */}
      <Card className="trophy-3d-card">
        <Suspense fallback={null}>
          <TrophyScene spinning={trophySpin} />
        </Suspense>
      </Card>

      {/* Progress Overview */}
      <Card className="progress-hero">
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-val">{userProfile.greenScore}</span>
            <span className="hero-lbl">Points</span>
          </div>
          <div className="hero-stat fire">
            <span className="hero-val">{"\u{1F525}"} {userProfile.streak}</span>
            <span className="hero-lbl">Day Streak</span>
          </div>
          <div className="hero-stat">
            <span className="hero-val">{userProfile.totalCO2Saved} kg</span>
            <span className="hero-lbl">CO{"\u2082"} Saved</span>
          </div>
        </div>
        <div className="hero-note">
          You saved more CO{"\u2082"} than <strong>73%</strong> of users this month! {"\u{1F389}"}
        </div>
      </Card>

      {/* Active Challenges */}
      <div className="section-head"><h3>{"\u{1F3AF}"} Active Challenges</h3></div>
      {challenges.map((ch) => (
        <Card key={ch.id} className="challenge-card">
          <div className="ch-head">
            <span className="ch-icon">{ch.icon}</span>
            <div>
              <strong>{ch.title}</strong>
              {ch.desc && <span className="muted ch-desc">{ch.desc}</span>}
              <span className="ch-reward">Reward: {ch.reward}</span>
            </div>
          </div>
          <div className="ch-progress">
            <div className="ch-bar">
              <div className="ch-fill" style={{ width: `${(ch.progress / ch.total) * 100}%` }} />
            </div>
            <span className="ch-count">{ch.progress}/{ch.total}</span>
          </div>
        </Card>
      ))}

      {/* Badges */}
      <div className="section-head"><h3>{"\u{1F3C5}"} Badges Collection</h3></div>
      <Card className="badges-card">
        <div className="badges-grid">
          {badges.map((b) => (
            <div key={b.id} className={`badge-item${b.earned ? " earned" : " locked"}`}>
              <span className="badge-icon">{b.icon}</span>
              <span className="badge-name">{b.name}</span>
              {!b.earned && <span className="badge-lock">{"\u{1F512}"}</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Leaderboard */}
      <div className="section-head"><h3>{"\u{1F4CA}"} Corridor Leaderboard</h3></div>
      <Card className="lb-card">
        {leaderboard.map((item) => (
          <div key={item.rank} className={`lb-row${item.isUser ? " me" : ""}`}>
            <span className="lb-rank">{item.avatar}</span>
            <div className="lb-info">
              <strong>{item.name}</strong>
              <span className="muted">{item.co2} CO{"\u2082"} saved</span>
            </div>
            <span className="lb-score">{item.score} pts</span>
          </div>
        ))}
      </Card>

      {/* 3D Emissions Skyline */}
      <div className="section-head"><h3>{"\u{1F30D}"} Carbon Emissions Skyline</h3></div>
      <Card className="skyline-card">
        <Suspense fallback={null}>
          <EmissionsSkyline data={carbonData.breakdown} />
        </Suspense>
        <div className="skyline-legend">
          {carbonData.breakdown.map((item, i) => (
            <span key={i} className="skyline-label">
              <span className="legend-dot" style={{ background: item.color }} />
              {item.mode}: {item.co2} kg
            </span>
          ))}
        </div>
      </Card>

      {/* Carbon Budget Snapshot */}
      <Card className="carbon-snap" title={"\u{1F30D} Monthly Carbon Impact"}>
        <div className="carbon-ring-wrap">
          <svg viewBox="0 0 100 100" className="carbon-ring">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#greenGrad)" strokeWidth="8"
              strokeDasharray={`${(42 / 100) * 251} 251`}
              strokeLinecap="round" transform="rotate(-90 50 50)" />
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22783c" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>
          </svg>
          <div className="carbon-center">
            <strong>42 kg</strong>
            <span>CO{"\u2082"} saved</span>
          </div>
        </div>
        <p className="muted center-text">Estimated yearly savings: <strong>310 kg CO{"\u2082"}</strong></p>
      </Card>

      <div className="btn-row center">
        <button className="btn solid" onClick={handleRedeem}>Redeem Points {"\u{1F381}"}</button>
      </div>
    </>
  );
}
