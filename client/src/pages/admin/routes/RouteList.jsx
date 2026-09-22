import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Route as RouteIcon,
  X,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { deleteRoute, getAllRoutes } from "../../../services/routeService";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import Input from "../../../components/common/Input";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";

const RouteList = () => {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllRoutes();
      setRoutes(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed To Get Routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316", // orange-500
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteRoute(id);
      toast.success(response.data?.message || "Route deleted successfully");
      setCurrentPage(1);
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed To Delete Route");
    }
  };

  if (loading) {
    return <Loading message="Loading Routes..." />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="No Routes Found"
          message="You haven't added any routes yet. Create your first route corridor to get started."
          buttonText="Create Route"
          icon={RouteIcon}
          onClick={() => navigate("/admin/routes/create")}
        />
      </div>
    );
  }

  // Helper to extract location names whether populated as an object or raw string
  const getLocationName = (loc) => {
    if (!loc) return "-";
    return typeof loc === "object" ? loc.name || "-" : loc;
  };

  // Search matches routeName, source name, or destination name
  const filteredRoutes = routes.filter((route) => {
    const term = search.toLowerCase();
    const sourceStr = getLocationName(route.source).toLowerCase();
    const destStr = getLocationName(route.destination).toLowerCase();
    const nameStr = (route.routeName || "").toLowerCase();

    return (
      nameStr.includes(term) ||
      sourceStr.includes(term) ||
      destStr.includes(term)
    );
  });

  const routesPerPage = 10;
  const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);
  const indexOfLastRoute = currentPage * routesPerPage;
  const indexOfFirstRoute = indexOfLastRoute - routesPerPage;
  const currentRoutes = filteredRoutes.slice(
    indexOfFirstRoute,
    indexOfLastRoute,
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <RouteIcon size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Routes
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredRoutes.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            Manage transit routes, source origins, and terminal destinations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/admin/routes/create")}
          className="w-fit"
        >
          <Plus size={18} />
          <span>Add Route</span>
        </Button>
      </div>

      {/* Search Filter Box */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by route, source, or destination..."
          className="pl-10 pr-10 dark:text-white dark:placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table Container Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        {search && filteredRoutes.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Results Found"
              message={`No routes matched "${search}". Try checking for typos or searching a different terminal name.`}
              icon={Search}
            />
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm text-slate-700 dark:text-slate-200">
                <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Route name
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Source 
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Destination
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                  {currentRoutes.map((route) => {
                    const sourceName = getLocationName(route.source);
                    const destName = getLocationName(route.destination);

                    return (
                      <tr
                        key={route._id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        {/* Route Name with visual direction indicator */}
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{route.routeName}</span>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <MapPin
                              size={14}
                              className="text-emerald-500 shrink-0"
                            />
                            <span>{sourceName}</span>
                          </div>
                        </td>

                        {/* Destination */}
                        <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <MapPin
                              size={14}
                              className="text-orange-500 shrink-0"
                            />
                            <span>{destName}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                navigate(`/admin/routes/${route._id}`)
                              }
                              className="px-2.5"
                              title="View Route Details"
                            >
                              <Eye size={15} />
                              <span className="hidden md:inline">View</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                navigate(`/admin/routes/${route._id}/edit`)
                              }
                              className="px-2.5"
                              title="Edit Route"
                            >
                              <Edit3 size={15} />
                              <span className="hidden md:inline">Edit</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(route._id)}
                              className="px-2.5"
                              title="Delete Route"
                            >
                              <Trash2 size={15} />
                              <span className="hidden md:inline">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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

export default RouteList;
