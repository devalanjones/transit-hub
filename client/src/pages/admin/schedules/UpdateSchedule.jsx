import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import updateScheduleSchema from "../../../validations/schedule/updateScheduleSchema";
import { useEffect, useState } from "react";
import {
  getScheduleById,
  updateSchedule,
} from "../../../services/scheduleService";
import { getAllBuses } from "../../../services/busService";
import { getAllRoutes } from "../../../services/routeService";
import { getAllStops } from "../../../services/stopService";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import Input from "../../../components/common/Input";
import FormattedTime from "../../../components/common/FormattedTime";
import { toast } from "sonner";

// Converts incoming Date / ISO / string timestamps to "HH:mm" for <input type="time"/>
const toInputTimeString = (timeVal) => {
  if (!timeVal) return "";
  if (typeof timeVal === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeVal)) {
    return timeVal;
  }
  const date = new Date(timeVal);
  if (isNaN(date.getTime())) return "";
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Converts "HH:mm" from <input type="time"/> to an ISO UTC timestamp
const toIsoDateTime = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const UpdateSchedule = () => {
  let { id } = useParams();
  let navigate = useNavigate();

  let {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateScheduleSchema),
    defaultValues: {
      stops: [],
      days: [],
      status: "",
    },
  });

  let [buses, setBuses] = useState([]);
  let [routes, setRoutes] = useState([]);
  let [stops, setStops] = useState([]);
  let [loading, setLoading] = useState(true);
  let [updating, setUpdating] = useState(false);
  let [error, setError] = useState("");
  let [selectedStops, setSelectedStops] = useState([]);
  let [draggedIndex, setDraggedIndex] = useState(null);
  let [selectedDays, setSelectedDays] = useState([]);

  // Watchers for live formatted preview
  const watchedDepartureTime = watch("departureTime");
  const watchedArrivalTime = watch("arrivalTime");
  const watchedStops = watch("stops") || [];

  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let statusOptions = [
    { value: "", label: "Select Status" },
    { value: "ON_TIME", label: "On Time" },
    { value: "DELAYED", label: "Delayed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "COMPLETED", label: "Completed" },
  ];

  useEffect(() => {
    let fetchData = async () => {
      try {
        let [
          scheduleResponse,
          busResponse,
          routeResponse,
          stopResponse,
        ] = await Promise.all([
          getScheduleById(id),
          getAllBuses(),
          getAllRoutes(),
          getAllStops(),
        ]);

        let schedule = scheduleResponse.data.data;

        setBuses(busResponse.data.data);
        setRoutes(routeResponse.data.data);
        setStops(stopResponse.data.data);

        setSelectedStops(
          schedule.stops.map((scheduleStop) => scheduleStop.stopId)
        );

        setValue("busId", schedule.busId?._id || schedule.busId);
        setValue("routeId", schedule.routeId?._id || schedule.routeId);
        setValue("arrivalTime", toInputTimeString(schedule.arrivalTime));
        setValue("departureTime", toInputTimeString(schedule.departureTime));
        setValue("days", schedule.days || []);
        setValue("status", schedule.status || "");
        setValue(
          "stops",
          schedule.stops.map((scheduleStop) => ({
            stopId: scheduleStop.stopId?._id || scheduleStop.stopId,
            stopSequence: scheduleStop.stopSequence,
            expectedArrivalTime: toInputTimeString(
              scheduleStop.expectedArrivalTime
            ),
          }))
        );

        setSelectedDays(schedule.days || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load schedule"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  if (loading) {
    return <Loading message="Loading..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  let handleStopChange = (stop) => {
    let isSelected = selectedStops.some(
      (selectedStop) => selectedStop._id === stop._id
    );

    let currentStopValues = watch("stops") || [];
    let newSelectedStops;

    if (isSelected) {
      newSelectedStops = selectedStops.filter(
        (selectedStop) => selectedStop._id !== stop._id
      );
    } else {
      newSelectedStops = [...selectedStops, stop];
    }

    setSelectedStops(newSelectedStops);

    let newStopValues = newSelectedStops.map((selectedStop, index) => {
      let existingStop = currentStopValues.find(
        (stopValue) => stopValue.stopId === selectedStop._id
      );

      return {
        stopId: selectedStop._id,
        stopSequence: index + 1,
        expectedArrivalTime: existingStop?.expectedArrivalTime || "",
      };
    });

    setValue("stops", newStopValues, {
      shouldDirty: true,
      shouldValidate: true,
    });

    trigger("stops");
  };

  let handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    let reorderedStops = [...selectedStops];
    let draggedStop = reorderedStops[draggedIndex];

    reorderedStops.splice(draggedIndex, 1);
    reorderedStops.splice(dropIndex, 0, draggedStop);

    setSelectedStops(reorderedStops);

    let currentStopValues = watch("stops") || [];
    let reorderedStopValues = reorderedStops.map((stop, index) => {
      let oldIndex = selectedStops.findIndex(
        (selectedStop) => selectedStop._id === stop._id
      );

      return {
        stopId: stop._id,
        stopSequence: index + 1,
        expectedArrivalTime:
          currentStopValues[oldIndex]?.expectedArrivalTime || "",
      };
    });

    setValue("stops", reorderedStopValues, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setDraggedIndex(null);
  };

  let handleDayChange = (day) => {
    let isSelected = selectedDays.includes(day);
    let newSelectedDays = isSelected
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    setSelectedDays(newSelectedDays);
    setValue("days", newSelectedDays, { shouldDirty: true });
    trigger("days");
  };

  let handleAllDayChange = () => {
    let newSelectedDays =
      selectedDays.length === days.length ? [] : [...days];

    setSelectedDays(newSelectedDays);
    setValue("days", newSelectedDays, { shouldDirty: true });
    trigger("days");
  };

  let onSubmit = async (data) => {
    try {
      setUpdating(true);

      const payload = {
        ...data,
        departureTime: toIsoDateTime(data.departureTime),
        arrivalTime: toIsoDateTime(data.arrivalTime),
        stops: data.stops.map((stop) => ({
          ...stop,
          expectedArrivalTime: toIsoDateTime(stop.expectedArrivalTime),
        })),
      };

      let response = await updateSchedule(id, payload);
      toast.success(response.data.message);
      navigate("/admin/schedules");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update schedule"
      );
    } finally {
      setUpdating(false);
    }
  };

  let busOptions = [
    { value: "", label: "Select Bus" },
    ...buses.map((bus) => ({
      value: bus._id,
      label: `${bus.busRegNumber} - ${bus.busName}`,
    })),
  ];

  let routeOptions = [
    { value: "", label: "Select Route" },
    ...routes.map((route) => ({
      value: route._id,
      label: route.routeName,
    })),
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          type="button"
          onClick={() => navigate("/admin/schedules")}
        >
          ← Back
        </Button>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="mt-6 text-2xl font-bold text-gray-800">
          Update Schedule
        </h1>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-300 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Bus */}
          <div>
            <label
              htmlFor="busId"
              className="mb-2 block font-medium text-gray-700"
            >
              Bus
            </label>
            <Select id="busId" {...register("busId")} options={busOptions} />
            {errors.busId && (
              <ErrorMessage message={errors.busId.message} />
            )}
          </div>

          {/* Route */}
          <div>
            <label
              htmlFor="routeId"
              className="mb-2 block font-medium text-gray-700"
            >
              Route
            </label>
            <Select
              id="routeId"
              {...register("routeId")}
              options={routeOptions}
            />
            {errors.routeId && (
              <ErrorMessage message={errors.routeId.message} />
            )}
          </div>

          {/* Stops */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Stops</h2>

            <div>
              <h3 className="mb-3 font-medium text-gray-700">
                Available Stops
              </h3>

              <div className="space-y-2">
                {stops.map((stop) => (
                  <label key={stop._id} className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={selectedStops.some(
                        (selectedStop) => selectedStop._id === stop._id
                      )}
                      onChange={() => handleStopChange(stop)}
                      className="!h-4 !w-4"
                    />
                    <span className="text-gray-700">{stop.stopName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-4 px-4">
                <h3 className="font-medium text-gray-700">Selected Stops</h3>
                <span className="ml-auto w-44 text-right font-medium text-gray-700">
                  Expected Arrival Time
                </span>
              </div>

              {selectedStops.length > 0 ? (
                <div className="space-y-2">
                  {selectedStops.map((stop, index) => {
                    const currentStopVal = watchedStops[index]?.expectedArrivalTime;

                    return (
                      <div
                        key={stop._id}
                        draggable
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        className="flex items-center gap-4 rounded-lg border border-gray-300 px-4 py-3"
                      >
                        <span className="cursor-move text-gray-500">☷</span>
                        <span className="w-8 font-medium text-gray-700">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-gray-700">
                          {stop.stopName}
                        </span>

                        <div className="w-44 text-right">
                          <Input
                            type="time"
                            {...register(
                              `stops.${index}.expectedArrivalTime`,
                              {
                                onChange: () => {
                                  trigger(`stops.${index}.expectedArrivalTime`);
                                },
                              }
                            )}
                          />

                          {/* Live Formatted Stop Time Preview */}
                          {currentStopVal && (
                            <div className="mt-1">
                              <FormattedTime
                                value={currentStopVal}
                                className="text-xs text-blue-600"
                              />
                            </div>
                          )}

                          {errors.stops?.[index]?.expectedArrivalTime && (
                            <ErrorMessage
                              message={
                                errors.stops[index].expectedArrivalTime.message
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No stops selected</p>
              )}

              {errors.stops && !Array.isArray(errors.stops) && (
                <ErrorMessage message={errors.stops.message} />
              )}
            </div>
          </div>

          {/* Days */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Days</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={selectedDays.length === days.length}
                  onChange={handleAllDayChange}
                  className="!h-4 !w-4"
                />
                <span className="text-gray-700">All Days</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {days.map((day) => (
                  <label key={day} className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => handleDayChange(day)}
                      className="!h-4 !w-4"
                    />
                    <span className="text-gray-700">{day}</span>
                  </label>
                ))}
              </div>

              {errors.days && <ErrorMessage message={errors.days.message} />}
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Schedule Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Departure Time */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="departureTime"
                    className="font-medium text-gray-700"
                  >
                    Departure Time
                  </label>
                  {watchedDepartureTime && (
                    <FormattedTime
                      value={watchedDepartureTime}
                      className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700"
                    />
                  )}
                </div>

                <Input
                  id="departureTime"
                  type="time"
                  {...register("departureTime")}
                />

                {errors.departureTime && (
                  <ErrorMessage message={errors.departureTime.message} />
                )}
              </div>

              {/* Arrival Time */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="arrivalTime"
                    className="font-medium text-gray-700"
                  >
                    Arrival Time
                  </label>
                  {watchedArrivalTime && (
                    <FormattedTime
                      value={watchedArrivalTime}
                      className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700"
                    />
                  )}
                </div>

                <Input
                  id="arrivalTime"
                  type="time"
                  {...register("arrivalTime")}
                />

                {errors.arrivalTime && (
                  <ErrorMessage message={errors.arrivalTime.message} />
                )}
              </div>
            </div>

            {/* Status */}
            <div className="mt-5">
              <label
                htmlFor="status"
                className="mb-2 block font-medium text-gray-700"
              >
                Status
              </label>

              <Controller
                name="status"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    id="status"
                    name={field.name}
                    value={field.value || ""}
                    onChange={field.onChange}
                    options={statusOptions}
                  />
                )}
              />

              {errors.status && (
                <ErrorMessage message={errors.status.message} />
              )}
            </div>
          </div>

          {/* Update Button */}
          <div className="pt-2">
            <Button type="submit" disabled={updating}>
              {updating ? "Updating..." : "Update Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSchedule;