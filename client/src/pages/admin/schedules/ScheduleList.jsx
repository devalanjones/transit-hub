import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  CalendarDays,
  X,
  Bus as BusIcon,
  Route as RouteIcon,
  Calendar,
} from "lucide-react";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/common/Button";
import Pagination from "../../../components/common/Pagination";
import Select from "../../../components/common/Select";
import Input from "../../../components/common/Input";
import FormattedTime from "../../../components/common/FormattedTime";
import {
  getAllSchedules,
  deleteSchedule,
} from "../../../services/scheduleService";

const ScheduleList = () => {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("All Days");

  const dayOptions = [
    { value: "All Days", label: "All Days" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllSchedules();
      setSchedules(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get Schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (id) => {
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
      setCurrentPage(1);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to Delete Schedule");
    }
  };

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

  if (loading) {
    return <Loading message="Loading Schedule..." />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="No Schedules Found"
          message="You haven't added any schedules yet. Create your first schedule to start operations."
          buttonText="Create Schedule"
          icon={CalendarDays}
          onClick={() => navigate("/admin/schedules/create")}
        />
      </div>
    );
  }

  const filteredSchedules = schedules.filter((schedule) => {
    const busNumber = schedule.busId?.busRegNumber?.toLowerCase() || "";
    const routeName = schedule.routeId?.routeName?.toLowerCase() || "";
    const searchValue = search.toLowerCase();

    const matchesSearch =
      busNumber.includes(searchValue) || routeName.includes(searchValue);

    const matchesDay =
      selectedDay === "All Days" || schedule.days?.includes(selectedDay);

    return matchesSearch && matchesDay;
  });

  const schedulesPerPage = 10;
  const totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage);
  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = filteredSchedules.slice(
    indexOfFirstSchedule,
    indexOfLastSchedule,
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <CalendarDays size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Schedules
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredSchedules.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            Manage daily and weekly transit timetables, bus assignments, and
            route dispatches.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/admin/schedules/create")}
          className="w-fit"
        >
          <Plus size={18} />
          <span>Add Schedule</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400"
          />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search bus number or route..."
            className="pl-10 pr-10 dark:text-white dark:placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Day Filter */}
        <div className="w-full sm:w-56">
          <Select
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setCurrentPage(1);
            }}
            options={dayOptions}
          />
        </div>
      </div>

      {/* Main Table Container Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        {filteredSchedules.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Results Found"
              message="No schedules match your search keywords or day filter. Try selecting 'All Days' or using a different search term."
              icon={Search}
            />
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm text-slate-700 dark:text-slate-200">
                <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Bus Information
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Route 
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Departure
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Arrival
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Operating Days
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                  {currentSchedules.map((schedule) => (
                    <tr
                      key={schedule._id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* Bus Details */}
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <BusIcon
                            size={16}
                            className="text-orange-500 shrink-0"
                          />
                          <span>{schedule.busId?.busRegNumber || "N/A"}</span>
                        </div>
                        {schedule.busId?.busName && (
                          <span className="block text-xs font-normal text-slate-500 dark:text-slate-300">
                            {schedule.busId.busName}
                          </span>
                        )}
                      </td>

                      {/* Route Name */}
                      <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <RouteIcon
                            size={14}
                            className="text-slate-400 dark:text-slate-400 shrink-0"
                          />
                          <span className="truncate">
                            {schedule.routeId?.routeName || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Departure */}
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                        <FormattedTime
                          value={schedule.departureTime}
                          fallback="-"
                        />
                      </td>

                      {/* Arrival */}
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                        <FormattedTime
                          value={schedule.arrivalTime}
                          fallback="-"
                        />
                      </td>

                      {/* Days */}
                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Calendar
                            size={13}
                            className="text-orange-500 shrink-0"
                          />
                          <span
                            className="truncate max-w-[140px]"
                            title={schedule.days?.join(", ")}
                          >
                            {schedule.days?.length === 7
                              ? "Everyday"
                              : schedule.days?.join(", ") || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                            schedule.status,
                          )}`}
                        >
                          {schedule.status
                            ? schedule.status.replace("_", " ")
                            : "-"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              navigate(`/admin/schedules/${schedule._id}`)
                            }
                            className="px-2.5"
                            title="View Schedule"
                          >
                            <Eye size={15} />
                            <span className="hidden lg:inline">View</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              navigate(`/admin/schedules/${schedule._id}/edit`)
                            }
                            className="px-2.5"
                            title="Edit Schedule"
                          >
                            <Edit3 size={15} />
                            <span className="hidden lg:inline">Edit</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(schedule._id)}
                            className="px-2.5"
                            title="Delete Schedule"
                          >
                            <Trash2 size={15} />
                            <span className="hidden lg:inline">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
