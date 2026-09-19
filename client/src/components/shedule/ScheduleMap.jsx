import React, { useEffect } from "react";
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

// Auto-fit map camera bounds to include all stops
const MapAutoBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);

  return null;
};

// Create custom circular badge markers for sequence numbers
const createStopIcon = (sequence, isFirst, isLast) => {
  let bgColor = "#2563eb"; // Blue for mid-stops
  if (isFirst) bgColor = "#16a34a"; // Green for start
  if (isLast) bgColor = "#dc2626"; // Red for terminus

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
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
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const ScheduleMap = ({ stops = [] }) => {
  // Extract coordinate pairs: handles both { lat, lng } and GeoJSON coordinates [lng, lat]
  const validStops = stops
    .map((item) => {
      const stopData = item.stopId || {};
      let lat = null;
      let lng = null;

      if (stopData.location?.coordinates) {
        // GeoJSON format: [longitude, latitude]
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

  if (validStops.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        No valid geographical coordinates found for these stops.
      </div>
    );
  }

  const polylineCoords = validStops.map((s) => [s.lat, s.lng]);
  const defaultCenter = polylineCoords[0];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-96 w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Path */}
        <Polyline
          positions={polylineCoords}
          pathOptions={{
            color: "#2563eb",
            weight: 4,
            opacity: 0.8,
            dashArray: "6, 6",
          }}
        />

        {/* Sequential Stop Badges */}
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
                  <p className="font-semibold text-gray-800">
                    {stop.stopSequence}. {stop.stopId?.stopName || "Stop"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Expected Arrival:{" "}
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

        <MapAutoBounds positions={polylineCoords} />
      </MapContainer>
    </div>
  );
};

export default ScheduleMap;
