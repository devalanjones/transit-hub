import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ArrowLeft, Route as RouteIcon, ArrowRight } from "lucide-react";

import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import ErrorMessage from "../../../components/common/ErrorMessage";
import createRouteSchema from "../../../validations/route/createRouteSchema";
import { createRoute } from "../../../services/routeService";

const CreateRoute = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createRouteSchema),
  });

  const [loading, setLoading] = useState(false);

  const source = watch("source");
  const destination = watch("destination");

  const routeName =
    source?.trim() && destination?.trim()
      ? `${source.trim()} - ${destination.trim()}`
      : "";

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const routeData = {
        source: data.source.trim(),
        destination: data.destination.trim(),
        routeName: `${data.source.trim()} - ${data.destination.trim()}`,
      };

      const response = await createRoute(routeData);
      toast.success(response.data?.message || "Route created successfully");
      navigate("/admin/routes");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Create Route");
    } finally {
      setLoading(false);
    }
  };

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
            Create Route
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Define origin, destination, and auto-generated route identifiers
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Source Input */}
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
                placeholder="e.g. Central Station"
                error={Boolean(errors.source)}
                className="dark:text-white dark:placeholder:text-slate-400"
              />

              {errors.source && (
                <ErrorMessage message={errors.source.message} />
              )}
            </div>

            {/* Destination Input */}
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
                placeholder="e.g. Airport Terminal 2"
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
              disabled={loading}
              loading={loading}
            >
              Create Route
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoute;
