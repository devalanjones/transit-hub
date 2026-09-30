import { useEffect, useState } from "react";
import UserNavbar from "./UserNavbar";
import UserSidebar from "./UserSidebar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return typeof window !== "undefined"
            ? window.innerWidth >= 768
            : true;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="relative min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-white">
            {/* Navbar */}
            <UserNavbar
                setSidebarOpen={setSidebarOpen}
                sidebarOpen={sidebarOpen}
            />

            <div className="flex">

                {/* Mobile Backdrop */}
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close sidebar"
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
                    />
                )}

                {/* Sidebar */}
                <UserSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Main Workspace */}
                <main
                    className={`min-h-[calc(100vh-76px)] min-w-0 flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? "md:ml-64" : "md:ml-0"
                        }`}
                >
                    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
};

export default UserLayout;