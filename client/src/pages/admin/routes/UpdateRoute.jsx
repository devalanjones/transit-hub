import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ArrowLeft, Route as RouteIcon, ArrowRight } from "lucide-react";

import { getRouteById, updateRoute } from "../../../services/routeService";
import updateRouteSchema from "../../../validations/route/updateRouteSchema";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";

const UpdateRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateRouteSchema),
  });

  const source = watch("source");
  const destination = watch("destination");

  const routeName =
    source?.trim() && destination?.trim()
      ? `${source.trim()} - ${destination.trim()}`
      : "";

  const onSubmit = async (data) => {
    try {
      setUpdating(true);

      const routeData = {
        source: data.source.trim(),
        destination: data.destination.trim(),
        routeName: `${data.source.trim()} - ${data.destination.trim()}`,
      };

      const response = await updateRoute(id, routeData);
      toast.success(response.data?.message || "Route updated successfully");
      navigate("/admin/routes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Route");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getRouteById(id);
        const routeData = response.data?.data;

        // Support string primitives or populated objects
        const sourceVal =
          typeof routeData?.source === "object"
            ? routeData?.source?.name || ""
            : routeData?.source || "";

        const destinationVal =
          typeof routeData?.destination === "object"
            ? routeData?.destination?.name || ""
            : routeData?.destination || "";

        reset({
          source: sourceVal,
          destination: destinationVal,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load Route");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id, reset]);

  if (loading) {
    return <Loading message="Loading Route..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/routes")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Routes</span>
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
          variant="secondary"
          onClick={() => navigate("/admin/routes")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Routes</span>
        </Button>
      </div>

      {/* Page Title & Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <RouteIcon size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Update Route
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Modify origin, terminal destination, and corridor naming
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Source Origin */}
            <div>
              <label
                htmlFor="source"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
              >
                Source 
              </label>

              <Input
                id="source"
                {...register("source")}
                placeholder="Enter Source"
                error={Boolean(errors.source)}
                className="dark:text-white dark:placeholder:text-slate-400"
              />

              {errors.source && (
                <ErrorMessage message={errors.source.message} />
              )}
            </div>

            {/* Destination */}
            <div>
              <label
                htmlFor="destination"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
              >
                Destination
              </label>

              <Input
                id="destination"
                {...register("destination")}
                placeholder="Enter Destination"
                error={Boolean(errors.destination)}
                className="dark:text-white dark:placeholder:text-slate-400"
              />

              {errors.destination && (
                <ErrorMessage message={errors.destination.message} />
              )}
            </div>
          </div>

          {/* Generated Route Name Preview */}
          <div>
            <label
              htmlFor="routeName"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-100"
            >
              Generated Route Name
            </label>

            <div className="relative">
              <Input
                id="routeName"
                value={routeName}
                readOnly
                placeholder="Route name will be generated automatically"
                className="bg-slate-50 font-medium text-slate-900 cursor-not-allowed border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-400"
              />
              {routeName && (
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-500">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-300">
              Combines source and destination to standardize schedule
              references.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/routes")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={updating}
              loading={updating}
            >
              Update Route
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRoute;
