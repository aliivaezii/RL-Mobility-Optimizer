import { Suspense } from "react";
import CityFlyIn from "./three/CityFlyIn";

export default function SplashScreen() {
  return (
    <div className="splash-wrap-inner">
      <div className="splash-3d">
        <Suspense fallback={null}>
          <CityFlyIn />
        </Suspense>
      </div>
      <div className="splash-content">
        <img src="logo.jpg" alt="MoveWise" className="splash-logo" />
        <h1 className="splash-title">MoveWise</h1>
        <p className="splash-subtitle">RL-Powered MaaS Super-App</p>
        <div className="splash-loader">
          <span />
        </div>
      </div>
    </div>
  );
}
