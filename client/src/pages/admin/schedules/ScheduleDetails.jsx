import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  CalendarDays,
  Bus as BusIcon,
  Route as RouteIcon,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";

import {
  deleteSchedule,
  getScheduleById,
} from "../../../services/scheduleService";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/common/Button";
import FormattedTime from "../../../components/common/FormattedTime";
import ScheduleMap from "../../../components/shedule/ScheduleMap";

const ScheduleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getScheduleById(id);
        setSchedule(response.data?.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load Schedule details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  if (loading) {
    return <Loading message="Loading Schedule Details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/schedules")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Schedules</span>
        </Button>
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/schedules")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Schedules</span>
        </Button>
        <EmptyState
          title="Schedule Not Found"
          message="The requested transit schedule could not be located."
          icon={CalendarDays}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316", // orange-500
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteSchedule(id);
      toast.success(response.data?.message || "Schedule deleted successfully");
      navigate("/admin/schedules");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete schedule");
    }
  };

  const bus = schedule.busId;
  const route = schedule.routeId;
  const sortedStops = [...(schedule.stops || [])].sort(
    (a, b) => a.stopSequence - b.stopSequence,
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "ON_TIME":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "DELAYED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/schedules")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Schedules</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/schedules/${id}/edit`)}
          >
            <Edit3 size={16} />
            <span>Edit</span>
          </Button>

          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Page Title & Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <CalendarDays size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Schedule Details
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Timetable, fleet allocation, and intermediate route stops
          </p>
        </div>
      </div>

      {/* 1. Bus Information Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <BusIcon size={18} className="text-orange-500" />
          <span>Bus Information</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Bus Number
            </span>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {bus?.busRegNumber || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Bus Name
            </span>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {bus?.busName || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Bus Type
            </span>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {bus?.busType?.busType || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Bus Status
            </span>
            <div className="mt-1.5 flex items-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  bus?.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    bus?.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {bus?.status
                  ? bus.status.charAt(0).toUpperCase() + bus.status.slice(1)
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Route Information Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <RouteIcon size={18} className="text-orange-500" />
          <span>Route</span>
        </h2>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
            Route  Name
          </span>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">
            {route?.routeName || "-"}
          </p>
        </div>
      </div>

      {/* 3. Interactive Route Map Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <MapPin size={18} className="text-orange-500" />
          <span>Route Map</span>
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <ScheduleMap stops={sortedStops} />
        </div>
      </div>

      {/* 4. Stops Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Stops Sequence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Ordered list of intermediate stations and arrival timings
            </p>
          </div>

          {sortedStops.length > 0 && (
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              {sortedStops.length} Stops
            </span>
          )}
        </div>

        {sortedStops.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Sequence
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Stop Name
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Expected Arrival Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                {sortedStops.map((stop) => (
                  <tr
                    key={`${stop.stopId?._id}-${stop.stopSequence}`}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                        {stop.stopSequence}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {stop.stopId?.stopName || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <FormattedTime
                        value={stop.expectedArrivalTime}
                        fallback="-"
                        className="font-medium text-slate-900 dark:text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Stops Configured"
            message="No stops are currently assigned to this schedule."
            icon={MapPin}
          />
        )}
      </div>

      {/* 5. Schedule Information Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <Clock size={18} className="text-orange-500" />
          <span>Schedule Information</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Departure */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Departure Time
            </span>
            <div className="mt-1">
              <FormattedTime
                value={schedule.departureTime}
                fallback="-"
                className="font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Arrival */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Arrival Time
            </span>
            <div className="mt-1">
              <FormattedTime
                value={schedule.arrivalTime}
                fallback="-"
                className="font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Operating Days */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              <Calendar size={13} className="text-orange-500" />
              <span>Days</span>
            </div>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {schedule.days?.length ? schedule.days.join(", ") : "-"}
            </p>
          </div>

          {/* Status */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Status
            </span>
            <div className="mt-1.5 flex items-center">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                  schedule.status,
                )}`}
              >
                {schedule.status ? schedule.status.replace("_", " ") : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetails;
