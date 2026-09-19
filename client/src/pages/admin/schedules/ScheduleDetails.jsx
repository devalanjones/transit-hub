import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteSchedule,
  getScheduleById,
} from "../../../services/scheduleService";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/common/Button";
import FormattedTime from "../../../components/common/FormattedTime";
import ScheduleMap from "../../../components/shedule/ScheduleMap"; 

const ScheduleDetails = () => {
  let { id } = useParams();
  let navigate = useNavigate();

  let [schedule, setSchedule] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState("");

  useEffect(() => {
    let fetchSchedule = async () => {
      try {
        setLoading(true);
        setError("");
        let response = await getScheduleById(id);
        setSchedule(response.data.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load Schedule details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  if (loading) {
    return <Loading message={"Loading Schedule Details..."} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!schedule) {
    return <EmptyState message="Schedule not found" icon="🗓️" />;
  }

  let handleDelete = async () => {
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
      navigate("/admin/schedules");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete schedule");
    }
  };

  let bus = schedule.busId;
  let route = schedule.routeId;
  let sortedStops = [...(schedule.stops || [])].sort(
    (a, b) => a.stopSequence - b.stopSequence,
  );

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={() => navigate("/admin/schedules")}>← Back</Button>
      </div>

      {/* Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Schedule Details</h1>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate(`/admin/schedules/${id}/edit`)}>
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
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">
          Bus Information
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">Bus Number</p>
            <p className="mt-1 font-medium text-gray-800">
              {bus?.busRegNumber || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bus Name</p>
            <p className="mt-1 font-medium text-gray-800">
              {bus?.busName || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bus Type</p>
            <p className="mt-1 font-medium text-gray-800">
              {bus?.busType?.busType || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bus Status</p>
            <p className="mt-1 font-medium text-gray-800">
              {bus?.status || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">Route</h2>
        <div>
          <p className="text-sm text-gray-500">Route Name</p>
          <p className="mt-1 font-medium text-gray-800">
            {route?.routeName || "-"}
          </p>
        </div>
      </div>

      {/* Interactive Route Map */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Route Map</h2>
        <ScheduleMap stops={sortedStops} />
      </div>

      {/* Stops Table */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">Stops</h2>

        {sortedStops.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Sequence
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Stop Name
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Expected Arrival Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStops.map((stop) => (
                  <tr
                    key={`${stop.stopId?._id}-${stop.stopSequence}`}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {stop.stopSequence}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {stop.stopId?.stopName || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <FormattedTime
                        value={stop.expectedArrivalTime}
                        fallback="-"
                        className="font-medium text-gray-800"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No stops available for this schedule" />
        )}
      </div>

      {/* Schedule Information */}
      <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 px-2 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">Departure Time</p>
            <div className="mt-1">
              <FormattedTime
                value={schedule.departureTime}
                fallback="-"
                className="font-medium text-gray-800"
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Days</p>
            <p className="mt-1 font-medium text-gray-800">
              {schedule.days?.length ? schedule.days.join(", ") : "-"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">Arrival Time</p>
            <div className="mt-1">
              <FormattedTime
                value={schedule.arrivalTime}
                fallback="-"
                className="font-medium text-gray-800"
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-1 font-medium text-gray-800">
              {schedule.status || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetails;
