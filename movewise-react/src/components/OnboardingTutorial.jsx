import { useState, Suspense } from "react";
import TutorBot from "./three/TutorBot";

/* Parse **bold** markers in text into <strong> elements */
function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

const tutorialSteps = [
  {
    title: "Welcome to MoveWise!",
    text: "I'm **Movi**, your personal mobility assistant! MoveWise is your **all-in-one sustainable commuting app** designed for the Torino metropolitan area. I'll guide you through every feature so you can save money, reduce emissions, and travel smarter from day one.",
    icon: "\u{1F44B}",
    wave: true,
    highlight: null,
  },
  {
    title: "Smart AI Recommendations",
    text: "MoveWise uses **intelligent learning** that adapts to your habits and preferences over time. The more you use the app, the **better it understands** what matters to you \u2014 whether that's saving time, cutting costs, or reducing your **carbon footprint**. It automatically ranks every route based on your personal priorities.",
    icon: "\u{1F9E0}",
    wave: false,
    highlight: "rl-agent",
  },
  {
    title: "Smart Route Planning",
    text: "Enter your **origin and destination** to discover multimodal routes across **4 smart tabs**: Best For You, Cheapest, Fastest, and Greenest. Each tab combines different transport modes \u2014 bus, train, e-scooter, bike, and more \u2014 so you always have the **best options** at your fingertips.",
    icon: "\u{1F5FA}\uFE0F",
    wave: false,
    highlight: "trips",
  },
  {
    title: "QR Tap-In / Tap-Out",
    text: "Pay for **all transport modes with a single QR code** \u2014 no more juggling apps or tickets. Simply scan at the start and end of each segment. Your **journey timeline** updates live so you can track every step, and payments are handled securely and automatically.",
    icon: "\u{1F4B3}",
    wave: false,
    highlight: "pay",
  },
  {
    title: "Your Adoption Journey",
    text: "MoveWise guides you through a **gradual transition** to sustainable mobility. Start with easy changes like **park & ride**, then progress to greener combos like e-scooter + train. Each phase is designed to **reduce your CO\u2082 emissions and costs** while keeping your commute comfortable.",
    icon: "\u{1F680}",
    wave: true,
    highlight: "journey",
  },
  {
    title: "Insurance & Savings",
    text: "Link your **auto insurance** and unlock real savings! Use public transport **3+ days per week** to qualify for up to a **15% premium reduction**. Our built-in insurance chatbot is always ready to answer questions about coverage, claims, and how to maximise your discount.",
    icon: "\u{1F6E1}\uFE0F",
    wave: false,
    highlight: "insurance",
  },
  {
    title: "Rewards & Gamification",
    text: "Earn **Green Points** for every eco-friendly trip you take. Climb the **community leaderboard**, complete weekly challenges, and unlock achievement badges. The more sustainable your choices, the more points you earn \u2014 and you can **redeem them for real rewards** like discounts and credits!",
    icon: "\u{1F3C6}",
    wave: true,
    highlight: "rankings",
  },
  {
    title: "Carpooling",
    text: "Find **fellow students** along your corridor and share rides to campus. MoveWise offers a **live map**, verified profiles, complete ride history, and **safety features** built in. Every shared ride saves approximately **2.1 kg of CO\u2082** \u2014 teamwork for the planet!",
    icon: "\u{1F697}",
    wave: false,
    highlight: "carpool",
  },
  {
    title: "You're All Set!",
    text: "Start exploring your **personalised routes** right now. Remember \u2014 every green trip counts towards a **cleaner campus and healthier city**. Together, we're building a more sustainable future for Torino. Let's go! \u{1F33F}",
    icon: "\u{1F389}",
    wave: true,
    highlight: null,
  },
];

export default function OnboardingTutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];
  const isLast = step === tutorialSteps.length - 1;
  const isFirst = step === 0;

  return (
    <div className="onb-overlay">
      {/* Dark blur backdrop */}
      <div className="onb-backdrop" />

      {/* Spotlight highlight */}
      {current.highlight && (
        <div className={`onb-spotlight ${current.highlight}`} />
      )}

      {/* Progress bar */}
      <div className="onb-progress-bar">
        <div className="onb-progress-fill" style={{ width: `${((step + 1) / tutorialSteps.length) * 100}%` }} />
      </div>

      {/* Skip button */}
      <button className="onb-skip" onClick={onComplete}>
        Skip {"\u00BB"}
      </button>

      {/* Step counter */}
      <div className="onb-step-count">{step + 1} / {tutorialSteps.length}</div>

      {/* Main content card */}
      <div className="onb-content-card">
        {/* 3D Robot */}
        <div className="onb-robot">
          <Suspense fallback={null}>
            <TutorBot wave={current.wave} />
          </Suspense>
        </div>

        {/* Speech bubble */}
        <div className="onb-bubble">
          <span className="onb-icon">{current.icon}</span>
          <h3>{current.title}</h3>
          <p>{renderText(current.text)}</p>
        </div>

        {/* Navigation dots */}
        <div className="onb-dots">
          {tutorialSteps.map((_, i) => (
            <span key={i} className={`onb-dot${i === step ? " active" : i < step ? " done" : ""}`} onClick={() => setStep(i)} />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="onb-nav">
          <button
            className="btn ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={isFirst}
            style={{ opacity: isFirst ? 0.3 : 1 }}
          >
            {"\u2190"} Previous
          </button>
          {isLast ? (
            <button className="btn solid" onClick={onComplete}>
              Get Started {"\u{1F680}"}
            </button>
          ) : (
            <button className="btn solid" onClick={() => setStep((s) => s + 1)}>
              Next {"\u2192"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
