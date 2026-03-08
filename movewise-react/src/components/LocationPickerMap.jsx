import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";

const TORINO_CENTER = [45.07, 7.59];
const DEFAULT_ZOOM = 11;

const greenIcon = L.divIcon({
  className: "lpm-marker-green",
  html: '<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const blueIcon = L.divIcon({
  className: "lpm-marker-blue",
  html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`;
  return fetch(url)
    .then((r) => r.json())
    .then((data) => {
      const a = data.address || {};
      return a.village || a.town || a.city_district || a.suburb || a.city || data.display_name?.split(",")[0] || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    })
    .catch(() => `${lat.toFixed(3)}, ${lng.toFixed(3)}`);
}

export default function LocationPickerMap({ onFromChange, onToChange, accentColor = "#22c55e", className = "" }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const fromMarker = useRef(null);
  const toMarker = useRef(null);
  const [pickMode, setPickMode] = useState("from");
  const [expanded, setExpanded] = useState(false);
  const [fromName, setFromName] = useState(null);
  const [toName, setToName] = useState(null);

  const handleMapClick = useCallback(
    (e) => {
      const { lat, lng } = e.latlng;
      const map = mapInstance.current;
      if (!map) return;

      if (pickMode === "from") {
        if (fromMarker.current) map.removeLayer(fromMarker.current);
        fromMarker.current = L.marker([lat, lng], { icon: greenIcon }).addTo(map);
        reverseGeocode(lat, lng).then((name) => {
          setFromName(name);
          onFromChange(name);
        });
        setPickMode("to");
      } else {
        if (toMarker.current) map.removeLayer(toMarker.current);
        toMarker.current = L.marker([lat, lng], { icon: blueIcon }).addTo(map);
        reverseGeocode(lat, lng).then((name) => {
          setToName(name);
          onToChange(name);
        });
        setPickMode("from");
      }
    },
    [pickMode, onFromChange, onToChange]
  );

  const clickRef = useRef(handleMapClick);
  clickRef.current = handleMapClick;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(TORINO_CENTER, DEFAULT_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
    map.on("click", (e) => clickRef.current(e));
    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => mapInstance.current.invalidateSize(), 60);
    }
  }, [expanded]);

  const openMap = () => {
    if (!expanded) setExpanded(true);
  };

  const handleDone = (e) => {
    e.stopPropagation();
    setExpanded(false);
  };

  return (
    <div
      className={`location-picker-wrap ${expanded ? "lp-expanded" : ""} ${className}`}
      onClick={openMap}
    >
      <div ref={mapRef} className="location-picker-map" />

      {/* Status chips when expanded */}
      {expanded && (
        <div className="lp-status-bar">
          <span className={`lp-chip ${fromName ? "set" : ""} ${pickMode === "from" ? "active" : ""}`}>
            <span className="lp-dot green" />
            {fromName || "Tap origin"}
          </span>
          <span className={`lp-chip ${toName ? "set" : ""} ${pickMode === "to" ? "active" : ""}`}>
            <span className="lp-dot blue" />
            {toName || "Tap destination"}
          </span>
        </div>
      )}

      {/* Collapsed hint */}
      {!expanded && (
        <div className="lp-pick-hint" style={{ borderColor: accentColor }}>
          <span className="lp-dot green" />
          {"\u{1F4CD}"} Pick on map
        </div>
      )}

      {/* Done button */}
      {expanded && (
        <button className="lp-done-btn" style={{ background: accentColor }} onClick={handleDone}>
          {"\u2713"} Done
        </button>
      )}
    </div>
  );
}
