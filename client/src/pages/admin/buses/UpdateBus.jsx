import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ArrowLeft, Bus as BusIcon } from "lucide-react";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import updateBusSchema from "../../../validations/bus/updateBusSchema";
import { getBusById, updateBus } from "../../../services/busService";
import { getAllBusTypes } from "../../../services/fareService";

const UpdateBus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [busTypes, setBusTypes] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateBusSchema),
  });

  const onSubmit = async (data) => {
    try {
      setUpdating(true);
      const response = await updateBus(id, data);
      toast.success(response.data?.message || "Bus updated successfully");
      navigate("/admin/buses");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bus");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [busResponse, busTypeResponse] = await Promise.all([
          getBusById(id),
          getAllBusTypes(),
        ]);

        const bus = busResponse.data.data;
        const types = busTypeResponse.data.data || [];

        setBusTypes(types);

        reset({
          busRegNumber: bus.busRegNumber,
          busName: bus.busName,
          busType: bus.busType?._id || bus.busType,
          status: bus.status,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bus");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  if (loading) {
    return <Loading message="Loading bus..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/buses")}
          className="w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Buses</span>
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
            Update Bus
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Modify registration details and operational status for this vehicle
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
                placeholder="Enter Bus Registration Number"
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
                placeholder="Enter Bus Name"
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
              disabled={updating}
              loading={updating}
            >
              Update Bus
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBus;
