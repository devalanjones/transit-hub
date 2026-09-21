import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import FormattedTime from "../common/FormattedTime";

// Auto-fit map camera bounds to include the entire snapped route or stops
const MapAutoBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [45, 45] });
    }
  }, [positions, map]);

  return null;
};

// Custom Stop & Terminal Marker Icons
const createStopIcon = (sequence, isFirst, isLast) => {
  // First Stop: Green bus icon badge (Departure)
  if (isFirst) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="
          background-color: #16a34a;
          color: white;
          border: 2px solid white;
          border-radius: 8px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          font-size: 11px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          white-space: nowrap;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6" />
            <path d="M15 6v6" />
            <path d="M2 12h19.6" />
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.2 6H5.8C4.8 6 3.9 6.8 3.6 7.8L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
          </svg>
          <span>DEP</span>
        </div>
      `,
      iconSize: [60, 28],
      iconAnchor: [30, 14],
      popupAnchor: [0, -16],
    });
  }

  // Last Stop: Red checkered flag badge (Arrival / Destination)
  if (isLast) {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="
          background-color: #dc2626;
          color: white;
          border: 2px solid white;
          border-radius: 8px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          font-size: 11px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          white-space: nowrap;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <span>ARR</span>
        </div>
      `,
      iconSize: [60, 28],
      iconAnchor: [30, 14],
      popupAnchor: [0, -16],
    });
  }

  // Intermediate Stops: Numbered circular badges
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: #2563eb;
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        ${sequence}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

const ScheduleMap = ({ stops = [] }) => {
  const [roadPolyline, setRoadPolyline] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Parse and validate latitude/longitude pairs
  const validStops = stops
    .map((item) => {
      const stopData = item.stopId || {};
      let lat = null;
      let lng = null;

      if (stopData.location?.coordinates) {
        [lng, lat] = stopData.location.coordinates;
      } else if (stopData.lat && stopData.lng) {
        lat = stopData.lat;
        lng = stopData.lng;
      } else if (stopData.latitude && stopData.longitude) {
        lat = stopData.latitude;
        lng = stopData.longitude;
      }

      return {
        ...item,
        lat: Number(lat),
        lng: Number(lng),
      };
    })
    .filter(
      (s) => !isNaN(s.lat) && !isNaN(s.lng) && s.lat !== 0 && s.lng !== 0,
    );

  // Query OSRM to snap polyline paths to real driving roads
  useEffect(() => {
    if (validStops.length < 2) {
      setRoadPolyline([]);
      return;
    }

    const fetchRoadRoute = async () => {
      setIsLoadingRoute(true);
      try {
        // OSRM coordinates require "longitude,latitude" format separated by semicolons
        const coordinateString = validStops
          .map((s) => `${s.lng},${s.lat}`)
          .join(";");

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson`,
        );
        const data = await response.json();

        if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
          // OSRM returns [lng, lat], convert back to Leaflet format [lat, lng]
          const mappedRoute = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng],
          );
          setRoadPolyline(mappedRoute);
        } else {
          // Fallback to straight points if routing fails
          setRoadPolyline(validStops.map((s) => [s.lat, s.lng]));
        }
      } catch (err) {
        console.error("Failed to fetch road snapped geometry:", err);
        setRoadPolyline(validStops.map((s) => [s.lat, s.lng]));
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoadRoute();
  }, [stops]);

  if (validStops.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        No valid geographical coordinates found for these stops.
      </div>
    );
  }

  const directPoints = validStops.map((s) => [s.lat, s.lng]);
  const activePolyline = roadPolyline.length > 0 ? roadPolyline : directPoints;

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {isLoadingRoute && (
        <div className="absolute top-2 right-2 z-[1000] rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-600 shadow">
          Tracing road path...
        </div>
      )}

      <MapContainer
        center={directPoints[0]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-96 w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Road-snapped path */}
        <Polyline
          positions={activePolyline}
          pathOptions={{
            color: "#2563eb",
            weight: 5,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          }}
        />

        {/* Stop Markers */}
        {validStops.map((stop, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === validStops.length - 1;

          return (
            <Marker
              key={`${stop.stopId?._id || idx}-${stop.stopSequence}`}
              position={[stop.lat, stop.lng]}
              icon={createStopIcon(stop.stopSequence, isFirst, isLast)}
            >
              <Popup>
                <div className="p-1">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <span className="text-xs text-gray-400">
                      #{stop.stopSequence}
                    </span>
                    <span>{stop.stopId?.stopName || "Stop"}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {isFirst ? "Departure Time: " : "Expected Arrival: "}
                    <FormattedTime
                      value={stop.expectedArrivalTime}
                      fallback="N/A"
                      className="font-semibold text-blue-600"
                    />
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapAutoBounds positions={activePolyline} />
      </MapContainer>
    </div>
  );
};

export default ScheduleMap;
