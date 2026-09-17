import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import createRouteSchema from "../../../validations/route/createRouteSchema";
import { useState } from "react";
import { createRoute } from "../../../services/routeService";
import { toast } from "sonner";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import ErrorMessage from "../../../components/common/ErrorMessage";
import { useForm } from "react-hook-form";




const CreateRoute = () => {

    let navigate = useNavigate();

    let {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(createRouteSchema)
    })

    let [loading, setLoading] = useState(false)

    let source = watch("source");
    let destination = watch("destination");
    let sourceLatitude = watch("sourceLatitude");
    let sourceLongitude = watch("sourceLongitude");
    let destinationLatitude = watch("destinationLatitude");
    let destinationLongitude = watch("destinationLongitude");

    let routeName =
        source?.trim() && destination?.trim()
            ? `${source.trim()} - ${destination.trim()}`
            : "";

    let onSubmit = async (data) => {

        try {

            setLoading(true);

            let routeData = {
                source: data.source.trim(),
                destination: data.destination.trim(),
                routeName: `${data.source.trim()} - ${data.destination.trim()}`
            };

            let response = await createRoute(routeData);

            toast.success(response.data.message);

            navigate("/admin/routes");

        } catch (error) {

            toast.error(error.response?.data?.message || "Failed to Create Route");

        } finally {

            setLoading(false);
        }

    }

    return (

        <div className="p-6">

            {/* Back Button */}

            <div className="mb-6">

                <Button
                    onClick={() => navigate("/admin/routes")}
                >

                    ← Back
                </Button>

            </div>

            {/* Heading */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-gray-800">
                    Create Route
                </h1>

            </div>

            {/* Form */}

            <div className="border border-gray-300 rounded-lg p-6">

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5">

                    {/* Source */}

                    <div>

                        <label
                            htmlFor="source"
                            className="block mb-2 font-medium text-gray-700"
                        >

                            Source

                        </label>

                        <Input
                            id="source"
                            {...register("source")}
                            placeholder="Enter Source"
                        />

                        {errors.source && (
                            <ErrorMessage message={errors.source.message} />
                        )}

                    </div>

                    {/* Destination */}

                    <div>

                        <label
                            htmlFor="destination"
                            className="block mb-2 font-medium text-gray-700"
                        >

                            Destination

                        </label>

                        <Input
                            id="destination"
                            {...register("destination")}
                            placeholder="Enter Destination"
                        />

                        {errors.destination && (
                            <ErrorMessage message={errors.destination.message} />
                        )}

                    </div>

                    {/* Route Name */}

                    <div>

                        <label
                            htmlFor="routeName"
                            className="block mb-2 font-medium text-gray-700"
                        >

                            Route Name

                        </label>

                        <Input
                            id="routeName"
                            value={routeName}
                            readOnly
                            placeholder="Route name will be generated automatically"
                        />

                    </div>

                    {/* Create Button */}

                    <div className="pt-2">

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Route"}
                        </Button>

                    </div>

                </form>

            </div>

        </div>

    );


};

export default CreateRoute;