import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ArrowLeft, MapPin } from "lucide-react";

import createStopSchema from "../../../validations/stop/createStopSchema";
import { createStop } from "../../../services/stopService";
import Input from "../../../components/common/Input";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import LocationPickerMap from "../../../components/common/LocationPickerMap";

const CreateStop = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createStopSchema),
    defaultValues: {
      stopName: "",
      latitude: "",
      longitude: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const watchedLat = parseFloat(watch("latitude"));
  const watchedLng = parseFloat(watch("longitude"));

  const handleLocationSelected = ({ latitude, longitude, stopName }) => {
    setValue("latitude", latitude, { shouldValidate: true });
    setValue("longitude", longitude, { shouldValidate: true });

    if (stopName) {
      setValue("stopName", stopName, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await createStop(data);
      toast.success(response.data?.message || "Stop created successfully");
      navigate("/admin/stops");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Create Stop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/admin/stops")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Stops</span>
        </Button>
      </div>

      {/* Page Title & Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <MapPin size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Stop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Define station locations, coordinates, and interactive map pins
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Form Fields */}
            <div className="space-y-5">
              {/* Stop Name */}
              <div>
                <label
                  htmlFor="stopName"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
                >
                  Stop Name
                </label>

                <Input
                  id="stopName"
                  {...register("stopName")}
                  placeholder="Enter Stop Name"
                  error={Boolean(errors.stopName)}
                  className="dark:text-white dark:placeholder:text-slate-400"
                />

                {errors.stopName && (
                  <ErrorMessage message={errors.stopName.message} />
                )}
              </div>

              {/* Latitude */}
              <div>
                <label
                  htmlFor="latitude"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
                >
                  Latitude
                </label>

                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register("latitude", { valueAsNumber: true })}
                  placeholder="Enter Latitude"
                  error={Boolean(errors.latitude)}
                  className="dark:text-white dark:placeholder:text-slate-400"
                />

                {errors.latitude && (
                  <ErrorMessage message={errors.latitude.message} />
                )}
              </div>

              {/* Longitude */}
              <div>
                <label
                  htmlFor="longitude"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
                >
                  Longitude
                </label>

                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register("longitude", { valueAsNumber: true })}
                  placeholder="Enter Longitude"
                  error={Boolean(errors.longitude)}
                  className="dark:text-white dark:placeholder:text-slate-400"
                />

                {errors.longitude && (
                  <ErrorMessage message={errors.longitude.message} />
                )}
              </div>
            </div>

            {/* Right Column: Location Picker Map */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100">
                Locate on Map
              </label>

              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <LocationPickerMap
                  latitude={isNaN(watchedLat) ? null : watchedLat}
                  longitude={isNaN(watchedLng) ? null : watchedLng}
                  onLocationChange={handleLocationSelected}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-300">
                Click or drag the marker to auto-fill latitude and longitude
                coordinates.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/stops")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
            >
              Create Stop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStop;
