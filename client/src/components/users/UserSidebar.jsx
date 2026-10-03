import {
    Home,
    Bus,
    Bell,
    MessageSquare,
    User,
    LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const UserSidebar = ({ sidebarOpen, setSidebarOpen }) => {
    return (
        <aside
            className={`fixed left-0 top-[76px] z-50 h-[calc(100vh-76px)] w-64
                border-r border-gray-200 bg-white
                transition-transform duration-300
                dark:border-gray-800 dark:bg-[#11161d]
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
        >
            {/* Menu */}
            <nav className="space-y-2 px-4 py-6">

                {/* Home */}
                <NavLink
                    to="/user"
                    end
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`
                    }
                >
                    <Home size={20} />
                    <span>Home</span>
                </NavLink>

                {/* Bus Schedule */}
                <NavLink
                    to="/user/schedules"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`
                    }
                >
                    <Bus size={20} />
                    <span>Bus Schedule</span>
                </NavLink>

                {/* Notifications */}
                <NavLink
                    to="/user/notifications"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`
                    }
                >
                    <Bell size={20} />
                    <span>Notifications</span>
                </NavLink>

                {/* Feedback */}
                <NavLink
                    to="/user/feedback"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`
                    }
                >
                    <MessageSquare size={20} />
                    <span>Feedback</span>
                </NavLink>

                {/* Profile */}
                <NavLink
                    to="/user/profile"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`
                    }
                >
                    <User size={20} />
                    <span>Profile</span>
                </NavLink>
            </nav>

            {/* Logout */}
            <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 dark:border-gray-800">
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default UserSidebar;