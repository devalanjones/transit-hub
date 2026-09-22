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
  MapPin,
  X,
  Compass,
} from "lucide-react";

import { deleteStop, getAllStops } from "../../../services/stopService";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Pagination from "../../../components/common/Pagination";

const StopList = () => {
  const navigate = useNavigate();

  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchStops = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllStops();
      setStops(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed To Get Stops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
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
      const response = await deleteStop(id);
      toast.success(response.data?.message || "Stop deleted successfully");
      setCurrentPage(1);
      fetchStops();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to Delete Stop");
    }
  };

  if (loading) {
    return <Loading message="Loading Stops..." />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  if (stops.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="No Stops Found"
          message="You haven't added any transit stops yet. Create your first stop to get started."
          buttonText="Create Stop"
          icon={MapPin}
          onClick={() => navigate("/admin/stops/create")}
        />
      </div>
    );
  }

  const filteredStops = stops.filter((stop) =>
    stop.stopName?.toLowerCase().includes(search.toLowerCase()),
  );

  const stopsPerPage = 10;
  const totalPages = Math.ceil(filteredStops.length / stopsPerPage);
  const indexOfLastStop = currentPage * stopsPerPage;
  const indexOfFirstStop = indexOfLastStop - stopsPerPage;
  const currentStops = filteredStops.slice(indexOfFirstStop, indexOfLastStop);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <MapPin size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Stops
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredStops.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            Manage physical transit stops, station names, and GPS coordinate
            markers.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/admin/stops/create")}
          className="w-fit"
        >
          <Plus size={18} />
          <span>Add Stop</span>
        </Button>
      </div>

      {/* Search Filter Field */}
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
          placeholder="Search stop name..."
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
        {search && filteredStops.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Results Found"
              message={`No stops matched "${search}". Try verifying the name or checking for typos.`}
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
                      Stop Name
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Latitude
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Longitude
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                  {currentStops.map((stop) => (
                    <tr
                      key={stop._id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* Stop Name */}
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={16}
                            className="text-orange-500 shrink-0"
                          />
                          <span>{stop.stopName}</span>
                        </div>
                      </td>

                      {/* Latitude */}
                      <td className="px-5 py-4 font-mono text-xs text-slate-700 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Compass
                            size={14}
                            className="text-slate-400 shrink-0"
                          />
                          <span>{stop.latitude}</span>
                        </div>
                      </td>

                      {/* Longitude */}
                      <td className="px-5 py-4 font-mono text-xs text-slate-700 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Compass
                            size={14}
                            className="text-slate-400 shrink-0"
                          />
                          <span>{stop.longitude}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/admin/stops/${stop._id}`)}
                            className="px-2.5"
                            title="View Stop Details"
                          >
                            <Eye size={15} />
                            <span className="hidden md:inline">View</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              navigate(`/admin/stops/${stop._id}/edit`)
                            }
                            className="px-2.5"
                            title="Edit Stop"
                          >
                            <Edit3 size={15} />
                            <span className="hidden md:inline">Edit</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(stop._id)}
                            className="px-2.5"
                            title="Delete Stop"
                          >
                            <Trash2 size={15} />
                            <span className="hidden md:inline">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

export default StopList;
