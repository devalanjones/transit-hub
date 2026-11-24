import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import { Edit3, IndianRupee, Plus, Search, X } from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Pagination from "../../../components/common/Pagination";
import { getAllFares } from "../../../services/fareService";



const FareList = () => {
    const navigate = useNavigate();

    const [fares, setFares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    const fetchFares = async () => {
        try {
            setLoading(true);

            const response = await getAllFares();

            setFares(response.data.data || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to get Fares");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFares();
    }, []);

    if (loading) {
        return <Loading message="Loading Fares..." />;
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <ErrorMessage variant="banner" message={error} />
            </div>
        );
    }

    if (fares.length === 0) {
        return (
            <div className="p-4 sm:p-6">
                <EmptyState
                    title="No Fares Found"
                    message="You haven't configured any bus fares yet. Create your first fare configuration to get started."
                    buttonText="Create Fare"
                    icon={IndianRupee}
                    onClick={() => navigate("/admin/fares/create")}
                />
            </div>
        );
    }

    const filteredFares = fares.filter((fare) =>
        fare.busType?.toLowerCase().includes(search.toLowerCase())
    );

    const faresPerPage = 10;
    const totalPages = Math.ceil(filteredFares.length / faresPerPage);

    const indexOfLastFare = currentPage * faresPerPage;
    const indexOfFirstFare = indexOfLastFare - faresPerPage;

    const currentFares = filteredFares.slice(
        indexOfFirstFare,
        indexOfLastFare
    );

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                            <IndianRupee size={20} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                            Fares
                        </h1>

                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {filteredFares.length}
                        </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Manage bus type fare configurations and kilometre-based charges.
                    </p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => navigate("/admin/fares/create")}
                    className="w-fit"
                >
                    <Plus size={18} />
                    <span>Add Fare</span>
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />

                <Input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search by bus type..."
                    className="pl-10 pr-10"
                />

                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Fare Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
                {search && filteredFares.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            title="No Results Found"
                            message={`No fares matched "${search}". Try searching with another bus type.`}
                            icon={Search}
                        />
                    </div>
                ) : (
                    <>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[600px] text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-5 py-3.5">
                                            Bus Type
                                        </th>

                                        <th scope="col" className="px-5 py-3.5">
                                            Base Fare
                                        </th>

                                        <th scope="col" className="px-5 py-3.5">
                                            Fare Per KM
                                        </th>

                                        <th scope="col" className="px-5 py-3.5 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                                    {currentFares.map((fare) => (
                                        <tr
                                            key={fare._id}
                                            className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                        >
                                            {/* Bus Type */}
                                            <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {fare.busType || "-"}
                                                </span>
                                            </td>

                                            {/* Base Fare */}
                                            <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200">
                                                ₹{Number(fare.baseFare).toFixed(2)}
                                            </td>

                                            {/* Fare Per KM */}
                                            <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200">
                                                ₹{Number(fare.farePerKm).toFixed(2)}
                                            </td>

                                            {/* Edit Action */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            navigate(`/admin/fares/${fare._id}/edit`)
                                                        }
                                                        className="px-2.5"
                                                        title="Edit Fare"
                                                    >
                                                        <Edit3 size={15} />
                                                        <span className="hidden md:inline">
                                                            Edit
                                                        </span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

};

export default FareList;