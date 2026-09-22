import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, ChevronRight, Bell, UserCircle, Sun, Moon } from "lucide-react";

const AdminNavbar = ({ setSidebarOpen, sidebarOpen }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors duration-200 dark:border-neutral-800 dark:bg-neutral-900 md:px-6">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button with Orange-Red Bus Icon */}
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="flex items-center gap-1 rounded-lg p-2 text-gray-700 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-neutral-800 transition-colors"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Bus size={22} className="text-orange-600 dark:text-orange-500" />
          <ChevronRight
            size={18}
            className={`transition-transform duration-300 ${
              sidebarOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent select-none">
          TransitHub
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="rounded-lg p-2 text-gray-700 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun size={20} className="text-amber-400" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate("/admin/notifications")}
          className="relative rounded-lg p-2 text-gray-700 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-neutral-800 transition-colors"
          aria-label="View notifications"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-neutral-900" />
        </button>

        {/* User Profile */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-2 text-gray-700 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-neutral-800 transition-colors"
        >
          <UserCircle size={26} />
          <span className="hidden text-sm font-medium text-gray-800 dark:text-gray-200 md:block">
            Admin
          </span>
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
