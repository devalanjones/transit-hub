import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fit the route only once when the map loads.
const MapAutoBounds = ({ positions }) => {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 1) {
            map.fitBounds(L.latLngBounds(positions), {
                padding: [30, 30],
            });
        }
    }, [map]);

    return null;
};

// Follow the moving bus without resetting the route zoom.
const FollowBus = ({ location }) => {
    const map = useMap();

    useEffect(() => {
        if (location) {
            map.panTo(
                [location.latitude, location.longitude],
                {
                    animate: true,
                    duration: 0.8,
                }
            );
        }
    }, [location?.latitude, location?.longitude, map]);

    return null;
};

// Moving bus icon.
const createBusIcon = () => {
    return L.divIcon({
        className: "moving-bus-icon",
        html: `
            <div style="
                width: 42px;
                height: 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #2563eb;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 3px 10px rgba(0,0,0,0.35);
                font-size: 23px;
            ">🚌</div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
    });
};

const busIcon = createBusIcon();

const UserScheduleMap = ({
    source,
    destination,
    stops = [],
    routeGeometry,
    liveLocation,
    isDemo = false,
}) => {
    const getValidLocation = (location) => {
        if (!location) return null;

        const latitude = Number(location.latitude);
        const longitude = Number(location.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180 ||
            (latitude === 0 && longitude === 0)
        ) {
            return null;
        }

        return { latitude, longitude };
    };

    const sourceLocation = getValidLocation(source);
    const destinationLocation = getValidLocation(destination);

    const validStops = stops
        .map((item) => {
            const stop = item.stopId || {};

            const location = getValidLocation({
                latitude: stop.latitude,
                longitude: stop.longitude,
            });

            return location
                ? { ...item, ...location }
                : null;
        })
        .filter(Boolean);

    // GeoJSON coordinates are [longitude, latitude].
    const geometryCoordinates =
        routeGeometry?.geometry?.coordinates || [];

    const roadPositions = geometryCoordinates.map(
        ([longitude, latitude]) => [latitude, longitude]
    );

    // Used as a fallback if OSRM geometry is unavailable.
    const routePositions = [
        ...(sourceLocation
            ? [[sourceLocation.latitude, sourceLocation.longitude]]
            : []),
        ...validStops.map((stop) => [
            stop.latitude,
            stop.longitude,
        ]),
        ...(destinationLocation
            ? [[destinationLocation.latitude, destinationLocation.longitude]]
            : []),
    ];

    const mapPositions =
        roadPositions.length >= 2
            ? roadPositions
            : routePositions;

    const currentLocation = getValidLocation(liveLocation);

    if (mapPositions.length === 0) {
        return (
            <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Route map is currently unavailable.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
            <MapContainer
                center={mapPositions[0]}
                zoom={14}
                scrollWheelZoom={false}
                className="z-0 h-[320px] w-full sm:h-[380px] lg:h-[420px]"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Road route only; no stop markers. */}
                {mapPositions.length >= 2 && (
                    <Polyline
                        positions={mapPositions}
                        pathOptions={{
                            color: "#2563eb",
                            weight: 5,
                            opacity: 0.9,
                            lineCap: "round",
                            lineJoin: "round",
                        }}
                    />
                )}

                {/* Only the moving bus marker. */}
                {currentLocation && (
                    <Marker
                        position={[
                            currentLocation.latitude,
                            currentLocation.longitude,
                        ]}
                        icon={busIcon}
                    >
                        <Popup>
                            <strong>
                                {isDemo
                                    ? "Demo Bus Location"
                                    : "Live Bus Location"}
                            </strong>
                        </Popup>
                    </Marker>
                )}

                <MapAutoBounds positions={mapPositions} />

                <FollowBus location={currentLocation} />
            </MapContainer>
        </div>
    );
};

export default UserScheduleMap;