import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getScheduleById, getRouteGeometryByCoordinates } from "../../services/scheduleService";
import { getAllBusTypes, calculateFare } from "../../services/fareService";
import { BusFront, Route, MapPin, Gauge, Clock, RefreshCw, Play, Square, Bus, ArrowLeft, IndianRupee } from "lucide-react"
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getLatestBusLocation } from "../../services/liveLocationService";
import { joinBusTracking, leaveBusTracking, onBusLocationUpdate } from "../../services/socket";
import UserScheduleMap from "../../components/user/UserScheduleMap";
import EmptyState from "../../components/common/EmptyState";
import JourneyInfo from "../../components/user/JourneyInfo";



const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (value) => (value * Math.PI) / 180;
    const earthRadius = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getNearestRouteIndex = (coordinates, latitude, longitude) => {
    let nearestIndex = 0;
    let shortestDistance = Infinity;

    coordinates.forEach(([lon, lat], index) => {
        const distance = calculateDistance(latitude, longitude, lat, lon);

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestIndex = index;
        }
    });

    return nearestIndex;
};

const getRouteDistance = (coordinates, startIndex, endIndex) => {
    let distance = 0;

    for (let i = startIndex; i < endIndex; i++) {
        const [lon1, lat1] = coordinates[i];
        const [lon2, lat2] = coordinates[i + 1];

        distance += calculateDistance(lat1, lon1, lat2, lon2);
    }

    return distance;
};

const getTimeAgo = (date) => {
    if (!date) return "Not available";

    const seconds = Math.floor(
        (Date.now() - new Date(date).getTime()) / 1000
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day ago`;
};

const formatStopTime = (time) => {
    if (!time) return "Time unavailable";

    const date = new Date(time);

    if (Number.isNaN(date.getTime())) return "Time unavailable";

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

const calculateJourneyDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "Not available";

    let start = new Date(startTime);
    let end = new Date(endTime);

    let difference;

    if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime())
    ) {
        difference = end.getTime() - start.getTime();
    } else {
        // Fallback for time values such as "09:30 AM"
        const getMinutes = (time) => {
            const match = String(time).match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
            );

            if (!match) return null;

            let hours = Number(match[1]);
            const minutes = Number(match[2]);
            const period = match[3]?.toUpperCase();

            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;

            return hours * 60 + minutes;
        };

        const startMinutes = getMinutes(startTime);
        const endMinutes = getMinutes(endTime);

        if (startMinutes === null || endMinutes === null) {
            return "Not available";
        }

        difference = (endMinutes - startMinutes) * 60000;

        // Handle journeys that cross midnight
        if (difference < 0) {
            difference += 24 * 60 * 60000;
        }
    }

    if (difference < 0) return "Not available";

    const totalMinutes = Math.floor(difference / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;

    if (minutes === 0) return `${hours} hr`;

    return `${hours} hr ${minutes} min`;
};

const BusScheduleDetails = () => {

    const { scheduleId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [liveLocation, setLiveLocation] = useState(null);
    const [routeGeometry, setRouteGeometry] = useState(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeError, setRouteError] = useState("");
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [demoLocation, setDemoLocation] = useState(null);
    const [demoProgress, setDemoProgress] = useState(0);
    const [fareDetails, setFareDetails] = useState(null);
    const [passengers, setPassengers] = useState(1);
    const [fareLoading, setFareLoading] = useState(false);
    const [fareError, setFareError] = useState("");

    const selectedFrom = searchParams.get("from") || "";
    const selectedTo = searchParams.get("to") || "";

    const busId =
        schedule?.bus?._id ||
        schedule?.busId?._id ||
        schedule?.busId;

    useEffect(() => {
        const fetchScheduleDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getScheduleById(scheduleId);

                setSchedule(response.data.data || response.data.schedule || response.data);
            } catch (error) {
                console.error("Failed to fetch schedule details:", error);
                setError("Failed to load bus schedule details.");
            } finally {
                setLoading(false);
            }
        };

        if (scheduleId) {
            fetchScheduleDetails();
        } else {
            setError("Schedule ID is missing");
            setLoading(false);
        }
    }, [scheduleId]);

    useEffect(() => {
        if (!busId) return;

        let isMounted = true;

        const fetchLatestLocation = async () => {
            try {
                const response = await getLatestBusLocation(busId);

                console.log("Latest GPS response:", response.data);

                const locationData =
                    response.data.data ||
                    response.data.location ||
                    response.data;

                if (isMounted) {
                    console.log("Latest bus location:", locationData);
                    setLiveLocation(locationData);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    setLiveLocation(null);
                    console.log("No GPS location available yet");
                } else {
                    console.error("Failed to fetch latest bus location:", error);
                }
            }
        };

        joinBusTracking(busId);

        const unsubscribe = onBusLocationUpdate((data) => {
            if (data.busId && String(data.busId) !== String(busId)) return;

            if (isMounted) {
                console.log("Socket location update:", data);
                setLiveLocation(data.location || data);
            }
        });

        fetchLatestLocation();

        return () => {
            isMounted = false;
            unsubscribe();
            leaveBusTracking(busId);
        };
    }, [busId]);

    useEffect(() => {
        if (!schedule) return;

        const fetchRouteGeometry = async () => {
            try {
                setRouteLoading(true);
                setRouteError("");

                const route = schedule.route || schedule.routeId || {};

                const source = route.source;
                const destination = route.destination;

                const sortedStops = [...(schedule.stops || [])].sort(
                    (a, b) => a.stopSequence - b.stopSequence
                );

                const stops = sortedStops
                    .map((item) => {
                        const stop = item.stopId || {};

                        return {
                            latitude: Number(stop.latitude),
                            longitude: Number(stop.longitude),
                        };
                    })
                    .filter(
                        (stop) =>
                            Number.isFinite(stop.latitude) &&
                            Number.isFinite(stop.longitude)
                    );

                const routeData = {
                    source: {
                        latitude: Number(source?.latitude),
                        longitude: Number(source?.longitude),
                    },
                    stops,
                    destination: {
                        latitude: Number(destination?.latitude),
                        longitude: Number(destination?.longitude),
                    },
                };

                if (
                    !Number.isFinite(routeData.source.latitude) ||
                    !Number.isFinite(routeData.source.longitude) ||
                    !Number.isFinite(routeData.destination.latitude) ||
                    !Number.isFinite(routeData.destination.longitude)
                ) {
                    throw new Error("Route source or destination coordinates are unavailabe.");
                }

                const response = await getRouteGeometryByCoordinates(routeData);

                setRouteGeometry(response.data.data);

                console.log("User route geometry:", response.data.data);

            } catch (error) {
                console.error("Failed to load user route geometry:", error);

                setRouteError(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load route geometry."
                );

            } finally {
                setRouteLoading(false);
            }
        };

        fetchRouteGeometry();
    }, [schedule]);

    useEffect(() => {
        if (!isDemoMode || !isDemoRunning || !routeGeometry) {
            setDemoLocation(null);
            return;
        }

        const coordinates = routeGeometry.geometry?.coordinates || [];

        if (coordinates.length === 0) {
            setDemoLocation(null);
            return;
        }

        const speed = 40; // Illustrative demo speed in km/h

        const selectedStops = (schedule?.stops || [])
            .map((item) => {
                const stop = item.stopId || {};

                const latitude = Number(stop.latitude);
                const longitude = Number(stop.longitude);

                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                    return null;
                }

                return {
                    name: stop.stopName || "Bus Stop",
                    latitude,
                    longitude,
                    stopSequence: item.stopSequence || 0,
                    routeIndex: getNearestRouteIndex(
                        coordinates,
                        latitude,
                        longitude
                    ),
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.stopSequence - b.stopSequence);

        let index = 0;

        const updateDemoLocation = () => {
            const [longitude, latitude] = coordinates[index];

            // Find the nearest selected bus stop.
            const nearestStop = selectedStops.reduce((nearest, stop) => {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    stop.latitude,
                    stop.longitude
                );

                return !nearest || distance < nearest.distance
                    ? { ...stop, distance }
                    : nearest;
            }, null);

            // Find the next stop ahead of the simulated bus.
            const nextStop = selectedStops.find(
                (stop) => stop.routeIndex > index
            );

            let estimatedArrival = "Destination reached";

            if (nextStop) {
                const remainingDistance = getRouteDistance(
                    coordinates,
                    index,
                    nextStop.routeIndex
                );

                const remainingMinutes = Math.ceil(
                    (remainingDistance / speed) * 60
                );

                estimatedArrival = new Date(
                    Date.now() + remainingMinutes * 60000
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }

            setDemoLocation({
                latitude,
                longitude,
                speed,
                updatedAt: new Date().toISOString(),

                currentLocationName: nearestStop
                    ? `Near ${nearestStop.name}`
                    : "Along selected route",

                nextStopName: nextStop?.name || "No upcoming stop",

                estimatedArrival,
            });

            index = (index + 1) % coordinates.length;
        };

        updateDemoLocation();

        const interval = setInterval(updateDemoLocation, 1500);

        return () => clearInterval(interval);
    }, [isDemoMode, isDemoRunning, routeGeometry, schedule?.stops]);

    const bus = schedule?.bus || schedule?.busId || {};
    const busType = bus?.busType || {};

    const route = schedule?.route || schedule?.routeId || {};

    const isBusInactive = String(bus.status || "").toLowerCase() === "inactive";

    const hasRealGps =
        liveLocation &&
        Number.isFinite(Number(liveLocation.latitude)) &&
        Number.isFinite(Number(liveLocation.longitude)) &&
        !(Number(liveLocation.latitude) === 0 &&
            Number(liveLocation.longitude) === 0);

    const selectedLocation = isDemoMode
        ? demoLocation
        : liveLocation;

    const realGpsUnavailable = !hasRealGps;

    const realStatus = isBusInactive
        ? "Bus Not Running"
        : realGpsUnavailable
            ? "GPS Location Unavailable"
            : "Live Tracking Active";

    // Prepare all stops in route order
    const routeCoordinates = routeGeometry?.geometry?.coordinates || [];

    const allStops = [
        {
            id: "source",
            name: route.source?.name || "Starting Point",
            time: schedule?.departureTime,
            latitude: Number(route.source?.latitude),
            longitude: Number(route.source?.longitude),
        },

        ...[...(schedule?.stops || [])]
            .sort((a, b) => (a.stopSequence || 0) - (b.stopSequence || 0))
            .filter((item) => item.stopId && typeof item.stopId === "object")
            .map((item, index) => ({
                id: item.stopId._id || `stop-${index}`,
                name: item.stopId.stopName || "Stop unavailable",
                time: item.expectedArrivalTime,
                latitude: Number(item.stopId.latitude),
                longitude: Number(item.stopId.longitude),
            })),

        {
            id: "destination",
            name: route.destination?.name || "Destination",
            time: schedule?.arrivalTime,
            latitude: Number(route.destination?.latitude),
            longitude: Number(route.destination?.longitude),
        },
    ];

    // Check whether a valid bus location is available
    const hasSelectedLocation =
        selectedLocation &&
        Number.isFinite(Number(selectedLocation.latitude)) &&
        Number.isFinite(Number(selectedLocation.longitude));

    // Find the bus position along the route
    const currentRouteIndex =
        hasSelectedLocation && routeCoordinates.length
            ? getNearestRouteIndex(
                routeCoordinates,
                Number(selectedLocation.latitude),
                Number(selectedLocation.longitude)
            )
            : null;

    // Calculate distance from the bus to every stop
    const stopsWithStatus = allStops.map((stop) => {
        const hasCoordinates =
            Number.isFinite(stop.latitude) &&
            Number.isFinite(stop.longitude);

        const distance = hasSelectedLocation && hasCoordinates
            ? calculateDistance(
                Number(selectedLocation.latitude),
                Number(selectedLocation.longitude),
                stop.latitude,
                stop.longitude
            )
            : null;

        const routeIndex =
            hasCoordinates && routeCoordinates.length
                ? getNearestRouteIndex(
                    routeCoordinates,
                    stop.latitude,
                    stop.longitude
                )
                : null;

        return {
            ...stop,
            distance,
            routeIndex,
        };
    });

    // Find the selected boarding and destination stops
    const normalizeStopName = (name) =>
        String(name || "").trim().toLowerCase();

    const selectedFromStop = stopsWithStatus.find(
        (stop) =>
            normalizeStopName(stop.name) === normalizeStopName(selectedFrom)
    );

    const selectedToStop = stopsWithStatus.find(
        (stop) =>
            normalizeStopName(stop.name) === normalizeStopName(selectedTo)
    );

    // Calculate distance only between the selected stops
    const selectedJourneyDistance =
        selectedFromStop &&
            selectedToStop &&
            routeCoordinates.length > 0 &&
            selectedFromStop.routeIndex !== null &&
            selectedToStop.routeIndex !== null &&
            selectedToStop.routeIndex > selectedFromStop.routeIndex
            ? getRouteDistance(
                routeCoordinates,
                selectedFromStop.routeIndex,
                selectedToStop.routeIndex
            )
            : null;

    // Selected journey departure and arrival times
    const journeyDepartureTime = selectedFromStop?.time;
    const journeyArrivalTime = selectedToStop?.time;

    // Calculate selected journey duration
    const journeyDuration = calculateJourneyDuration(
        journeyDepartureTime,
        journeyArrivalTime
    );

    // Identify the closest stop to the current bus location
    const nearestStop = hasSelectedLocation
        ? stopsWithStatus
            .filter((stop) => stop.distance !== null)
            .reduce(
                (nearest, stop) =>
                    !nearest || stop.distance < nearest.distance
                        ? stop
                        : nearest,
                null
            )
        : null;

    // Assign the display status to each stop
    const stopsWithDisplayStatus = stopsWithStatus.map((stop) => {
        const isCurrentArea =
            nearestStop?.id === stop.id &&
            nearestStop.distance <= 0.5;

        let status = "Scheduled";

        if (hasSelectedLocation && currentRouteIndex !== null) {
            if (isCurrentArea) {
                status = "Current";
            } else if (
                stop.routeIndex !== null &&
                stop.routeIndex < currentRouteIndex
            ) {
                status = "Passed";
            } else {
                status = "Upcoming";
            }
        }

        return {
            ...stop,
            status,
        };
    });

    const busBetweenStopsIndex =
        hasSelectedLocation && currentRouteIndex !== null
            ? stopsWithDisplayStatus.findIndex((stop, index) => {
                const nextStop = stopsWithDisplayStatus[index + 1];

                if (!nextStop || stop.routeIndex === null || nextStop.routeIndex === null) {
                    return false;
                }

                return (
                    currentRouteIndex >= stop.routeIndex &&
                    currentRouteIndex < nextStop.routeIndex
                );
            })
            : -1;

    const busIsNearStop =
        nearestStop && nearestStop.distance <= 0.5;

    useEffect(() => {
        const fetchFareDetails = async () => {
            try {
                setFareLoading(true);
                setFareError("");
                setFareDetails(null);

                if (!schedule || !busType || !selectedJourneyDistance) {
                    return;
                }

                const fareResponse = await getAllBusTypes();

                const fareRecords = fareResponse.data.data || [];

                const selectedBusType =
                    typeof busType === "object"
                        ? busType.busType
                        : busType;

                const matchingFare = fareRecords.find(
                    (fare) =>
                        fare.busType.trim().toLowerCase() ===
                        selectedBusType?.trim().toLowerCase()
                );

                if (!matchingFare) {
                    setFareError("Fare details are not available for this bus type.");
                    return;
                }

                const calculationResponse = await calculateFare({
                    busTypeId: matchingFare._id,
                    distanceInKm: selectedJourneyDistance,
                    passengers,
                });

                setFareDetails(calculationResponse.data.data);

            } catch (error) {
                console.error("Fare calculation failed;", error);
                setFareError(error.response?.data?.message || "Failed to calculate fare.");

            } finally {
                setFareLoading(false);
            }
        };

        fetchFareDetails();
    }, [schedule, busType, selectedJourneyDistance, passengers]);

    if (loading) {
        return <Loading />;
    }

    if (error || !schedule) {
        return (
            <ErrorMessage
                message={error || "Schedule not found."}
            />
        );
    }

    console.log("Full schedule details:", schedule);

    return (
        <div className="space-y-6">

            {/* Back Button */}
            <div>
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={17} />
                    Back to Bus Schedule
                </Button>
            </div>

            {/* 1. Bus Information */}
            <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.10)] dark:border-white/10 dark:from-[#18212d] dark:via-[#151b23] dark:to-[#101827] dark:shadow-[0_15px_35px_rgba(0,0,0,0.35)]">

                {/* 3D Background Decorations */}
                <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-40 w-40 rounded-full bg-purple-400/10 blur-3xl" />

                {/* Header */}
                <div className="relative mb-6 flex items-center gap-3 border-b border-slate-200/70 pb-5 dark:border-white/10">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/50 bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_5px_0_#1d4ed8,0_9px_15px_rgba(37,99,235,0.25)] dark:border-blue-300/20 dark:from-blue-500 dark:to-blue-800 dark:shadow-[0_5px_0_#1e40af,0_9px_15px_rgba(0,0,0,0.3)]">
                        <BusFront size={23} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Bus Information
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Details of your selected bus
                        </p>
                    </div>
                </div>

                {/* Bus Information Cards */}
                <div className="grid gap-4 sm:grid-cols-2">

                    {/* Bus Number */}
                    <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50 p-4 shadow-[0_4px_0_#bfdbfe,0_7px_14px_rgba(37,99,235,0.08)] dark:border-blue-400/20 dark:from-slate-800 dark:to-blue-950/30 dark:shadow-[0_4px_0_rgba(30,64,175,0.25)]">

                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/50 bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_3px_0_#1d4ed8]">
                            <BusFront size={18} />
                        </div>

                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Bus Number
                        </p>

                        <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                            {bus.busRegNumber || "Not available"}
                        </p>
                    </div>

                    {/* Bus Type */}
                    <div className="rounded-xl border border-purple-200/80 bg-gradient-to-br from-white to-purple-50 p-4 shadow-[0_4px_0_#e9d5ff,0_7px_14px_rgba(147,51,234,0.08)] dark:border-purple-400/20 dark:from-slate-800 dark:to-purple-950/30 dark:shadow-[0_4px_0_rgba(107,33,168,0.25)]">

                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-purple-300/50 bg-gradient-to-br from-purple-400 to-purple-700 text-white shadow-[0_3px_0_#6b21a8]">
                            <Bus size={18} />
                        </div>

                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Bus Type
                        </p>

                        <p className="mt-2 text-xl font-extrabold capitalize text-slate-900 dark:text-white">
                            {typeof busType === "object"
                                ? busType.busType || "Not available"
                                : busType || "Not available"}
                        </p>
                    </div>

                </div>
            </section>

            {/* 2. Bus Route */}
            <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-purple-50/50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.10)] dark:border-white/10 dark:from-[#18212d] dark:via-[#151b23] dark:to-[#101827] dark:shadow-[0_15px_35px_rgba(0,0,0,0.35)]">

                {/* 3D Background Decorations */}
                <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-purple-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

                {/* Header */}
                <div className="relative mb-6 flex items-center gap-3 border-b border-slate-200/70 pb-5 dark:border-white/10">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/50 bg-gradient-to-br from-purple-400 to-purple-700 text-white shadow-[0_5px_0_#6b21a8,0_9px_15px_rgba(147,51,234,0.25)] dark:border-purple-300/20 dark:from-purple-500 dark:to-purple-800 dark:shadow-[0_5px_0_#581c87,0_9px_15px_rgba(0,0,0,0.3)]">
                        <Route size={23} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Bus Route
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Starting point and destination
                        </p>
                    </div>
                </div>

                <h3 className="text-xl font-extrabold capitalize text-slate-900 dark:text-white">
                    {route.routeName || "Route unavailable"}
                </h3>

                {/* Route Points */}
                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">

                    {/* Starting Point */}
                    <div className="rounded-xl border border-green-200/80 bg-gradient-to-br from-white to-green-50 p-4 shadow-[0_4px_0_#bbf7d0,0_7px_14px_rgba(34,197,94,0.08)] dark:border-green-500/20 dark:from-slate-800 dark:to-green-950/30 dark:shadow-[0_4px_0_rgba(21,128,61,0.25)]">

                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-green-300/50 bg-gradient-to-br from-green-400 to-green-700 text-white shadow-[0_3px_0_#15803d]">
                            <MapPin size={18} />
                        </div>

                        <p className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                            Starting Point
                        </p>

                        <p className="mt-2 text-base font-bold capitalize text-slate-900 dark:text-white">
                            {route.source?.name || "Origin"}
                        </p>
                    </div>

                    {/* Route Connector */}
                    <div className="flex justify-center">
                        <Route
                            size={23}
                            className="rotate-90 text-purple-500 sm:rotate-0"
                        />
                    </div>

                    {/* Destination */}
                    <div className="rounded-xl border border-red-200/80 bg-gradient-to-br from-white to-red-50 p-4 shadow-[0_4px_0_#fecaca,0_7px_14px_rgba(239,68,68,0.08)] dark:border-red-500/20 dark:from-slate-800 dark:to-red-950/30 dark:shadow-[0_4px_0_rgba(185,28,28,0.25)]">

                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-red-300/50 bg-gradient-to-br from-red-400 to-red-700 text-white shadow-[0_3px_0_#b91c1c]">
                            <MapPin size={18} />
                        </div>

                        <p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
                            Destination
                        </p>

                        <p className="mt-2 text-base font-bold capitalize text-slate-900 dark:text-white">
                            {route.destination?.name || "Destination"}
                        </p>
                    </div>

                </div>
            </section>

            {/* 3. Live Status */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#151b23]">

                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Live Status
                    </h2>

                    <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                        <button
                            onClick={() => {
                                setIsDemoMode(false);
                                setIsDemoRunning(false);
                                setDemoLocation(null);
                            }}
                            className={`rounded-md px-3 py-2 text-sm font-medium ${!isDemoMode
                                ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-blue-400"
                                : "text-slate-600 dark:text-slate-300"
                                }`}
                        >
                            Real GPS
                        </button>

                        <button
                            onClick={() => {
                                setIsDemoMode(true);
                                setIsDemoRunning(false);
                            }}
                            className={`rounded-md px-3 py-2 text-sm font-medium ${isDemoMode
                                ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-blue-400"
                                : "text-slate-600 dark:text-slate-300"
                                }`}
                        >
                            Demo Mode
                        </button>
                    </div>
                </div>

                {isDemoMode ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    Demo Bus Tracking
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Simulated location along the route
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                SIMULATED
                            </span>
                        </div>

                        {!isDemoRunning ? (
                            <button
                                onClick={() => setIsDemoRunning(true)}
                                disabled={!routeGeometry?.geometry?.coordinates?.length}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Play size={17} />
                                Start Demo
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsDemoRunning(false);
                                    setDemoLocation(null);
                                }}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                <Square size={17} />
                                Stop Demo
                            </button>
                        )}

                        {!routeGeometry && (
                            <p className="text-sm text-orange-600 dark:text-orange-400">
                                Waiting for route geometry to load.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${hasRealGps && !isBusInactive
                                    ? "bg-green-500"
                                    : "bg-orange-500"
                                    }`}
                            />

                            <p className="font-semibold text-slate-900 dark:text-white">
                                {realStatus}
                            </p>
                        </div>

                        {isBusInactive ? (
                            <EmptyState
                                title="Bus Not Running"
                                message="This bus is currently marked inactive. Live tracking is unavailable."
                                icon={BusFront}
                            />
                        ) : realGpsUnavailable ? (
                            <EmptyState
                                title="Live Location Unavailable"
                                message="We haven't received GPS data from this bus yet. Please check again later."
                                icon={MapPin}
                            />
                        ) : null}
                    </div>
                )}
            </section>

            {/* 4. Live Map and Journey Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#151b23]">

                <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
                    Live Bus Tracking
                </h2>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">

                    {/* LEFT SIDE - MAP */}
                    <div className="space-y-3">

                        {/* Upcoming Stop */}
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-600 p-4 text-white">

                            <div>
                                <p className="text-xs font-semibold uppercase text-blue-100">
                                    Upcoming Stop
                                </p>

                                <p className="mt-1 text-lg font-bold">
                                    {selectedLocation?.nextStopName || "Not available"}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xl font-bold">
                                    {selectedLocation?.estimatedArrival || "--"}
                                </p>

                                <p className="text-xs text-blue-100">
                                    Estimated Arrival
                                </p>
                            </div>

                        </div>

                        {/* Map */}
                        {routeLoading ? (
                            <Loading />
                        ) : routeError ? (
                            <ErrorMessage message={routeError} />
                        ) : (
                            <UserScheduleMap
                                source={route.source}
                                destination={route.destination}
                                stops={schedule.stops || []}
                                routeGeometry={routeGeometry}
                                liveLocation={selectedLocation}
                                isDemo={isDemoMode}
                            />
                        )}

                    </div>

                    {/* RIGHT SIDE - JOURNEY INFORMATION */}
                    <div className="space-y-4">

                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                Journey Information
                            </h3>

                            {isDemoMode && (
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    DEMO DATA
                                </span>
                            )}
                        </div>

                        {(isDemoMode
                            ? isDemoRunning && demoLocation
                            : hasRealGps && !isBusInactive
                        ) ? (

                            <div className="grid grid-cols-1 gap-3">

                                <JourneyInfo
                                    icon={MapPin}
                                    title="Current Location"
                                    value={
                                        selectedLocation?.currentLocationName ||
                                        "Not available"
                                    }
                                />

                                <JourneyInfo
                                    icon={BusFront}
                                    title="Next Stop"
                                    value={selectedLocation?.nextStopName}
                                />

                                <JourneyInfo
                                    icon={Clock}
                                    title="Estimated Arrival"
                                    value={selectedLocation?.estimatedArrival}
                                />

                                <JourneyInfo
                                    icon={Gauge}
                                    title="Current Speed"
                                    value={
                                        selectedLocation?.speed != null
                                            ? `${selectedLocation.speed} km/h`
                                            : "Not available"
                                    }
                                />

                                <JourneyInfo
                                    icon={RefreshCw}
                                    title="Last Updated"
                                    value={getTimeAgo(selectedLocation?.updatedAt)}
                                />

                            </div>

                        ) : (

                            <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {isDemoMode
                                        ? "Start Demo to view journey information."
                                        : isBusInactive
                                            ? "This bus is currently inactive."
                                            : "Journey information will appear when GPS data is available."}
                                </p>

                            </div>

                        )}

                    </div>

                </div>
            </section>

            {/* 5. All Bus Stops */}
            <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.10)] dark:border-white/10 dark:from-[#18212d] dark:via-[#151b23] dark:to-[#101827] dark:shadow-[0_15px_35px_rgba(0,0,0,0.35)]">

                {/* 3D Background Decorations */}
                <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-40 w-40 rounded-full bg-green-400/10 blur-3xl" />

                {/* Header */}
                <div className="relative mb-7 flex items-center justify-between gap-3 border-b border-slate-200/70 pb-5 dark:border-white/10">

                    <div className="flex items-center gap-3">

                        {/* 3D Location Icon */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/50 bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_5px_0_#1d4ed8,0_9px_15px_rgba(37,99,235,0.25)] dark:border-blue-300/20 dark:from-blue-500 dark:to-blue-800 dark:shadow-[0_5px_0_#1e40af,0_9px_15px_rgba(0,0,0,0.3)]">
                            <MapPin size={23} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                All Bus Stops
                            </h2>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Follow your journey stop by stop
                            </p>
                        </div>

                    </div>

                    {/* Stop Count */}
                    <span className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100 px-3 py-2 text-xs font-bold text-blue-700 shadow-[0_3px_0_#bfdbfe] dark:border-blue-400/20 dark:from-blue-500/15 dark:to-blue-500/5 dark:text-blue-400 dark:shadow-[0_3px_0_rgba(30,64,175,0.3)]">
                        {stopsWithDisplayStatus.length} Stops
                    </span>

                </div>

                {/* Stops Timeline */}
                {stopsWithDisplayStatus.length === 0 ? (
                    <EmptyState
                        title="No Stops Available"
                        message="Stop information is not available for this schedule."
                        icon={MapPin}
                    />
                ) : (
                    <div className="relative">

                        {stopsWithDisplayStatus.map((stop, index) => {

                            const isLast =
                                index === stopsWithDisplayStatus.length - 1;

                            const nextStop = stopsWithDisplayStatus[index + 1];

                            const isPassed = stop.status === "Passed";
                            const isCurrent = stop.status === "Current";
                            const isUpcoming = stop.status === "Upcoming";

                            let distanceText = "";

                            if (
                                isUpcoming &&
                                stop.distance !== null &&
                                hasSelectedLocation
                            ) {
                                distanceText =
                                    stop.distance < 1
                                        ? "<1 km away"
                                        : `${stop.distance.toFixed(1)} km away`;
                            }

                            // Existing bus position logic
                            const showBusHere =
                                index === busBetweenStopsIndex &&
                                !busIsNearStop &&
                                nextStop;

                            // Existing segment progress calculation
                            const startRouteIndex = stop.routeIndex;
                            const endRouteIndex = nextStop?.routeIndex;

                            const segmentProgress =
                                showBusHere &&
                                    Number.isFinite(currentRouteIndex) &&
                                    Number.isFinite(startRouteIndex) &&
                                    Number.isFinite(endRouteIndex) &&
                                    endRouteIndex > startRouteIndex
                                    ? Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            ((currentRouteIndex - startRouteIndex) /
                                                (endRouteIndex - startRouteIndex)) * 100
                                        )
                                    )
                                    : 0;

                            const connectorHeight = 150;
                            const busIconRadius = 16;

                            const busTopPx = Math.max(
                                24,
                                Math.min(
                                    connectorHeight - 24,
                                    (connectorHeight * segmentProgress) / 100
                                )
                            );

                            const progressLineHeight = Math.max(
                                0,
                                busTopPx - busIconRadius
                            );

                            return (
                                <div key={stop.id}>

                                    {/* Stop Information */}
                                    <div className="relative flex gap-4">

                                        {/* 3D Timeline Marker */}
                                        <div className="relative flex w-8 shrink-0 flex-col items-center">

                                            {/* Raised Stop Number */}
                                            <span
                                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-all duration-300 ${isPassed
                                                    ? "border-green-300 bg-gradient-to-br from-green-400 to-green-700 text-white shadow-[0_3px_0_#15803d,0_6px_12px_rgba(34,197,94,0.25)]"
                                                    : isCurrent
                                                        ? "border-blue-300 bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_3px_0_#1d4ed8,0_6px_15px_rgba(37,99,235,0.35)] ring-4 ring-blue-400/10"
                                                        : "border-slate-200 bg-gradient-to-br from-white to-slate-200 text-slate-500 shadow-[0_3px_0_#cbd5e1,0_5px_10px_rgba(15,23,42,0.10)] dark:border-slate-600 dark:from-slate-600 dark:to-slate-800 dark:text-slate-200 dark:shadow-[0_3px_0_#334155,0_5px_10px_rgba(0,0,0,0.3)]"
                                                    }`}
                                            >
                                                {isPassed ? "✓" : index + 1}
                                            </span>

                                            {/* Timeline Connector */}
                                            {!isLast && !showBusHere && (
                                                <div
                                                    className={`absolute left-1/2 top-8 bottom-0 w-[3px] -translate-x-1/2 rounded-full ${isPassed
                                                        ? "bg-gradient-to-b from-green-400 to-green-500 shadow-[0_0_7px_rgba(34,197,94,0.3)]"
                                                        : "bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-700"
                                                        }`}
                                                />
                                            )}

                                        </div>

                                        {/* Stop Details - Normal Timeline Layout */}
                                        <div className="mb-7 min-w-0 flex-1">

                                            <div className="flex flex-wrap items-center justify-between gap-2">

                                                <h3
                                                    className={`font-semibold ${isCurrent
                                                        ? "text-blue-700 dark:text-blue-400"
                                                        : "text-slate-800 dark:text-white"
                                                        }`}
                                                >
                                                    {stop.name}
                                                </h3>

                                                {/* Status Badge */}
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${isPassed
                                                        ? "border-green-300/60 bg-gradient-to-b from-green-50 to-green-100 text-green-700 dark:border-green-500/20 dark:from-green-500/15 dark:to-green-500/5 dark:text-green-400"
                                                        : isCurrent
                                                            ? "border-blue-300/60 bg-gradient-to-b from-blue-50 to-blue-100 text-blue-700 dark:border-blue-500/20 dark:from-blue-500/15 dark:to-blue-500/5 dark:text-blue-400"
                                                            : "border-slate-200 bg-gradient-to-b from-white to-slate-100 text-slate-500 dark:border-white/10 dark:from-slate-700/60 dark:to-slate-800 dark:text-slate-400"
                                                        }`}
                                                >
                                                    {isPassed
                                                        ? "Passed"
                                                        : isCurrent
                                                            ? "Current"
                                                            : isUpcoming
                                                                ? "Upcoming"
                                                                : "Scheduled"}
                                                </span>

                                            </div>

                                            {/* Current Bus Area */}
                                            {isCurrent && (
                                                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                    Current bus area
                                                </p>
                                            )}

                                            {/* Time and Distance Details */}
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">

                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-blue-500" />
                                                    {formatStopTime(stop.time)}
                                                </span>

                                                {isPassed && (
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        ✓ Passed
                                                    </span>
                                                )}

                                                {isUpcoming && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={13} className="text-blue-500" />
                                                        {distanceText || "Upcoming"}
                                                    </span>
                                                )}

                                                {stop.status === "Scheduled" && (
                                                    <span>Scheduled</span>
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                    {/* Moving Bus Between Stops */}
                                    {showBusHere && (
                                        <div className="relative grid h-[150px] grid-cols-[32px_minmax(0,1fr)]">

                                            {/* Timeline */}
                                            <div className="relative">

                                                {/* Background Connector */}
                                                <div className="absolute bottom-0 left-1/2 top-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-700" />

                                                {/* Green Progress Line */}
                                                <div
                                                    className="absolute left-1/2 top-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-green-400 to-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                                    style={{
                                                        height: `${progressLineHeight}px`,
                                                    }}
                                                />

                                            </div>

                                            {/* Bus Icon and Details */}
                                            <div
                                                className="absolute left-0 right-0 z-30 flex -translate-y-1/2 items-center"
                                                style={{
                                                    top: `${busTopPx}px`,
                                                }}
                                            >

                                                {/* 3D Bus Icon */}
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-300 bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_3px_0_#1d4ed8,0_6px_12px_rgba(37,99,235,0.35)] dark:border-blue-300/30 dark:from-blue-500 dark:to-blue-800">
                                                    <BusFront size={17} />
                                                </div>

                                                {/* Compact 3D Bus Details */}
                                                <div className="ml-3 w-fit max-w-[200px] rounded-xl border border-blue-200/80 bg-gradient-to-br from-white via-blue-50 to-blue-100 px-3 py-2 shadow-[0_4px_0_#bfdbfe,0_7px_14px_rgba(37,99,235,0.10)] dark:border-blue-400/20 dark:from-slate-800 dark:via-blue-950/70 dark:to-slate-900 dark:shadow-[0_4px_0_rgba(30,64,175,0.3),0_7px_14px_rgba(0,0,0,0.2)]">

                                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                                        Bus currently moving
                                                    </p>

                                                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                                                        {stop.name} → {nextStop.name}
                                                    </p>

                                                    {stop.distance !== null && (
                                                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                            {stop.distance.toFixed(1)} km from {stop.name}
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>
                )}
            </section>

            {/* 6. Journey Details */}
            <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.10)] dark:border-white/10 dark:from-[#18212d] dark:via-[#151b23] dark:to-[#101827] dark:shadow-[0_15px_35px_rgba(0,0,0,0.35)]">

                {/* 3D Background Decorations */}
                <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-40 w-40 rounded-full bg-purple-400/10 blur-3xl" />

                {/* Header */}
                <div className="relative mb-6 flex items-center gap-3 border-b border-slate-200/70 pb-5 dark:border-white/10">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/50 bg-gradient-to-br from-purple-400 to-purple-700 text-white shadow-[0_5px_0_#6b21a8,0_9px_15px_rgba(147,51,234,0.25)] dark:border-purple-300/20 dark:from-purple-500 dark:to-purple-800 dark:shadow-[0_5px_0_#581c87,0_9px_15px_rgba(0,0,0,0.3)]">
                        <Route size={23} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Journey Details
                        </h2>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Details of your selected journey
                        </p>
                    </div>

                </div>

                {!selectedFrom || !selectedTo ? (

                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                        <MapPin className="mx-auto mb-2 text-slate-400" size={28} />

                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                            Journey Not Selected
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Please select your starting point and destination from the bus search.
                        </p>
                    </div>

                ) : !selectedFromStop || !selectedToStop ? (

                    <div className="rounded-xl border border-dashed border-orange-300 p-6 text-center dark:border-orange-500/30">
                        <MapPin className="mx-auto mb-2 text-orange-500" size={28} />

                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                            Selected Stops Not Found
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            The selected journey stops could not be matched with this bus route.
                        </p>
                    </div>

                ) : (

                    <div className="space-y-5">

                        {/* From and To */}
                        <div className="grid gap-4 sm:grid-cols-2">

                            {/* From */}
                            <div className="rounded-xl border border-green-200/80 bg-gradient-to-br from-white to-green-50 p-4 shadow-[0_4px_0_#bbf7d0,0_7px_14px_rgba(34,197,94,0.08)] dark:border-green-500/20 dark:from-slate-800 dark:to-green-950/30 dark:shadow-[0_4px_0_rgba(21,128,61,0.25)]">

                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-green-300/50 bg-gradient-to-br from-green-400 to-green-700 text-white shadow-[0_3px_0_#15803d]">
                                        <MapPin size={18} />
                                    </div>

                                    <p className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                                        From
                                    </p>
                                </div>

                                <p className="text-base font-bold text-slate-900 dark:text-white">
                                    {selectedFromStop.name}
                                </p>

                            </div>

                            {/* To */}
                            <div className="rounded-xl border border-red-200/80 bg-gradient-to-br from-white to-red-50 p-4 shadow-[0_4px_0_#fecaca,0_7px_14px_rgba(239,68,68,0.08)] dark:border-red-500/20 dark:from-slate-800 dark:to-red-950/30 dark:shadow-[0_4px_0_rgba(185,28,28,0.25)]">

                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-300/50 bg-gradient-to-br from-red-400 to-red-700 text-white shadow-[0_3px_0_#b91c1c]">
                                        <MapPin size={18} />
                                    </div>

                                    <p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
                                        To
                                    </p>
                                </div>

                                <p className="text-base font-bold text-slate-900 dark:text-white">
                                    {selectedToStop.name}
                                </p>

                            </div>

                        </div>

                        {/* Journey Information */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Journey Distance */}
                            <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50 p-4 shadow-[0_4px_0_#bfdbfe,0_7px_14px_rgba(37,99,235,0.08)] dark:border-blue-400/20 dark:from-slate-800 dark:to-blue-950/30 dark:shadow-[0_4px_0_rgba(30,64,175,0.25)]">

                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/50 bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_3px_0_#1d4ed8]">
                                    <Route size={18} />
                                </div>

                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Journey Distance
                                </p>

                                <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                                    {selectedJourneyDistance !== null
                                        ? `${selectedJourneyDistance.toFixed(1)} km`
                                        : "Not available"}
                                </p>

                            </div>

                            {/* Departure Time */}
                            <div className="rounded-xl border border-purple-200/80 bg-gradient-to-br from-white to-purple-50 p-4 shadow-[0_4px_0_#e9d5ff,0_7px_14px_rgba(147,51,234,0.08)] dark:border-purple-400/20 dark:from-slate-800 dark:to-purple-950/30 dark:shadow-[0_4px_0_rgba(107,33,168,0.25)]">

                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-purple-300/50 bg-gradient-to-br from-purple-400 to-purple-700 text-white shadow-[0_3px_0_#6b21a8]">
                                    <BusFront size={18} />
                                </div>

                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Departure Time
                                </p>

                                <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                                    {formatStopTime(journeyDepartureTime)}
                                </p>

                            </div>

                            {/* Arrival Time */}
                            <div className="rounded-xl border border-orange-200/80 bg-gradient-to-br from-white to-orange-50 p-4 shadow-[0_4px_0_#fed7aa,0_7px_14px_rgba(249,115,22,0.08)] dark:border-orange-400/20 dark:from-slate-800 dark:to-orange-950/30 dark:shadow-[0_4px_0_rgba(194,65,12,0.25)]">

                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-orange-300/50 bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-[0_3px_0_#c2410c]">
                                    <MapPin size={18} />
                                </div>

                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Arrival Time
                                </p>

                                <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                                    {formatStopTime(journeyArrivalTime)}
                                </p>

                            </div>

                            {/* Duration */}
                            <div className="rounded-xl border border-cyan-200/80 bg-gradient-to-br from-white to-cyan-50 p-4 shadow-[0_4px_0_#a5f3fc,0_7px_14px_rgba(6,182,212,0.08)] dark:border-cyan-400/20 dark:from-slate-800 dark:to-cyan-950/30 dark:shadow-[0_4px_0_rgba(14,116,144,0.25)]">

                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/50 bg-gradient-to-br from-cyan-400 to-cyan-700 text-white shadow-[0_3px_0_#0e7490]">
                                    <Clock size={18} />
                                </div>

                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Duration
                                </p>

                                <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                                    {journeyDuration}
                                </p>

                            </div>

                        </div>

                    </div>

                )}

            </section>

            {/* 7. Fare Details */}
            <section className="relative isolate overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/60 shadow-[0_12px_30px_rgba(180,83,9,0.12)] dark:border-amber-900/40 dark:from-[#151b25] dark:via-[#1b2029] dark:to-[#211d1a]">

                {/* Decorative Background */}
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-300/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-orange-300/20 blur-3xl" />

                <div className="relative z-10">

                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-amber-200/70 p-5 dark:border-amber-900/40">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_5px_0_#b45309]">
                            <IndianRupee size={23} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Fare Details
                            </h2>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Estimated fare for your selected journey
                            </p>
                        </div>

                    </div>

                    {/* Content */}
                    <div className="space-y-5 p-5">

                        {/* Loading */}
                        {fareLoading ? (
                            <Loading />
                        ) : fareError ? (

                            /* Error */
                            <ErrorMessage message={fareError} />

                        ) : fareDetails ? (

                            <>

                                {/* Bus Type and Journey Distance */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                    {/* Bus Type */}
                                    <div className="rounded-xl border border-amber-200/70 bg-white/80 p-4 shadow-[0_4px_0_rgba(217,119,6,0.12)] dark:border-amber-900/40 dark:bg-[#202631]">

                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Bus Type
                                        </p>

                                        <p className="mt-2 font-bold text-gray-800 dark:text-white">
                                            {fareDetails.busType}
                                        </p>

                                    </div>

                                    {/* Distance */}
                                    <div className="rounded-xl border border-orange-200/70 bg-white/80 p-4 shadow-[0_4px_0_rgba(234,88,12,0.12)] dark:border-orange-900/40 dark:bg-[#202631]">

                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Selected Journey Distance
                                        </p>

                                        <p className="mt-2 font-bold text-gray-800 dark:text-white">
                                            {fareDetails.distanceInKm} km
                                        </p>

                                    </div>

                                </div>

                                {/* Passenger Count */}
                                <div className="rounded-xl border border-amber-200/70 bg-white/80 p-4 shadow-[0_4px_0_rgba(217,119,6,0.12)] dark:border-amber-900/40 dark:bg-[#202631]">

                                    <div className="flex flex-wrap items-center justify-between gap-3">

                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">
                                                Passengers
                                            </p>

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Select passenger count
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPassengers((prev) =>
                                                        Math.max(1, prev - 1)
                                                    )
                                                }
                                                disabled={passengers <= 1}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300 text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-amber-800 dark:text-amber-400"
                                            >
                                                -
                                            </button>

                                            <span className="min-w-6 text-center font-bold text-gray-900 dark:text-white">
                                                {passengers}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPassengers((prev) => prev + 1)
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_3px_0_#b45309]"
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                </div>

                                {/* Fare Breakdown */}
                                <div className="rounded-xl border border-amber-200/70 bg-white/80 p-4 shadow-[0_4px_0_rgba(217,119,6,0.12)] dark:border-amber-900/40 dark:bg-[#202631]">

                                    <h3 className="mb-4 font-bold text-gray-800 dark:text-white">
                                        Fare Breakdown
                                    </h3>

                                    <div className="space-y-3 text-sm">

                                        {/* Base Fare */}
                                        <div className="flex justify-between gap-3">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Base Fare
                                            </span>

                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                ₹{fareDetails.baseFare}
                                            </span>
                                        </div>

                                        {/* Fare Per KM */}
                                        <div className="flex justify-between gap-3">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Fare Per KM
                                            </span>

                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                ₹{fareDetails.farePerKm}
                                            </span>
                                        </div>

                                        {/* Passengers */}
                                        <div className="flex justify-between gap-3">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Passengers
                                            </span>

                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {fareDetails.passengers}
                                            </span>
                                        </div>

                                        {/* Fare Per Passenger */}
                                        <div className="border-t border-dashed border-amber-300 pt-3 dark:border-amber-900">

                                            <div className="flex justify-between gap-3">

                                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                    Fare Per Passenger
                                                </span>

                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    ₹{Number(fareDetails.farePerPassenger).toFixed(2)}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* Total Fare */}
                                <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white shadow-[0_5px_0_#b45309]">

                                    <p className="text-sm font-medium text-amber-50">
                                        Total Estimated Fare
                                    </p>

                                    <div className="mt-2 flex items-center justify-between gap-3">

                                        <p className="text-3xl font-extrabold">
                                            ₹{Number(fareDetails.totalFare).toFixed(2)}
                                        </p>

                                        <IndianRupee size={30} className="opacity-80" />

                                    </div>

                                </div>

                                {/* Note */}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    * This is an estimated fare based on the selected journey distance and passenger count.
                                </p>

                            </>

                        ) : (

                            /* Empty State */
                            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                Select a valid journey to view fare details.
                            </div>

                        )}

                    </div>

                </div>

            </section>

        </div>
    )
}

export default BusScheduleDetails;