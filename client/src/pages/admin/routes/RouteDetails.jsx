import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { deleteRoute, getRouteById } from "../../../services/routeService";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import { getSchedulesByRoute } from "../../../services/scheduleService";
import FormattedTime from "../../../components/common/FormattedTime";

const RouteDetails = () => {
  let navigate = useNavigate();
  let { id } = useParams();

  let [route, setRoute] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState("");
  let [assignedSchedules, setAssignedSchedules] = useState([]);
  let [scheduleLoading, setScheduleLoading] = useState(false);
  let [scheduleError, setScheduleError] = useState("");

  let fetchAssignedSchedules = async () => {
    try {
      setScheduleLoading(true);

      setScheduleError("");

      let response = await getSchedulesByRoute(id);

      let schedule = response.data.data || [];

      setAssignedSchedules(schedule.slice(0, 3));
    } catch (error) {
      setScheduleError(
        error.response?.data?.message || "Failed to get bus schedules",
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  let fetchRoute = async () => {
    try {
      setLoading(true);

      setError("");

      let response = await getRouteById(id);

      setRoute(response.data.data);

      fetchAssignedSchedules();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get route");
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
    return <ErrorMessage message={error} />;
  }

  let handleDelete = async () => {
    let result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      let response = await deleteRoute(id);

      toast.success(response.data.message);

      navigate("/admin/routes");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Route");
    }
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={() => navigate("/admin/routes")}>← Back</Button>
      </div>

      {/* Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Route Details</h1>
        </div>

        {/* Edit & Delete Button */}
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/admin/routes/${id}/edit`)}>
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Route Information */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Route Information
        </h2>

        <div className="space-y-3 rounded-lg border border-gray-300 p-4">
          <p>
            <strong>Route Name:</strong> {route.routeName}
          </p>
          <p>
            <strong>Source:</strong> {route.source}
          </p>
          <p>
            <strong>Destination:</strong> {route.destination}
          </p>
        </div>
      </div>

      {/* Assigned Schedule */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Assigned Bus Schedule
        </h2>

        {scheduleLoading && <Loading message="Loading Assigned Schedules..." />}

        {!scheduleLoading && scheduleError && (
          <ErrorMessage message={scheduleError} />
        )}

        {!scheduleLoading &&
          !scheduleError &&
          assignedSchedules.length === 0 && (
            <EmptyState
              message="No assigned bus schedule for this route"
              icon="🛣️"
            />
          )}

        {!scheduleLoading && !scheduleError && assignedSchedules.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="grid grid-cols-4 border-b border-gray-300 bg-gray-100">
              <div className="p-4 font-semibold text-gray-800">Bus Number</div>
              <div className="p-4 font-semibold text-gray-800">Bus Type</div>
              <div className="p-4 font-semibold text-gray-800">Departure</div>
              <div className="p-4 font-semibold text-gray-800">Arrival</div>
            </div>

            {assignedSchedules.map((schedule) => (
              <div
                key={schedule._id}
                className="grid grid-cols-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="p-4">
                  {schedule?.busId?.busRegNumber || "-"}
                </div>

                <div className="p-4">
                  {schedule?.busId?.busType?.busType || "-"}
                </div>

                <div className="p-4">
                  <FormattedTime value={schedule.departureTime} fallback="-" />
                </div>

                <div className="p-4">
                  <FormattedTime value={schedule.arrivalTime} fallback="-" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default RouteDetails;
