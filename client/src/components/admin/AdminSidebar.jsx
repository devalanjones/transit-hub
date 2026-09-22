import { useState } from "react";
import {
  Bell,
  Bus,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Route,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Main menu styling: Vibrant orange gradient when active, crisp slate text in dark mode
  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-xs font-semibold"
        : "text-slate-700 hover:bg-orange-50/70 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  // Submenu styling: Orange tint badge when active
  const subMenuClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? "bg-orange-50 font-semibold text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 border-r border-slate-200/80 bg-white text-slate-800 transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-3 space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            end
            className={menuClass}
            onClick={handleLinkClick}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          {/* Users */}
          <NavLink
            to="/admin/users"
            className={menuClass}
            onClick={handleLinkClick}
          >
            <Users size={19} />
            <span>Users</span>
          </NavLink>

          {/* Buses Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("buses")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-orange-50/70 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bus size={19} />
                <span>Buses</span>
              </div>
              {openMenu === "buses" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {openMenu === "buses" && (
              <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                <NavLink
                  to="/admin/buses"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Bus List
                </NavLink>
                <NavLink
                  to="/admin/buses/create"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Add Bus
                </NavLink>
              </div>
            )}
          </div>

          {/* Routes Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("routes")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-orange-50/70 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Route size={19} />
                <span>Routes</span>
              </div>
              {openMenu === "routes" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {openMenu === "routes" && (
              <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                <NavLink
                  to="/admin/routes"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Route List
                </NavLink>
                <NavLink
                  to="/admin/routes/create"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Add Route
                </NavLink>
              </div>
            )}
          </div>

          {/* Stops Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("stops")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-orange-50/70 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin size={19} />
                <span>Stops</span>
              </div>
              {openMenu === "stops" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {openMenu === "stops" && (
              <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                <NavLink
                  to="/admin/stops"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Stop List
                </NavLink>
                <NavLink
                  to="/admin/stops/create"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Add Stop
                </NavLink>
              </div>
            )}
          </div>

          {/* Fares Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("fares")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-orange-50/70 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <IndianRupee size={19} />
                <span>Fares</span>
              </div>
              {openMenu === "fares" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {openMenu === "fares" && (
              <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                <NavLink
                  to="/admin/fares"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Fare List
                </NavLink>
                <NavLink
                  to="/admin/fares/create"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Add Fare
                </NavLink>
              </div>
            )}
          </div>

          {/* Schedules Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("schedules")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-orange-50/70 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={19} />
                <span>Schedules</span>
              </div>
              {openMenu === "schedules" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {openMenu === "schedules" && (
              <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                <NavLink
                  to="/admin/schedules"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Schedule List
                </NavLink>
                <NavLink
                  to="/admin/schedules/create"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Add Schedule
                </NavLink>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("notifications")}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-orange-50/70 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell size={19} />
                <span>Notifications</span>
              </div>
              {openMenu === "notifications" ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {openMenu === "notifications" && (
              <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                <NavLink
                  to="/admin/notifications"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Notification List
                </NavLink>
                <NavLink
                  to="/admin/notifications/create"
                  end
                  className={subMenuClass}
                  onClick={handleLinkClick}
                >
                  Add Notification
                </NavLink>
              </div>
            )}
          </div>

          {/* Feedbacks */}
          <NavLink
            to="/admin/feedbacks"
            className={menuClass}
            onClick={handleLinkClick}
          >
            <MessageSquare size={19} />
            <span>Feedbacks</span>
          </NavLink>

          {/* Logout */}
          <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut size={19} />
              <span>LogOut</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
