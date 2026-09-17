import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import createScheduleSchema from "../../../validations/schedule/createScheduleSchema";
import { useEffect, useState } from "react";
import { getAllBuses } from "../../../services/busService";
import { getAllRoutes } from "../../../services/routeService";
import Select from "../../../components/common/Select";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import { toast } from "sonner";
import Input from "../../../components/common/Input";
import { createSchedule, getCandidateStopsByRoute } from "../../../services/scheduleService";
import FormattedTime from "../../../components/common/FormattedTime";

const CreateSchedule = () => {
  let navigate = useNavigate();

  let {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createScheduleSchema),
    defaultValues: {
      stops: [],
      days: [],
      status: "",
    },
  });

  let [buses, setBuses] = useState([]);
  let [routes, setRoutes] = useState([]);
  let [stops, setStops] = useState([]);
  let [selectedStops, setSelectedStops] = useState([]);
  let [loading, setLoading] = useState(false);
  let [draggedIndex, setDraggedIndex] = useState(null);

  // Watch time values for live formatted preview
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

  let [selectedDays, setSelectedDays] = useState([]);

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
        let [busResponse, routeResponse, stopResponse] = await Promise.all([
          getAllBuses(),
          getAllRoutes(),
        ]);

        setBuses(busResponse.data.data);
        setRoutes(routeResponse.data.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load buses and routes",
        );
      }
    };

    fetchData();
  }, []);

  let handleRouteChange = async (event) => {

    let routeId = event.target.value;

    setSelectedStops([]);
    setValue("stops", [], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setStops([]);

    if (!routeId) {
      return;
    }

    try {

      let response = await getCandidateStopsByRoute(routeId);

      setStops(response.data.data);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to load candidate stops"
      );

    }
  };
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

    let newStopValues = newSelectedStops.map(
      (selectedStop, index) => {

        let existingStop = currentStopValues.find(
          (stopValue) =>
            stopValue.stopId === selectedStop._id
        );

        return {
          stopId: selectedStop._id,
          stopSequence: index + 1,
          expectedArrivalTime:
            existingStop?.expectedArrivalTime || "",
        };
      }
    );

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
        (selectedStop) => selectedStop._id === stop._id,
      );

      return {
        stopId: stop._id,
        stopSequence: index + 1,
        expectedArrivalTime:
          currentStopValues[oldIndex]?.expectedArrivalTime || "",
      };
    });

    setValue("stops", reorderedStopValues, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setDraggedIndex(null);
  };

  let handleDayChange = (day) => {
    let isSelected = selectedDays.includes(day);

    let newSelectedDays;

    if (isSelected) {
      newSelectedDays = selectedDays.filter(
        (selectedDay) => selectedDay !== day,
      );
    } else {
      newSelectedDays = [...selectedDays, day];
    }

    setSelectedDays(newSelectedDays);

    setValue("days", newSelectedDays, {
      shouldDirty: true,
    });

    trigger("days");
  };

  let handleAllDaysChange = () => {
    let newSelectedDays;

    if (selectedDays.length === days.length) {
      newSelectedDays = [];
    } else {
      newSelectedDays = [...days];
    }

    setSelectedDays(newSelectedDays);

    setValue("days", newSelectedDays, {
      shouldDirty: true,
    });

    trigger("days");
  };

  const toIsoDateTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        departureTime: toIsoDateTime(data.departureTime),
        arrivalTime: toIsoDateTime(data.arrivalTime),
        stops: data.stops.map((stop) => ({
          ...stop,
          expectedArrivalTime: toIsoDateTime(stop.expectedArrivalTime),
        })),
      };

      const response = await createSchedule(payload);
      toast.success(response.data.message);
      navigate("/admin/schedules");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  let busOptions = [
    {
      value: "",
      label: "Select Bus",
    },
    ...buses.map((bus) => ({
      value: bus._id,
      label: `${bus.busRegNumber} - ${bus.busName}`,
    })),
  ];

  let routeOptions = [
    {
      value: "",
      label: "Select Route",
    },
    ...routes.map((route) => ({
      value: route._id,
      label: route.routeName,
    })),
  ];

  let availableStopOptions = [
    {
      value: "",
      label: "Select Stop",
    },
    ...stops
      .filter(
        (stop) =>
          !selectedStops.some(
            (selectedStop) => selectedStop._id === stop._id,
          ),
      )
      .map((stop) => ({
        value: stop._id,
        label: stop.stopName,
      })),
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={() => navigate("/admin/schedules")}>← Back</Button>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Schedule</h1>
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
            {errors.busId && <ErrorMessage message={errors.busId.message} />}
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
              {...register("routeId", {
                onChange: handleRouteChange,
              })}
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

              <Select
                id="stopId"
                value=""
                onChange={(event) => {
                  let stop = stops.find(
                    (stop) => stop._id === event.target.value
                  );

                  if (stop) {
                    handleStopChange(stop);
                  }
                }}
                options={availableStopOptions}
              />

            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center">
                <h3 className="font-medium text-gray-700">Selected Stops</h3>
                <span className="ml-auto w-40 font-medium text-gray-700">
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

                        <Button
                          type="button"
                          onClick={() => handleStopChange(stop)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 text-sm"
                        >
                          Remove
                        </Button>

                        <div className="w-40">
                          <Input
                            type="time"
                            {...register(`stops.${index}.expectedArrivalTime`)}
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
              {/* All Days */}
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={selectedDays.length === days.length}
                  onChange={handleAllDaysChange}
                  className="!h-4 !w-4"
                />
                <span className="text-gray-700">All Days</span>
              </label>

              {/* Individual Days */}
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

            <div className="grid grid-cols-2 gap-6">
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
              <Select
                id="status"
                {...register("status")}
                options={statusOptions}
              />
              {errors.status && (
                <ErrorMessage message={errors.status.message} />
              )}
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSchedule;