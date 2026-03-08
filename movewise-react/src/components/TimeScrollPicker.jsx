import { useState, useRef, useEffect, useCallback } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const ITEM_H = 38;

function WheelColumn({ items, selected, onChange }) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);

  const idx = items.indexOf(selected);

  useEffect(() => {
    if (ref.current && !isDragging.current) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  }, [idx]);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const i = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(i, items.length - 1));
    if (items[clamped] !== selected) onChange(items[clamped]);
  }, [items, selected, onChange]);

  const onTouchStart = (e) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    startScroll.current = ref.current.scrollTop;
  };
  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const dy = startY.current - e.touches[0].clientY;
    ref.current.scrollTop = startScroll.current + dy;
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    if (!ref.current) return;
    const i = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(i, items.length - 1));
    ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    onChange(items[clamped]);
  };

  return (
    <div className="tsp-column">
      <div
        ref={ref}
        className="tsp-scroll"
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="tsp-spacer" />
        {items.map((item) => (
          <div
            key={item}
            className={`tsp-item ${item === selected ? "active" : ""}`}
            onClick={() => {
              onChange(item);
              ref.current?.scrollTo({ top: items.indexOf(item) * ITEM_H, behavior: "smooth" });
            }}
          >
            {item}
          </div>
        ))}
        <div className="tsp-spacer" />
      </div>
    </div>
  );
}

export default function TimeScrollPicker({ value = "07:30", onChange, accentColor = "#22c55e" }) {
  const [open, setOpen] = useState(false);
  const [h, m] = value.split(":");
  const hour = HOURS.includes(h) ? h : "07";
  const closestMin = MINUTES.reduce((a, b) => (Math.abs(parseInt(b) - parseInt(m)) < Math.abs(parseInt(a) - parseInt(m)) ? b : a));
  const minute = closestMin;

  const setHour = (v) => onChange(`${v}:${minute}`);
  const setMinute = (v) => onChange(`${hour}:${v}`);

  return (
    <>
      <button className="tsp-trigger" onClick={() => setOpen(true)} type="button">
        <span className="tsp-trigger-icon">{"\u{1F552}"}</span>
        <span className="tsp-trigger-time">{hour}:{minute}</span>
      </button>

      {open && (
        <div className="tsp-overlay" onClick={() => setOpen(false)}>
          <div className="tsp-popup" onClick={(e) => e.stopPropagation()}>
            <div className="tsp-header">
              <span>Select Time</span>
              <button className="tsp-done" style={{ color: accentColor }} onClick={() => setOpen(false)}>Done</button>
            </div>
            <div className="tsp-wheels">
              <WheelColumn items={HOURS} selected={hour} onChange={setHour} />
              <div className="tsp-colon">:</div>
              <WheelColumn items={MINUTES} selected={minute} onChange={setMinute} />
            </div>
            <div className="tsp-highlight" style={{ borderColor: accentColor }} />
          </div>
        </div>
      )}
    </>
  );
}
