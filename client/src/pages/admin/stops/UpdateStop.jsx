import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ArrowLeft, MapPin } from "lucide-react";

import updateStopSchema from "../../../validations/stop/updateStopSchema";
import { getStopById, updateStop } from "../../../services/stopService";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import LocationPickerMap from "../../../components/common/LocationPickerMap";

const UpdateStop = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateStopSchema),
    defaultValues: {
      stopName: "",
      latitude: "",
      longitude: "",
    },
  });

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
      setUpdating(true);
      const response = await updateStop(id, data);
      toast.success(response.data?.message || "Stop updated successfully");
      navigate("/admin/stops");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to Update Stop");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchStop = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getStopById(id);
        const stop = response.data?.data;

        reset({
          stopName: stop?.stopName || "",
          latitude: stop?.latitude ?? "",
          longitude: stop?.longitude ?? "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load stop");
      } finally {
        setLoading(false);
      }
    };

    fetchStop();
  }, [id, reset]);

  if (loading) {
    return <Loading message="Loading Stop..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/stops")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Stops</span>
        </Button>
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Back Action */}
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
            Update Stop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Edit station identifiers, adjust geographic pins, or recalibrate
            coordinates
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Coordinates and Name Fields */}
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
                Drag the marker or click anywhere on the map to update
                coordinates dynamically.
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
              disabled={updating}
              loading={updating}
            >
              Update Stop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStop;
