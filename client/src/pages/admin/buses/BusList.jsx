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
  Bus as BusIcon,
  X,
} from "lucide-react";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import Pagination from "../../../components/common/Pagination";
import Input from "../../../components/common/Input";
import { deleteBus, getAllBuses } from "../../../services/busService";

const BusList = () => {
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await getAllBuses();
      setBuses(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed To Get Buses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
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
      const response = await deleteBus(id);
      toast.success(response.data?.message || "Bus deleted successfully");
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed To Delete Bus");
    }
  };

  if (loading) {
    return <Loading message="Loading Buses..." />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorMessage variant="banner" message={error} />
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="No Buses Found"
          message="You haven't added any buses yet. Create your first bus to get started."
          buttonText="Create Bus"
          icon={BusIcon}
          onClick={() => navigate("/admin/buses/create")}
        />
      </div>
    );
  }

  const filteredBuses = buses.filter(
    (bus) =>
      bus.busRegNumber?.toLowerCase().includes(search.toLowerCase()) ||
      bus.busName?.toLowerCase().includes(search.toLowerCase()) ||
      bus.busType?.busType?.toLowerCase().includes(search.toLowerCase()),
  );

  const busesPerPage = 10;
  const totalPages = Math.ceil(filteredBuses.length / busesPerPage);
  const indexOfLastBus = currentPage * busesPerPage;
  const indexOfFirstBus = indexOfLastBus - busesPerPage;
  const currentBuses = filteredBuses.slice(indexOfFirstBus, indexOfLastBus);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <BusIcon size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Buses
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {filteredBuses.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage your fleet, view bus registrations, and monitor operating
            status.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/admin/buses/create")}
          className="w-fit"
        >
          <Plus size={18} />
          <span>Add Bus</span>
        </Button>
      </div>

      {/* Search Filter Box */}
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
          placeholder="Search by reg number, name, or type..."
          className="pl-10 pr-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Table Card Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        {search && filteredBuses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Results Found"
              message={`No buses matched "${search}". Try searching with another registration number or name.`}
              icon={Search}
            />
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Bus Registration
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Bus Name
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Bus Type
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                  {currentBuses.map((bus) => {
                    const isActive = bus.status === "active";

                    return (
                      <tr
                        key={bus._id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        {/* Bus Registration Number */}
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                          {bus.busRegNumber}
                        </td>

                        {/* Bus Name */}
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                          {bus.busName}
                        </td>

                        {/* Bus Type */}
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {bus.busType?.busType || "-"}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {bus.status
                              ? bus.status.charAt(0).toUpperCase() +
                                bus.status.slice(1)
                              : "-"}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                navigate(`/admin/buses/${bus._id}`)
                              }
                              className="px-2.5"
                              title="View Details"
                            >
                              <Eye size={15} />
                              <span className="hidden md:inline">View</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                navigate(`/admin/buses/${bus._id}/edit`)
                              }
                              className="px-2.5"
                              title="Edit Bus"
                            >
                              <Edit3 size={15} />
                              <span className="hidden md:inline">Edit</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(bus._id)}
                              className="px-2.5"
                              title="Delete Bus"
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

export default BusList;
