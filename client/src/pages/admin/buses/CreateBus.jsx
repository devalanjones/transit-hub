import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ArrowLeft, Bus as BusIcon } from "lucide-react";

import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import ErrorMessage from "../../../components/common/ErrorMessage";
import createBusSchema from "../../../validations/bus/createBusSchema";
import { createBus } from "../../../services/busService";
import { getAllBusTypes } from "../../../services/fareService";

const CreateBus = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createBusSchema),
  });

  const [loading, setLoading] = useState(false);
  const [busTypes, setBusTypes] = useState([]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await createBus(data);
      toast.success(response.data?.message || "Bus created successfully");
      navigate("/admin/buses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Create Bus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBusTypes = async () => {
      try {
        const response = await getAllBusTypes();
        setBusTypes(response.data.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load bus types",
        );
      }
    };

    fetchBusTypes();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Back Action */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/buses")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Buses</span>
        </Button>
      </div>

      {/* Page Title & Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <BusIcon size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Create Bus
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add a new vehicle to your transit fleet registry
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Bus Registration Number */}
            <div>
              <label
                htmlFor="busRegNumber"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                Bus Registration Number
              </label>

              <Input
                id="busRegNumber"
                {...register("busRegNumber")}
                placeholder="e.g. KL-07-CD-1234"
                error={Boolean(errors.busRegNumber)}
              />

              {errors.busRegNumber && (
                <ErrorMessage message={errors.busRegNumber.message} />
              )}
            </div>

            {/* Bus Name */}
            <div>
              <label
                htmlFor="busName"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                Bus Name
              </label>

              <Input
                id="busName"
                {...register("busName")}
                placeholder="e.g. Metro Express 01"
                error={Boolean(errors.busName)}
              />

              {errors.busName && (
                <ErrorMessage message={errors.busName.message} />
              )}
            </div>

            {/* Bus Type */}
            <div>
              <label
                htmlFor="busType"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                Bus Type
              </label>

              <Select
                id="busType"
                {...register("busType")}
                error={Boolean(errors.busType)}
                placeholder="Select Bus Type"
                options={busTypes.map((type) => ({
                  value: type._id,
                  label: type.busType,
                }))}
              />

              {errors.busType && (
                <ErrorMessage message={errors.busType.message} />
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                Status
              </label>

              <Select
                id="status"
                {...register("status")}
                error={Boolean(errors.status)}
                placeholder="Select Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />

              {errors.status && (
                <ErrorMessage message={errors.status.message} />
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/buses")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
            >
              Create Bus
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBus;
