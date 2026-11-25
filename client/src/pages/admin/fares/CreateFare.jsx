import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"
import createFareSchema from "../../../validations/fare/createFareSchema";
import { useState } from "react";
import { createFare } from "../../../services/fareService";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import { ArrowLeft, IndianRupee } from "lucide-react";
import Input from "../../../components/common/Input";
import ErrorMessage from "../../../components/common/ErrorMessage";



const CreateFare = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(createFareSchema),
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            const response = await createFare(data);

            toast.success(response.data?.message || "Fare created successfully",);

            navigate("/admin/fares");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create fare",);
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
                        Create Fare
                    </h1>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add a new bus type fare configuration
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
                                placeholder="e.g. Ordinary, Fast Passenger"
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
                                placeholder="e.g. 20"
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
                                placeholder="e.g. 1.25"
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
                            disabled={loading}
                            loading={loading}
                        >
                            Create Fare
                        </Button>
                    </div>
                </form>
            </div>
        </div>

    );

};

export default CreateFare;