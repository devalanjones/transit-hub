import Button from "../../../components/common/Button";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import { getBusById, deleteBus } from "../../../services/busService";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "sonner";
import EmptyState from "../../../components/common/EmptyState";
import { getAssignedSchedulesByBus } from "../../../services/scheduleService";
import FormattedTime from "../../../components/common/FormattedTime";

const BusDetails = () => {
  let navigate = useNavigate();
  let { id } = useParams();

  let [bus, setBus] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState("");
  let [assignedSchedules, setAssignedSchedules] = useState([]);
  let [scheduleLoading, setScheduleLoading] = useState(false);
  let [scheduleError, setScheduleError] = useState("");

  let fetchAssignedSchedules = async () => {
    try {
      setScheduleLoading(true);
      setScheduleError("");
      let response = await getAssignedSchedulesByBus(id);
      let schedules = response.data.data || [];
      setAssignedSchedules(schedules.slice(0, 3));
    } catch (error) {
      setScheduleError(
        error.response?.data?.message || "Failed to get assigned schedule",
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  let fetchBus = async () => {
    try {
      setLoading(true);
      let response = await getBusById(id);
      let busData = response.data.data;
      setBus(busData);
      setError("");

      if (busData.status === "active") {
        fetchAssignedSchedules();
      } else {
        setAssignedSchedules([]);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get bus");
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
      let response = await deleteBus(id);
      toast.success(response.data.message);
      navigate("/admin/buses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Bus");
    }
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={() => navigate("/admin/buses")}>← Back</Button>
      </div>

      {/* Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Bus Details</h1>
        </div>

        {/* Edit & Delete button */}
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/admin/buses/${id}/edit`)}>
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

      {/* Bus Information */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Bus Information
        </h2>

        <div className="space-y-3 rounded-lg border border-gray-300 p-4">
          <p>
            <strong>Bus Number:</strong> {bus.busRegNumber}
          </p>
          <p>
            <strong>Bus Name:</strong> {bus.busName}
          </p>
          <p>
            <strong>Bus Type:</strong> {bus?.busType?.busType || "-"}
          </p>
          <p>
            <strong>Bus Status:</strong> {bus.status}
          </p>
        </div>
      </div>

      {/* Assigned Schedules */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Assigned Schedules
        </h2>

        {bus.status !== "active" && (
          <EmptyState
            message="This bus is inactive. No assigned schedules are available."
            icon="🗓️"
          />
        )}

        {bus.status === "active" && (
          <>
            {scheduleLoading && (
              <Loading message="Loading Assigned Schedule..." />
            )}

            {!scheduleLoading && scheduleError && (
              <ErrorMessage message={scheduleError} />
            )}

            {!scheduleLoading &&
              !scheduleError &&
              assignedSchedules.length === 0 && (
                <EmptyState
                  message="No assigned schedules for this bus"
                  icon="🗓️"
                />
              )}

            {!scheduleLoading &&
              !scheduleError &&
              assignedSchedules.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <div className="grid grid-cols-3 border-b border-gray-300 bg-gray-100">
                    <div className="p-4 font-semibold text-gray-800">Route</div>
                    <div className="p-4 font-semibold text-gray-800">
                      Departure
                    </div>
                    <div className="p-4 font-semibold text-gray-800">
                      Arrival
                    </div>
                  </div>

                  {assignedSchedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="grid grid-cols-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="p-4">
                        {schedule?.routeId?.routeName || "-"}
                      </div>
                      <div className="p-4">
                        <FormattedTime
                          value={schedule.departureTime}
                          fallback="-"
                        />
                      </div>
                      <div className="p-4">
                        <FormattedTime
                          value={schedule.arrivalTime}
                          fallback="-"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusDetails;
