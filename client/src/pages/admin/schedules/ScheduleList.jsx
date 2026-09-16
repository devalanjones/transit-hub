import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Swal from "sweetalert2";
import { toast } from "sonner";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/common/Button";
import Pagination from "../../../components/common/Pagination";
import Select from "../../../components/common/Select";
import Input from "../../../components/common/Input";
import {
  getAllSchedules,
  deleteSchedule,
} from "../../../services/scheduleService";
import FormattedTime from "../../../components/common/FormattedTime";

const ScheduleList = () => {
  let navigate = useNavigate();

  let [schedules, setSchedules] = useState([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState("");
  let [currentPage, setCurrentPage] = useState(1);
  let [search, setSearch] = useState("");
  let [selectedDay, setSelectedDay] = useState("All Days");

  let dayOptions = [
    { value: "All Days", label: "All Days" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  let fetchSchedules = async () => {
    try {
      setLoading(true);

      setError("");

      let response = await getAllSchedules();

      setSchedules(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get Schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) {
    return <Loading message="Loading Schedule..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  let handleDelete = async (id) => {
    let result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      let response = await deleteSchedule(id);

      toast.success(response.data.message);

      setCurrentPage(1);

      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Schedule");
    }
  };

  if (schedules.length === 0) {
    return (
      <EmptyState
        title="No Schedules Found"
        message="You Haven't Added Any Schedules yet. Create First Schedule"
        buttonText="Create Schedule"
        onClick={() => navigate("/admin/schedules/create")}
        icon="🗓️"
      />
    );
  }

  let filteredSchedules = schedules.filter((schedule) => {
    let busNumber = schedule.busId?.busRegNumber?.toLowerCase() || "";

    let routeName = schedule.routeId?.routeName?.toLowerCase() || "";

    let searchValue = search.toLowerCase();

    let matchesSearch =
      busNumber.includes(searchValue) || routeName.includes(searchValue);

    let matchesDay =
      selectedDay === "All Days" || schedule.days?.includes(selectedDay);

    return matchesSearch && matchesDay;
  });

  let schedulesPerPage = 10;

  let indexOfLastSchedule = currentPage * schedulesPerPage;

  let indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;

  let currentSchedules = filteredSchedules.slice(
    indexOfFirstSchedule,
    indexOfLastSchedule,
  );

  let totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Schedule List</h1>

        <Button onClick={() => navigate("/admin/schedules/create")}>
          Add Schedule
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search Bus Number Or Route Name..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-96"
        />

        <Select
          value={selectedDay}
          onChange={(e) => {
            setSelectedDay(e.target.value);
            setCurrentPage(1);
          }}
          options={dayOptions}
          className="md:w-52"
        />
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        {filteredSchedules.length === 0 ? (
          <EmptyState
            title="No Result Found"
            message="No schedules match your search or selected day. Try different filters"
            icon="🗓️"
          />
        ) : (
          <>
            <table className="w-full min-w-[1000px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Bus Number
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Route Name
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Departure Time
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Arrival Time
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Days
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentSchedules.map((schedule) => (
                  <tr key={schedule._id}>
                    <td className="border border-gray-300 px-4 py-3">
                      {schedule.busId?.busRegNumber || "N/A"}
                    </td>

                    <td className="border border-gray-300 px-4 py-3">
                      {schedule.routeId?.routeName || "N/A"}
                    </td>

                    <td className="border border-gray-300 px-4 py-3">
                      <FormattedTime value={schedule.departureTime} />
                    </td>

                    <td className="border border-gray-300 px-4 py-3">
                      <FormattedTime value={schedule.arrivalTime} />
                    </td>

                    <td className="border border-gray-300 px-4 py-3">
                      {schedule.days?.join(", ") || "N/A"}
                    </td>

                    <td className="border border-gray-300 px-4 py-3">
                      {schedule.status}
                    </td>

                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          onClick={() =>
                            navigate(`/admin/schedules/${schedule._id}`)
                          }
                        >
                          View
                        </Button>

                        <Button
                          onClick={() =>
                            navigate(`/admin/schedules/${schedule._id}/edit`)
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          onClick={() => handleDelete(schedule._id)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
