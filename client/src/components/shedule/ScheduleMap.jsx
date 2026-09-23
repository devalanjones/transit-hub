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
const createStopIcon = (isFirst, isLast) => {
  const label = isFirst ? "DEP" : isLast ? "ARR" : "";

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="stop-marker-wrapper">

        ${label ? `<div class="stop-label">${label}</div>` : ""}

        <div class="pin-3d">
          <div class="pin-shadow"></div>

          <div class="pin-body">
            <div class="pin-highlight"></div>
            <div class="pin-hole"></div>
          </div>

      </div>
    `,
    iconSize: [70, 75],
    iconAnchor: [35, 68],
    popupAnchor: [0, -60],
  });
};

const ScheduleMap = ({
  stops = [],
  routeGeometry,
}) => {
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
      (s) =>
        !isNaN(s.lat) &&
        !isNaN(s.lng) &&
        s.lat !== 0 &&
        s.lng !== 0,
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
        const coordinateString = validStops
          .map((s) => `${s.lng},${s.lat}`)
          .join(";");

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson`,
        );

        const data = await response.json();

        if (
          data.code === "Ok" &&
          data.routes?.[0]?.geometry?.coordinates
        ) {
          const mappedRoute =
            data.routes[0].geometry.coordinates.map(
              ([lng, lat]) => [lat, lng],
            );

          setRoadPolyline(mappedRoute);
        } else {
          setRoadPolyline(
            validStops.map((s) => [s.lat, s.lng]),
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch road snapped geometry:",
          err,
        );

        setRoadPolyline(
          validStops.map((s) => [s.lat, s.lng]),
        );
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

  const directPoints = validStops.map((s) => [
    s.lat,
    s.lng,
  ]);

  const activePolyline =
    roadPolyline.length > 0
      ? roadPolyline
      : directPoints;

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
          const isLast =
            idx === validStops.length - 1;

          return (
            <Marker
              key={`${stop.stopId?._id || idx}-${stop.stopSequence}`}
              position={[stop.lat, stop.lng]}
              icon={createStopIcon(
                isFirst,
                isLast,
              )}
            >
              <Popup>
                <div className="p-1">

                  <div className="flex items-center gap-1.5 font-semibold text-gray-800">

                    <span>
                      {stop.stopId?.stopName || "Stop"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    {isFirst
                      ? "Departure Time: "
                      : "Expected Arrival: "}

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
