import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import { getStopById, deleteStop } from "../../../services/stopService";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import StopMap from "../../../components/common/StopMap";
import EmptyState from "../../../components/common/EmptyState";
import { getSchedulesByStop } from "../../../services/scheduleService";
import FormattedTime from "../../../components/common/FormattedTime";

const StopDetails = () => {
  let navigate = useNavigate();
  let { id } = useParams();

  let [stop, setStop] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState("");
  let [assignedSchedules, setAssignedSchedules] = useState([]);
  let [scheduleLoading, setScheduleLoading] = useState(false);
  let [scheduleError, setScheduleError] = useState("");

  let fetchAssignedSchedules = async () => {
    try {
      setScheduleLoading(true);

      setScheduleError("");

      let response = await getSchedulesByStop(id);

      let schedule = response.data.data || [];

      setAssignedSchedules(schedule.slice(0, 3));
    } catch (error) {
      setScheduleError(
        error.response?.data?.message || "Failed to get assigned schedules",
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  let fetchStop = async () => {
    try {
      setLoading(true);

      setError("");

      let response = await getStopById(id);

      setStop(response.data.data);

      fetchAssignedSchedules();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get stop");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStop();
  }, [id]);

  if (loading) {
    return <Loading message="Loading Stop Details..." />;
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
      let response = await deleteStop(id);

      toast.success(response.data.message);

      navigate("/admin/stops");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Stop");
    }
  };

  return (
    <div className="p-6">
      {/* Back Button */}

      <div className="mb-6">
        <Button onClick={() => navigate("/admin/stops")}>← Back</Button>
      </div>

      {/* Heading */}

      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Stop Details</h1>
        </div>

        {/* Edit & Delete Button */}

        <div className="flex gap-2">
          <Button onClick={() => navigate(`/admin/stops/${id}/edit`)}>
            Edit
          </Button>

          <Button onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {/* Stop Information */}

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Stop Information
        </h2>

        <div className="border border-gray-300 rounded-lg p-4 space-y-3">
          <p>
            <strong>Stop Name</strong> {stop.stopName}
          </p>

          <p>
            <strong>Latitude</strong> {stop.latitude}
          </p>

          <p>
            <strong>Longitude</strong> {stop.longitude}
          </p>
        </div>
      </div>

      {/* Stop Location */}

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Stop Location
        </h2>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <StopMap
            latitude={stop.latitude}
            longitude={stop.longitude}
            stopName={stop.stopName}
          />
        </div>
      </div>

      {/* Assigned Schedules */}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Bus Schedules
        </h2>

        {scheduleLoading && <Loading message="Loading Assigned Schedules..." />}

        {!scheduleLoading &&
          !scheduleError &&
          assignedSchedules.length === 0 && (
            <EmptyState message="No buses are scheduled for this stop" />
          )}

        {!scheduleLoading && !scheduleError && assignedSchedules.length > 0 && (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-300">
              <div className="p-4 font-semibold text-gray-800">Bus Number</div>

              <div className="p-4 font-semibold text-gray-800">Bus Type</div>

              <div className="p-4 font-semibold text-gray-800">Route Name</div>

              <div className="p-4 font-semibold text-gray-800">
                Expected Arrival Time
              </div>
            </div>

            {assignedSchedules.map((schedule) => {
              let stopSchedule = schedule.stops.find(
                (stopSchedule) => stopSchedule.stopId?._id === id,
              );

              return (
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
                    {schedule?.routeId?.routeName || "-"}
                  </div>

                  <div className="p-4">
                    <FormattedTime
                      value={stopSchedule?.expectedArrivalTime}
                      fallback="-"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StopDetails;
