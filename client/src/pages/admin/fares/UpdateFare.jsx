import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom"
import updateFareSchema from "../../../validations/fare/updateFareSchema";
import { getFareById, updateFare } from "../../../services/fareService";
import { toast } from "sonner";
import Loading from "../../../components/common/Loading";
import { ArrowLeft, IndianRupee } from "lucide-react";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";



const UpdateFare = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(updateFareSchema),
    });

    const onSubmit = async (data) => {
        try {
            setUpdating(true);

            const response = await updateFare(id, data);

            toast.success(response.data?.message || "Fare updated seccessfully",);

            navigate("/admin/fares");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update fare",);
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        const fetchFare = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getFareById(id);

                const fare = response.data.data;

                reset({
                    busType: fare.busType,
                    baseFare: fare.baseFare,
                    farePerKm: fare.farePerKm,
                });
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load fare",);
            } finally {
                setLoading(false);
            }
        };

        fetchFare();
    }, [id, reset]);

    if (loading) {
        return <Loading message="Loading fare..." />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Button
                    variant="secondary"
                    onClick={() => navigate("/admin/fares")}
                    className="w-fit"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Fares</span>
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
                    onClick={() => navigate("/admin/fares")}
                    className="w-fit"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Fares</span>
                </Button>
            </div>

            {/* Page Title & Identifier */}
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <IndianRupee size={22} />
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        Update Fare
                    </h1>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Modify bus type fare configuration and rates
                    </p>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        {/* Bus Type */}
                        <div>
                            <label
                                htmlFor="busType"
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                            >
                                Bus Type
                            </label>

                            <Input
                                id="busType"
                                {...register("busType")}
                                placeholder="Enter Bus Type"
                                error={Boolean(errors.busType)}
                            />

                            {errors.busType && (
                                <ErrorMessage message={errors.busType.message} />
                            )}
                        </div>

                        {/* Base Fare */}
                        <div>
                            <label
                                htmlFor="baseFare"
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                            >
                                Base Fare (₹)
                            </label>

                            <Input
                                id="baseFare"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("baseFare")}
                                placeholder="Enter Base Fare"
                                error={Boolean(errors.baseFare)}
                            />

                            {errors.baseFare && (
                                <ErrorMessage message={errors.baseFare.message} />
                            )}
                        </div>

                        {/* Fare Per KM */}
                        <div>
                            <label
                                htmlFor="farePerKm"
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                            >
                                Fare Per KM (₹)
                            </label>

                            <Input
                                id="farePerKm"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("farePerKm")}
                                placeholder="Enter Fare Per KM"
                                error={Boolean(errors.farePerKm)}
                            />

                            {errors.farePerKm && (
                                <ErrorMessage message={errors.farePerKm.message} />
                            )}
                        </div>

                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate("/admin/fares")}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={updating}
                            loading={updating}
                        >
                            Update Fare
                        </Button>
                    </div>
                </form>
            </div>
        </div>

    );

};

export default UpdateFare;