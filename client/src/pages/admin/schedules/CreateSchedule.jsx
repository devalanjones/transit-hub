import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ArrowLeft, GripVertical, Trash2 } from "lucide-react";

import Select from "../../../components/common/Select";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormattedTime from "../../../components/common/FormattedTime";
import createScheduleSchema from "../../../validations/schedule/createScheduleSchema";
import { getAllBuses } from "../../../services/busService";
import { getAllRoutes } from "../../../services/routeService";
import {
  createSchedule,
  getCandidateStopsByRoute,
  getRouteGeometryByStops,
} from "../../../services/scheduleService";

const CreateSchedule = () => {
  const navigate = useNavigate();

  const {
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

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const watchedDepartureTime = watch("departureTime");
  const watchedArrivalTime = watch("arrivalTime");
  const watchedStops = watch("stops") || [];

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [selectedDays, setSelectedDays] = useState([]);

  const statusOptions = [
    { value: "ON_TIME", label: "On Time" },
    { value: "DELAYED", label: "Delayed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "COMPLETED", label: "Completed" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busResponse, routeResponse] = await Promise.all([
          getAllBuses(),
          getAllRoutes(),
        ]);

        setBuses(busResponse.data?.data || []);
        setRoutes(routeResponse.data?.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load buses and routes",
        );
      }
    };

    fetchData();
  }, []);

  const handleRouteChange = async (event) => {
    const routeId = event.target.value;

    setSelectedStops([]);
    setValue("stops", [], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setStops([]);

    if (!routeId) return;

    try {
      const response = await getCandidateStopsByRoute(routeId);
      setStops(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load candidate stops",
      );
    }
  };

  const handleStopChange = (stop) => {
    const isSelected = selectedStops.some(
      (selectedStop) => selectedStop._id === stop._id,
    );

    const currentStopValues = watch("stops") || [];
    let newSelectedStops;

    if (isSelected) {
      newSelectedStops = selectedStops.filter(
        (selectedStop) => selectedStop._id !== stop._id,
      );
    } else {
      newSelectedStops = [...selectedStops, stop];
    }

    setSelectedStops(newSelectedStops);

    const newStopValues = newSelectedStops.map((selectedStop, index) => {
      const existingStop = currentStopValues.find(
        (stopValue) => stopValue.stopId === selectedStop._id,
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

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const reorderedStops = [...selectedStops];
    const draggedStop = reorderedStops[draggedIndex];

    reorderedStops.splice(draggedIndex, 1);
    reorderedStops.splice(dropIndex, 0, draggedStop);

    setSelectedStops(reorderedStops);

    const currentStopValues = watch("stops") || [];
    const reorderedStopValues = reorderedStops.map((stop, index) => {
      const oldIndex = selectedStops.findIndex(
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

  const handleDayChange = (day) => {
    const isSelected = selectedDays.includes(day);
    const newSelectedDays = isSelected
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    setSelectedDays(newSelectedDays);
    setValue("days", newSelectedDays, { shouldDirty: true });
    trigger("days");
  };

  const handleAllDaysChange = () => {
    const newSelectedDays =
      selectedDays.length === days.length ? [] : [...days];
    setSelectedDays(newSelectedDays);
    setValue("days", newSelectedDays, { shouldDirty: true });
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

      const stopIds = data.stops.map((stop) => stop.stopId);

      const routeResponse = await getRouteGeometryByStops(stopIds);

      const payload = {
        ...data,
        departureTime: toIsoDateTime(data.departureTime),
        arrivalTime: toIsoDateTime(data.arrivalTime),
        stops: data.stops.map((stop) => ({
          ...stop,
          expectedArrivalTime: toIsoDateTime(stop.expectedArrivalTime),
        })),

        routeGeometry: routeResponse.data.data.geometry,
      };

      const response = await createSchedule(payload);
      toast.success(response.data?.message || "Schedule created successfully");
      navigate("/admin/schedules");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  const busOptions = buses.map((bus) => ({
    value: bus._id,
    label: `${bus.busRegNumber} - ${bus.busName}`,
  }));

  const routeOptions = routes.map((route) => ({
    value: route._id,
    label: route.routeName,
  }));

  const availableStopOptions = stops
    .filter(
      (stop) =>
        !selectedStops.some((selectedStop) => selectedStop._id === stop._id),
    )
    .map((stop) => ({
      value: stop._id,
      label: stop.stopName,
    }));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/schedules")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Schedule
        </h1>
      </div>

      {/* Form Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 1. Bus */}
          <div>
            <label
              htmlFor="busId"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
            >
              Bus
            </label>
            <Select
              id="busId"
              {...register("busId")}
              placeholder="Select Bus"
              options={busOptions}
              error={Boolean(errors.busId)}
            />
            {errors.busId && <ErrorMessage message={errors.busId.message} />}
          </div>

          {/* 2. Route */}
          <div>
            <label
              htmlFor="routeId"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
            >
              Route
            </label>
            <Select
              id="routeId"
              {...register("routeId", {
                onChange: handleRouteChange,
              })}
              placeholder="Select Route"
              options={routeOptions}
              error={Boolean(errors.routeId)}
            />
            {errors.routeId && (
              <ErrorMessage message={errors.routeId.message} />
            )}
          </div>

          {/* 3. Stops */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Stops
            </h2>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100">
                Available Stops
              </h3>

              <Select
                id="stopId"
                value=""
                placeholder="Select Stop"
                options={availableStopOptions}
                disabled={availableStopOptions.length === 0}
                onChange={(event) => {
                  const stop = stops.find((s) => s._id === event.target.value);
                  if (stop) handleStopChange(stop);
                }}
              />
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100">
                  Selected Stops
                </h3>
                <span className="ml-auto w-40 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100">
                  Expected Arrival Time
                </span>
              </div>

              {selectedStops.length > 0 ? (
                <div className="space-y-2">
                  {selectedStops.map((stop, index) => {
                    const currentStopVal =
                      watchedStops[index]?.expectedArrivalTime;

                    return (
                      <div
                        key={stop._id}
                        draggable
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                      >
                        <span className="cursor-grab text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                          <GripVertical size={18} />
                        </span>

                        <span className="w-8 font-semibold text-slate-700 dark:text-slate-200">
                          {index + 1}
                        </span>

                        <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">
                          {stop.stopName}
                        </span>

                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleStopChange(stop)}
                          className="px-3 py-1 text-xs"
                        >
                          <Trash2 size={14} className="sm:hidden" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>

                        <div className="w-40">
                          <Input
                            type="time"
                            {...register(`stops.${index}.expectedArrivalTime`)}
                            error={Boolean(
                              errors.stops?.[index]?.expectedArrivalTime,
                            )}
                            className="py-1.5 text-xs dark:text-white"
                          />

                          {/* Live Formatted Stop Time Preview */}
                          {currentStopVal && (
                            <div className="mt-1">
                              <FormattedTime
                                value={currentStopVal}
                                className="text-xs font-semibold text-orange-600 dark:text-orange-400"
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
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  No stops selected
                </p>
              )}

              {errors.stops && !Array.isArray(errors.stops) && (
                <div className="mt-2">
                  <ErrorMessage message={errors.stops.message} />
                </div>
              )}
            </div>
          </div>

          {/* 4. Days */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Days
            </h2>

            <div className="space-y-3">
              {/* All Days */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedDays.length === days.length}
                  onChange={handleAllDaysChange}
                  className="h-4 w-4 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  All Days
                </span>
              </label>

              {/* Individual Days */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {days.map((day) => (
                  <label
                    key={day}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => handleDayChange(day)}
                      className="h-4 w-4 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {day}
                    </span>
                  </label>
                ))}
              </div>

              {errors.days && <ErrorMessage message={errors.days.message} />}
            </div>
          </div>

          {/* 5. Schedule Information */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Schedule Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Departure Time */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="departureTime"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
                  >
                    Departure Time
                  </label>
                  {watchedDepartureTime && (
                    <FormattedTime
                      value={watchedDepartureTime}
                      className="rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                    />
                  )}
                </div>

                <Input
                  id="departureTime"
                  type="time"
                  {...register("departureTime")}
                  error={Boolean(errors.departureTime)}
                  className="dark:text-white"
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
                    className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
                  >
                    Arrival Time
                  </label>
                  {watchedArrivalTime && (
                    <FormattedTime
                      value={watchedArrivalTime}
                      className="rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                    />
                  )}
                </div>

                <Input
                  id="arrivalTime"
                  type="time"
                  {...register("arrivalTime")}
                  error={Boolean(errors.arrivalTime)}
                  className="dark:text-white"
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
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
              >
                Status
              </label>
              <Select
                id="status"
                {...register("status")}
                placeholder="Select Status"
                options={statusOptions}
                error={Boolean(errors.status)}
              />
              {errors.status && (
                <ErrorMessage message={errors.status.message} />
              )}
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
            >
              Create Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSchedule;