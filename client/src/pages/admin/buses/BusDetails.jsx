import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  CalendarDays,
  Bus,
  Bus as BusIcon,
} from "lucide-react";

import Button from "../../../components/common/Button";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import FormattedTime from "../../../components/common/FormattedTime";
import { getBusById, deleteBus } from "../../../services/busService";
import { getAssignedSchedulesByBus } from "../../../services/scheduleService";

const BusDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignedSchedules, setAssignedSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const fetchAssignedSchedules = async () => {
    try {
      setScheduleLoading(true);
      setScheduleError("");
      const response = await getAssignedSchedulesByBus(id);
      const schedules = response.data.data || [];
      setAssignedSchedules(schedules);
    } catch (err) {
      setScheduleError(
        err.response?.data?.message || "Failed to get assigned schedule",
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchBus = async () => {
    try {
      setLoading(true);
      const response = await getBusById(id);
      const busData = response.data.data;
      setBus(busData);
      setError("");

      if (busData.status === "active") {
        fetchAssignedSchedules();
      } else {
        setAssignedSchedules([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get bus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBus();
  }, [id]);

  if (loading) {
    return <Loading message="Loading Bus Details..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ea580c",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteBus(id);
      toast.success(response.data?.message || "Bus deleted successfully");
      navigate("/admin/buses");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to Delete Bus");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/buses")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Buses</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/buses/${id}/edit`)}
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

      {/* Page Title & Main Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <BusIcon size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {bus.busName}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {bus.busRegNumber}
          </p>
        </div>
      </div>

      {/* Bus Information Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Bus Information
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Reg Number */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registration Number
            </span>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {bus.busRegNumber}
            </p>
          </div>

          {/* Name */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bus Name
            </span>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {bus.busName}
            </p>
          </div>

          {/* Type */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bus Type
            </span>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {bus?.busType?.busType || "-"}
            </p>
          </div>

          {/* Status Badge */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Operational Status
            </span>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bus.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${bus.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                />
                {bus.status
                  ? bus.status.charAt(0).toUpperCase() + bus.status.slice(1)
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Schedules Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Assigned Schedules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing active route assignments
            </p>
          </div>

          {assignedSchedules.length > 0 && (
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              {assignedSchedules.length} Assigned
            </span>
          )}
        </div>

        {bus.status !== "active" ? (
          <EmptyState
            title="Bus Inactive"
            message="This bus is currently inactive. No scheduled routes are operating."
            icon="🗓️"
          />
        ) : (
          <>
            {scheduleLoading && (
              <Loading message="Loading Assigned Schedules..." />
            )}

            {!scheduleLoading && scheduleError && (
              <ErrorMessage variant="banner" message={scheduleError} />
            )}

            {!scheduleLoading &&
              !scheduleError &&
              assignedSchedules.length === 0 && (
                <EmptyState
                  title="No Schedules Found"
                  message="There are no route schedules currently assigned to this bus."
                  icon={Bus}
                />
              )}

            {!scheduleLoading &&
              !scheduleError &&
              assignedSchedules.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
                  {/* Small Screen Cards */}
                  <div className="divide-y divide-slate-200/80 dark:divide-slate-800 sm:hidden">
                    {assignedSchedules.slice(0, 3).map((schedule) => (
                      <div
                        key={schedule._id}
                        className="space-y-2.5 p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Route
                          </span>
                          <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">
                            {schedule?.routeId?.routeName || "-"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/50">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Departure
                          </span>
                          <FormattedTime
                            value={schedule.departureTime}
                            fallback="-"
                            className="text-xs font-medium text-slate-800 dark:text-slate-200"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Arrival
                          </span>
                          <FormattedTime
                            value={schedule.arrivalTime}
                            fallback="-"
                            className="text-xs font-medium text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tablet & Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                        <tr>
                          <th
                            scope="col"
                            className="px-5 py-3.5 whitespace-nowrap"
                          >
                            Route
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3.5 whitespace-nowrap"
                          >
                            Departure
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3.5 whitespace-nowrap"
                          >
                            Arrival
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                        {assignedSchedules.slice(0, 3).map((schedule) => (
                          <tr
                            key={schedule._id}
                            className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              {schedule?.routeId?.routeName || "-"}
                            </td>
                            <td className="px-5 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              <FormattedTime
                                value={schedule.departureTime}
                                fallback="-"
                              />
                            </td>
                            <td className="px-5 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
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
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusDetails;
