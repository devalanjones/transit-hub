import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteRoute, getAllRoutes } from "../../../services/routeService";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Swal from "sweetalert2";
import { toast } from "sonner";
import EmptyState from "../../../components/common/EmptyState";
import Input from "../../../components/common/Input";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";




const RouteList = () => {

    let navigate = useNavigate();

    let [routes, setRoutes] = useState([]);
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState("");
    let [currentPage, setCurrentPage] = useState(1);
    let [search, setSearch] = useState("");


    let fetchRoutes = async () => {

        try {

            setLoading(true);

            setError("");

            let response = await getAllRoutes();

            setRoutes(response.data.data)

        } catch (error) {

            setError(error.response?.data?.message || "Failed To Get Routes")

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        fetchRoutes();

    }, [])

    if (loading) {

        return <Loading message="Loading Routes..." />

    }

    if (error) {

        return <ErrorMessage message={error} />

    }

    let handleDelete = async (id) => {

        let result = await Swal.fire({

            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",

            showCancelButton: true,

            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel"

        });

        if (!result.isConfirmed) {

            return;

        }

        try {

            let response = await deleteRoute(id);

            toast.success(response.data.message);

            setCurrentPage(1);

            fetchRoutes();

        } catch (error) {

            toast.error(error.response?.data?.message || "Failed To Delete Route")

        }

    }

    if (routes.length === 0) {

        return (

            <EmptyState
                title="No Routes Found"
                message="You Haven't Added Any Routes Yet. Create First Route"
                buttonText="Create Route"
                onClick={() => navigate("/admin/routes/create")}
                icon="🛣️"
            />
        )
    }

    let filteredRoutes = routes.filter((route) =>

        route.routeName?.toLowerCase().includes(search.toLowerCase())

    );

    let routesPerPage = 10;

    let indexOfLastRoute = currentPage * routesPerPage;
    let indexOfFirstRoute = indexOfLastRoute - routesPerPage;

    let currentRoutes = filteredRoutes.slice(

        indexOfFirstRoute,
        indexOfLastRoute
    );

    let totalPages = Math.ceil(
        filteredRoutes.length / routesPerPage
    );





    return (

        <>


            <div className="p-4 sm:p-6">

                <div className="flex items-center justify-between mb-6">

                    <h1 className="text-2xl font-bold text-gray-800">

                        Route List

                    </h1>

                    <Button
                        onClick={() => navigate("/admin/routes/create")}
                    >
                        Add Route
                    </Button>

                </div>

                <div className="mb-6">

                    <Input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search Route or Source or Destination..."
                        className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                <div className="w-full overflow-x-auto">

                    {search && filteredRoutes.length === 0 ? (

                        <EmptyState
                            title="No Result Found"
                            message="No routes match your search. Try a different routes name or source or destination"
                            icon="🛣️"

                        />

                    ) : (

                        <>

                            <table className="min-w-[700px] w-full border-collapse border border-gray-300">

                                <thead>

                                    <tr className="bg-gray-100">

                                        <th className="border border-gray-300 px-4 py-2 text-left">
                                            Route Name
                                        </th>

                                        <th className="border border-gray-300 px-4 py-2 text-left">
                                            Source
                                        </th>

                                        <th className="border border-gray-300 px-4 py-2 text-left">
                                            Destination
                                        </th>

                                        <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {currentRoutes.map((route) => (

                                        <tr key={route._id}>

                                            <td className="border border-gray-300 px-4 py-2">
                                                {route.routeName}
                                            </td>

                                            <td className="border border-gray-300 px-4 py-2">
                                                {route.source?.name}
                                            </td>

                                            <td className="border border-gray-300 px-4 py-2">
                                                {route.destination?.name}
                                            </td>

                                            <td className="border border-gray-300 px-4 py-2">

                                                <div className="flex flex-col gap-2 sm:flex-row">

                                                    <Button onClick={() => navigate(`/admin/routes/${route._id}`)}>
                                                        View
                                                    </Button>

                                                    <Button onClick={() => navigate(`/admin/routes/${route._id}/edit`)}>
                                                        Edit
                                                    </Button>

                                                    <Button onClick={() => handleDelete(route._id)}>
                                                        Delete
                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                            <Pagination

                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}

                            />

                        </>


                    )}

                </div>

            </div>

        </>

    );

};

export default RouteList;