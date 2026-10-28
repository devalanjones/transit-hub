import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BusFront, Clock, MapPin, Search, } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllStops } from "../../services/stopService";
import { searchSchedules } from "../../services/scheduleService";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loading from "../../components/common/Loading";


const formatTime = (value) => {
    if (!value) return "N/A";

    const data = new Date(value);
    if (Number.isNaN(data.getTime())) return "N/A";

    return data.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatDuration = (startValue, endValue) => {
    if (!startValue || !endValue) return "N/A";

    const start = new Date(startValue).getTime();
    const end = new Date(endValue).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) return "N/A";

    let difference = end - start;
    if (difference < 0) difference += 24 * 60 * 60 * 1000;

    const totalMinutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const getBusTypeName = (busType) => {
    if (!busType) return "Bus type unavailable";
    if (typeof busType === "string") return busType;

    return (
        busType.busType ||
        busType.typeName ||
        busType.name ||
        busType.busTypeName ||
        "Bus type unavailable"
    );
};

const mapScheduleToBus = (schedule) => {
    const bus = schedule.bus || schedule.busId || {};
    const route = schedule.route || schedule.routeId || {};
    const origin = schedule.tripSegment?.origin || {};
    const destination = schedule.tripSegment?.destination || {};
    const originStop = origin.stop || {};
    const destinationStop = destination.stop || {};

    const routeName =
        route.routeName ||
        `${route.source?.name || originStop.stopName || "Origin"}-${route.destination?.name || destinationStop.stopName || "Destination"
        }`;

    console.log("Backend schedule:", schedule);

    return {
        id: schedule._id,
        busNumber: bus.busRegNumber || bus.busName || bus.busNumber || "Bus number unavailable",
        busType: getBusTypeName(bus.busType),
        routeName,
        departureTime: formatTime(origin.expectedArrivalTime),
        arrivalTime: formatTime(destination.expectedArrivalTime),
        duration: formatDuration(
            origin.expectedArrivalTime,
            destination.expectedArrivalTime
        ),
        days: schedule.days || [],
        status: schedule.status,
    };
};

const weekDays = [
    { key: "Monday", letter: "M" },
    { key: "Tuesday", letter: "T" },
    { key: "Wednesday", letter: "W" },
    { key: "Thursday", letter: "T" },
    { key: "Friday", letter: "F" },
    { key: "Saturday", letter: "S" },
    { key: "Sunday", letter: "S" },
];

const BusSchedule = () => {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";


    useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true);
            setError("");
            setBuses([]);

            try {
                if (!from || !to) {
                    setError(
                        "Please select both a starting location and a destination from the Home page."
                    );
                    return;
                }

                const stopResponse = await getAllStops();
                const stops = stopResponse.data?.data || [];

                const normalizedFrom = from.trim().toLowerCase();
                const normalizedTo = to.trim().toLowerCase();

                const fromStop = stops.find(
                    (stop) =>
                        stop.stopName?.trim().toLowerCase() === normalizedFrom
                );

                const toStop = stops.find(
                    (stop) =>
                        stop.stopName?.trim().toLowerCase() === normalizedTo
                );

                if (normalizedFrom === normalizedTo) {
                    setError("Please select two different locations.");
                    return;
                }

                // Use Stop IDs when both locations are registered stops.
                // Otherwise, send the selected names so the backend can
                // match route source/destination endpoints.
                const searchFrom = fromStop ? fromStop._id : from.trim();
                const searchTo = toStop ? toStop._id : to.trim();

                const scheduleResponse = await searchSchedules(
                    searchFrom,
                    searchTo
                );

                const schedules = scheduleResponse.data?.data || [];
                setBuses(schedules.map(mapScheduleToBus));

                if (schedules.length === 0) {
                    setError("");
                }
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                    "Unable to load bus schedule. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [from, to]);

    const filteredBuses = buses.filter((bus) =>
        `${bus.busNumber} ${bus.busType}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">

            {/* Back Button */}
            <div>
                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/25 sm:w-auto"
                >
                    <ArrowLeft size={18} />
                    Back
                </Button>
            </div>

            {/* Journey Summary */}
            <section className="relative overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-br from-[#d1fae5] via-[#ccfbf1] to-[#a5f3fc] p-6 shadow-lg shadow-teal-200/20 sm:p-8 dark:border-teal-700/50 dark:from-[#123c3b] dark:via-[#07545b] dark:to-[#064e49]">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />

                <div className="relative">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                                <BusFront size={21} />
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                                    TransitHub
                                </p>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Your Journey
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 dark:border-blue-800 dark:bg-blue-950/40">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {loading ? "Loading buses..." : `${filteredBuses.length} buses found`}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                        <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-[3px] border-blue-500 bg-white dark:bg-[#182331]" />
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    From
                                </p>
                            </div>

                            <h3 className="break-words text-lg font-bold leading-snug text-gray-900 dark:text-white sm:text-2xl">
                                {from || "All locations"}
                            </h3>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div className="h-px w-8 bg-blue-300 dark:bg-blue-700 sm:w-14" />
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm dark:border-blue-800 dark:bg-[#182331] dark:text-blue-400">
                                <ArrowRight size={20} />
                            </div>
                            <div className="h-px w-8 bg-blue-300 dark:bg-blue-700 sm:w-14" />
                        </div>

                        <div className="min-w-0 text-right">
                            <div className="mb-2 flex items-center justify-end gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    To
                                </p>
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/60" />
                            </div>

                            <h3 className="break-words text-lg font-bold leading-snug text-gray-900 dark:text-white sm:text-2xl">
                                {to || "All destinations"}
                            </h3>
                        </div>
                    </div>

                    <div className="mt-7 border-t border-blue-200/80 pt-4 dark:border-blue-900/60">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Find the right bus for your journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bus Search */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                        Find Your Bus
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Search using a bus number or bus type.
                    </p>
                </div>

                <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-gray-700 dark:bg-[#111821] dark:focus-within:border-blue-500">
                    <div className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-focus-within:bg-blue-600 group-focus-within:text-white dark:bg-blue-950/60 dark:text-blue-400">
                        <Search size={21} />
                    </div>

                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Enter bus number or bus type..."
                        aria-label="Search by bus number or bus type"
                        className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                    />

                    {searchTerm && (
                        <Button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            aria-label="Clear bus search"
                            className="mr-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </section>

            {/* Available Buses */}
            <section className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                            Available Buses
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {loading
                                ? "Loading available schedules..."
                                : `${filteredBuses.length} matching ${filteredBuses.length === 1 ? "bus" : "buses"
                                }${searchTerm ? " for your search" : ""}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <BusFront size={17} />
                        <span>Bus schedules</span>
                    </div>
                </div>

                {loading ? (
                    <Loading />
                ) : error ? (
                    <div
                        role="alert"
                        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200"
                    >
                        <ErrorMessage message={error} />
                    </div>
                ) : filteredBuses.length > 0 ? (
                    <div className="space-y-5">
                        {filteredBuses.map((bus) => (
                            <article
                                key={bus.id}
                                className="group overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-[#d1fae5] via-[#ccfbf1] to-[#a5f3fc] shadow-md shadow-teal-200/20 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-300/20 dark:border-teal-700/50 dark:bg-gradient-to-br dark:from-[#123c3b] dark:via-[#07545b] dark:to-[#064e49]"
                            >
                                {/* Card Header */}
                                <div className="p-5 sm:p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-600/20">
                                            <BusFront size={27} />
                                        </div>
                                        {/* Bus Information */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="break-words text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                                                            {bus.busNumber}
                                                        </h3>

                                                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300">
                                                            {bus.busType}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex shrink-0 items-center rounded-full border px-3 py-2 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${bus.status === "ON_TIME"
                                                        ? "border-green-300 bg-green-50 text-green-700 [text-shadow:none] dark:border-emerald-500/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:[text-shadow:0_0_8px_rgba(52,211,153,0.8)]"
                                                        : bus.status === "DELAYED"
                                                            ? "border-amber-300 bg-amber-50 text-amber-700 [text-shadow:none] dark:border-amber-500/80 dark:bg-amber-950/60 dark:text-amber-300 dark:[text-shadow:0_0_8px_rgba(251,191,36,0.8)]"
                                                            : bus.status === "CANCELLED"
                                                                ? "border-red-300 bg-red-50 text-red-700 [text-shadow:none] dark:border-red-500/80 dark:bg-red-950/60 dark:text-red-300 dark:[text-shadow:0_0_8px_rgba(248,113,113,0.8)]"
                                                                : bus.status === "COMPLETED"
                                                                    ? "border-slate-300 bg-slate-50 text-slate-700 [text-shadow:none] dark:border-slate-500/80 dark:bg-slate-900/60 dark:text-slate-200 dark:[text-shadow:0_0_8px_rgba(203,213,225,0.6)]"
                                                                    : "border-blue-300 bg-blue-50 text-blue-700 [text-shadow:none] dark:border-blue-500/80 dark:bg-blue-950/60 dark:text-blue-300 dark:[text-shadow:0_0_8px_rgba(96,165,250,0.8)]"
                                                        }`}
                                                >
                                                    {bus.status?.replace(/_/g, " ") || "UNKNOWN"}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <MapPin
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-blue-500"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                        Complete bus route
                                                    </p>

                                                    <p className="mt-1 break-words font-medium leading-relaxed">
                                                        {bus.routeName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Operating Days */}
                                            <div className="mt-4 flex w-full items-center justify-center gap-2">
                                                {weekDays.map((day, index) => {
                                                    const isRunning = (bus.days || []).includes(day.key);

                                                    return (
                                                        <span
                                                            key={`${day.key}-${index}`}
                                                            title={day.key}
                                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isRunning
                                                                ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                                                : "bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600"
                                                                }`}
                                                        >
                                                            {day.letter}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Journey */}
                                    <div className="border-y border-teal-200/50 bg-transparent px-5 py-5 dark:border-teal-700/50 sm:px-6">
                                        <div className="mb-5 flex items-center gap-2">
                                            <Clock size={16} className="text-blue-500" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Your selected journey
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                                            <div className="min-w-0">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        Departure
                                                    </p>
                                                </div>

                                                <p className="break-words text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                                                    {bus.departureTime}
                                                </p>

                                                <p className="mt-1 break-words text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-sm">
                                                    {from || "Selected stop"}
                                                </p>
                                            </div>

                                            <div className="flex min-w-[76px] flex-col items-center gap-2 px-1 sm:min-w-[110px]">
                                                <span className="whitespace-nowrap rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm dark:border-blue-900/70 dark:bg-[#182331] dark:text-blue-300 sm:text-sm">
                                                    {bus.duration}
                                                </span>

                                                <div className="relative flex w-full items-center">
                                                    <div className="h-px w-full border-t-2 border-dashed border-blue-300 dark:border-blue-800" />
                                                    <ArrowRight
                                                        size={17}
                                                        className="absolute right-0 bg-gray-50 text-blue-500 dark:bg-[#0d141d]"
                                                    />
                                                </div>

                                                <p className="text-center text-[10px] font-medium leading-relaxed text-gray-400 dark:text-gray-500 sm:text-xs">
                                                    Journey time
                                                </p>
                                            </div>

                                            <div className="min-w-0 text-right">
                                                <div className="mb-2 flex items-center justify-end gap-2">
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        Arrival
                                                    </p>
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                </div>

                                                <p className="break-words text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                                                    {bus.arrivalTime}
                                                </p>

                                                <p className="mt-1 break-words text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-sm">
                                                    {to || "Selected stop"}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2.5 text-xs leading-relaxed text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300">
                                            <Clock size={14} className="mr-1.5 inline" />
                                            Journey duration is for your selected From and To locations only.
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="flex items-center justify-end p-5 sm:px-6">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                // Bus Details navigation will be added next.
                                            }}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/25 sm:w-auto"
                                        >
                                            View Bus Details
                                            <ArrowRight
                                                size={18}
                                                className="transition-transform duration-200 group-hover:translate-x-1"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="w-full py-8">
                        <EmptyState
                            icon={BusFront}
                            title={
                                searchTerm
                                    ? "No buses found"
                                    : "No buses available"
                            }
                            message={
                                searchTerm
                                    ? "We couldn't find a bus matching your search. Try a different bus number or bus type."
                                    : "No buses are available for this journey. Please try a different starting point or destination."
                            }
                            action={
                                searchTerm ? (
                                    <Button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        Clear Search
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                )}
            </section>
        </div>
    );

};

export default BusSchedule;