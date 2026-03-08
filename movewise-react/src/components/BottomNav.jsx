import { navItems } from "../data/mockData";

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`nav-btn${active === item.key ? " active" : ""}`}
          onClick={() => onChange(item.key)}
          aria-current={active === item.key ? "page" : undefined}
        >
          <span className="nav-ic">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
