export default function NudgeBanner({ icon, text }) {
  return (
    <div className="nudge-banner">
      <span className="nudge-icon">{icon}</span>
      <p className="nudge-text" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
    </div>
  );
}
