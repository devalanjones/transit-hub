import { useState, useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationPickerMap = ({ latitude, longitude, onLocationChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef(null);

  const currentCenter = useMemo(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      return [latitude, longitude];
    }
    return [28.6139, 77.209]; // Default coordinates (e.g., New Delhi)
  }, [latitude, longitude]);

  // Reverse geocoding when user clicks or drags pin
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      return (
        data.display_name?.split(",").slice(0, 2).join(",") || "Selected Stop"
      );
    } catch {
      return "";
    }
  };

  const handleManualSelect = async (lat, lng) => {
    const suggestedName = await fetchAddress(lat, lng);
    onLocationChange({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      stopName: suggestedName,
    });
  };

  // Debounced search suggestions fetcher
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();
    setLoadingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery,
          )}&limit=5&addressdetails=1`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowDropdown(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const stopName = item.display_name.split(",").slice(0, 2).join(",");

    setSearchQuery(item.display_name);
    setShowDropdown(false);

    onLocationChange({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lon.toFixed(6)),
      stopName,
    });
  };

  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        const position = marker.getLatLng();
        handleManualSelect(position.lat, position.lng);
      },
    }),
    [],
  );

  return (
    <div className="space-y-2">
      {/* Search Input with Auto-complete Dropdown */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search landmark, street, or area..."
            className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {loadingSuggestions && (
            <div className="absolute right-3 top-2.5">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          )}
        </div>

        {/* Suggestions Menu */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-[1000] mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            {suggestions.map((item) => (
              <li
                key={item.place_id}
                onClick={() => handleSelectSuggestion(item)}
                className="cursor-pointer px-3 py-2 text-xs text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <p className="font-semibold text-gray-900">
                  {item.display_name.split(",")[0]}
                </p>
                <p className="truncate text-gray-500">{item.display_name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Interactive Map */}
      <div className="h-[380px] w-full overflow-hidden rounded-lg border border-gray-300">
        <MapContainer
          center={currentCenter}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={currentCenter} />
          <MapClickHandler onSelectLocation={handleManualSelect} />

          {typeof latitude === "number" && typeof longitude === "number" && (
            <Marker
              position={[latitude, longitude]}
              draggable={true}
              eventHandlers={eventHandlers}
            >
              <Popup>Drag pin or click map to reposition.</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        Tip: Type 3+ characters to view suggestions, or click anywhere on the
        map to place the marker.
      </p>
    </div>
  );
};

export default LocationPickerMap;
