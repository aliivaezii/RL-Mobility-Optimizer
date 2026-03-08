import { useEffect, useMemo, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import PhoneShell from "./components/PhoneShell";
import HomeScreen from "./components/HomeScreen";
import TripsScreen from "./components/TripsScreen";
import PayScreen from "./components/PayScreen";
import RankingsScreen from "./components/RankingsScreen";
import ProfileScreen from "./components/ProfileScreen";
import UserProfileScreen from "./components/UserProfileScreen";
import InsuranceScreen from "./components/InsuranceScreen";
import CarpoolScreen from "./components/CarpoolScreen";
import ConsentPrompt from "./components/ConsentPrompt";
import OnboardingTutorial from "./components/OnboardingTutorial";

const CONSENT_KEY = "movewise_consent";
const ONBOARDING_KEY = "movewise_onboarded";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasConsent, setHasConsent] = useState(() => localStorage.getItem(CONSENT_KEY) === "true");
  const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem(ONBOARDING_KEY) === "true");
  const [activeTab, setActiveTab] = useState("home");
  const [insuranceInitTab, setInsuranceInitTab] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleConsent = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setHasConsent(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasOnboarded(true);
  };

  const handleNavigate = (tab) => {
    if (tab === "insurance_parking") {
      setInsuranceInitTab("parking");
      setActiveTab("insurance");
    } else {
      setInsuranceInitTab(null);
      setActiveTab(tab);
    }
  };

  const screen = useMemo(() => {
    const props = {
      onNavigate: handleNavigate,
      onFeedback: (msg) => setToast(msg),
    };
    switch (activeTab) {
      case "trips":       return <TripsScreen {...props} />;
      case "pay":         return <PayScreen {...props} />;
      case "rankings":    return <RankingsScreen {...props} />;
      case "profile":     return <ProfileScreen {...props} />;
      case "userprofile": return <UserProfileScreen {...props} />;
      case "insurance":   return <InsuranceScreen {...props} initialTab={insuranceInitTab} />;
      case "carpool":     return <CarpoolScreen {...props} />;
      default:            return <HomeScreen {...props} />;
    }
  }, [activeTab, insuranceInitTab]);

  // Consent prompt shown first, before anything else
  if (!hasConsent) {
    return (
      <PhoneShell activeTab={activeTab} onTabChange={handleNavigate} showSplash={true}>
        <ConsentPrompt onAccept={handleConsent} />
      </PhoneShell>
    );
  }

  // Splash screen
  if (showSplash) {
    return (
      <PhoneShell activeTab={activeTab} onTabChange={handleNavigate} showSplash={true}>
        <SplashScreen />
      </PhoneShell>
    );
  }

  // Onboarding tutorial as overlay on the actual app
  const tutorialOverlay = !hasOnboarded ? (
    <OnboardingTutorial onComplete={handleOnboardingComplete} />
  ) : null;

  return (
    <>
      <PhoneShell activeTab={activeTab} onTabChange={handleNavigate} showSplash={false} overlay={tutorialOverlay}>
        {screen}
      </PhoneShell>
      {toast && (
        <div className={`toast show`} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
