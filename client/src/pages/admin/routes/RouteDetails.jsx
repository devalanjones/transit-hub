import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Route as RouteIcon,
  MapPin,
  CalendarDays,
  Bus as BusIcon,
} from "lucide-react";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import FormattedTime from "../../../components/common/FormattedTime";
import { deleteRoute, getRouteById } from "../../../services/routeService";
import { getSchedulesByRoute } from "../../../services/scheduleService";

const RouteDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignedSchedules, setAssignedSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const fetchAssignedSchedules = async () => {
    try {
      setScheduleLoading(true);
      setScheduleError("");
      const response = await getSchedulesByRoute(id);
      const schedule = response.data?.data || [];
      setAssignedSchedules(schedule.slice(0, 3));
    } catch (err) {
      setScheduleError(
        err.response?.data?.message || "Failed to get bus schedules",
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchRoute = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getRouteById(id);
      setRoute(response.data?.data);
      fetchAssignedSchedules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get route");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [id]);

  if (loading) {
    return <Loading message="Loading Route Details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/routes")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Routes</span>
        </Button>
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316", // orange-500
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteRoute(id);
      toast.success(response.data?.message || "Route deleted successfully");
      navigate("/admin/routes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to Delete Route");
    }
  };

  // Support both string primitives and populated object references
  const sourceName =
    typeof route?.source === "object"
      ? route?.source?.name || "-"
      : route?.source || "-";

  const destinationName =
    typeof route?.destination === "object"
      ? route?.destination?.name || "-"
      : route?.destination || "-";

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/routes")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Routes</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/routes/${id}/edit`)}
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
          <RouteIcon size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {route?.routeName || "Route Details"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Route corridor and assigned schedule breakdown
          </p>
        </div>
      </div>

      {/* Route Information Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Route Information
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Route Name */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Route Name
            </span>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {route?.routeName || "-"}
            </p>
          </div>

          {/* Source */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              <MapPin size={14} className="text-emerald-500" />
              <span>Source </span>
            </div>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {sourceName}
            </p>
          </div>

          {/* Destination */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              <MapPin size={14} className="text-orange-500" />
              <span>Destination</span>
            </div>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {destinationName}
            </p>
          </div>
        </div>
      </div>

      {/* Assigned Schedules Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Assigned Bus Schedules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Buses running on this transit line
            </p>
          </div>

          {assignedSchedules.length > 0 && (
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              {assignedSchedules.length} Assigned
            </span>
          )}
        </div>

        {scheduleLoading && <Loading message="Loading Assigned Schedules..." />}

        {!scheduleLoading && scheduleError && (
          <ErrorMessage variant="banner" message={scheduleError} />
        )}

        {!scheduleLoading &&
          !scheduleError &&
          assignedSchedules.length === 0 && (
            <EmptyState
              title="No Assigned Schedules"
              message="There are no active bus schedules assigned to this route yet."
              icon={CalendarDays}
            />
          )}

        {!scheduleLoading && !scheduleError && assignedSchedules.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Bus Registration
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Bus Type
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Departure
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Arrival
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                {assignedSchedules.map((schedule) => (
                  <tr
                    key={schedule._id}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <BusIcon
                          size={16}
                          className="text-orange-500 shrink-0"
                        />
                        <span>{schedule?.busId?.busRegNumber || "-"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-800 dark:text-slate-200">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {schedule?.busId?.busType?.busType || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                      <FormattedTime
                        value={schedule.departureTime}
                        fallback="-"
                      />
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                      <FormattedTime
                        value={schedule.arrivalTime}
                        fallback="-"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteDetails;
