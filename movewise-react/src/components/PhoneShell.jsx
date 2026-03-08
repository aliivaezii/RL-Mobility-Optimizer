import BottomNav from "./BottomNav";

export default function PhoneShell({ activeTab, onTabChange, showSplash, overlay, children }) {
  return (
    <main className="stage">
      <div className={`phone${showSplash ? " splash-mode" : ""}`}>
        {!showSplash && <div className="notch" />}
        <div className={showSplash ? "screen splash-screen" : "screen"}>{children}</div>
        {!showSplash && <BottomNav active={activeTab} onChange={onTabChange} />}
        {overlay}
      </div>
    </main>
  );
}
