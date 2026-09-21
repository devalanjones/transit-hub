import { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  // Open on desktop (>= 768px), closed on mobile (< 768px) initially
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  });

  // Keep sidebar responsive across window resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative min-h-screen bg-neutral-50/60 text-neutral-800 transition-colors duration-300 dark:bg-zinc-950 dark:text-neutral-100">
      {/* Top Navbar */}
      <AdminNavbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Dynamic Main Workspace with Responsive Padding & Transition */}
        <main
          className={`flex-1 min-w-0 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "md:ml-64" : "md:ml-0"
          }`}
        >
          {/* Centered content wrapper to maintain balanced proportions on large screens */}
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
