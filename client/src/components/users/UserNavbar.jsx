import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bus,
  ChevronRight,
  Bell,
  UserCircle,
  Sun,
  Moon,
  Search,
  Home,
  X,
  MapPin,
  Route,
} from "lucide-react";

const UserNavbar = ({ setSidebarOpen, sidebarOpen }) => {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Global Search
  const handleSearch = (event) => {
    event.preventDefault();

    const search = searchValue.trim();

    if (!search) return;
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchValue(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    setSuggestions([]);
  };

  const handleSuggestionSelect = (result) => {
    if (result.type === "bus") {
      navigate(`/user/buses/${result.id}`);
    }

    if (result.type === "route") {
      navigate(`/user/schedules?route=${result.id}`);
    }

    if (result.type === "stop") {
      navigate(`/user/schedules?stop=${result.id}`);
    }

    setSearchValue("");
    setSuggestions([]);
    setMobileSearchOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white text-gray-900 shadow-md transition-colors duration-300 dark:border-neutral-800 dark:bg-[#080b10] dark:text-white">
      {/* Main Navbar */}
      <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-10">

        {/* Left Section */}
        <div className="flex items-center gap-4">

          {/* Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="group flex items-center gap-1 rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Bus
              size={22}
              className="text-orange-500 transition-colors group-hover:text-orange-400"
            />

            <ChevronRight
              size={17}
              className={`transition-transform duration-300 ${sidebarOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* TransitHub Logo */}
          <button
            type="button"
            onClick={() => navigate("/user")}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-yellow-400 shadow-md shadow-orange-500/20">
              <Bus size={24} className="text-black" />
            </div>

            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              <span className="text-gray-900 dark:text-white">Transit</span>
              <span className="text-orange-500">Hub</span>
            </span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">

          {/* Home */}
          <button
            type="button"
            onClick={() => navigate("/user")}
            className="group relative flex items-center gap-2 px-4 py-3 text-sm font-medium text-orange-600 dark:text-orange-400"
          >
            <Home size={17} />

            <span>Home</span>

            <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-orange-500" />
          </button>

          {/* Global Search */}
          <div className="relative ml-3">
            <form onSubmit={handleSearch}>
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                type="search"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search"
                className="w-52 rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-orange-500/30 xl:w-64"
              />
            </form>

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-neutral-700 bg-[#11151b] shadow-2xl">
                {suggestions.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => handleSuggestionSelect(result)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-orange-500/10"
                  >
                    <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                      {result.type === "bus" && <Bus size={18} />}
                      {result.type === "route" && <Route size={18} />}
                      {result.type === "stop" && <MapPin size={18} />}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {result.title}
                      </p>

                      <p className="text-xs text-neutral-500">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Mobile Search */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="rounded-lg p-2.5 text-gray-600 transition-all hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-orange-400"
            aria-label="Search"
          >
            {mobileSearchOpen ? (
              <X size={20} />
            ) : (
              <Search size={20} />
            )}
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="rounded-lg p-2.5 text-neutral-300 transition-all hover:bg-white/10 hover:text-orange-400"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* Notification */}
          <button
            type="button"
            onClick={() => navigate("/user/notification")}
            className="relative rounded-lg p-2.5 text-neutral-300 transition-all hover:bg-white/10 hover:text-orange-400"
            aria-label="View notifications"
          >
            <Bell size={20} />

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-[#080b10]" />
          </button>

          {/* Divider */}
          <div className="mx-1 hidden h-7 w-px bg-gray-200 dark:bg-neutral-700 sm:block" />

          {/* User Profile */}
          <button
            type="button"
            onClick={() => navigate("/user/profile")}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-neutral-300 transition-all hover:bg-white/10 hover:text-white"
            aria-label="View profile"
          >
            <UserCircle
              size={27}
              className="text-neutral-300"
            />

            <span className="hidden text-sm font-medium text-gray-800 dark:text-white sm:block">
              User
            </span>
          </button>


        </div>
      </div>

      {/* Mobile Search */}
      <div
        className={`overflow-visible border-t border-gray-200 dark:border-neutral-800 px-4 transition-all duration-300 lg:hidden ${mobileSearchOpen
          ? "max-h-32 py-3 opacity-100"
          : "max-h-0 opacity-0"
          }`}
      >
        <div className="relative">
          <form onSubmit={handleSearch}>
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <input
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              autoFocus={mobileSearchOpen}
              placeholder="Search"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
            />
          </form>

          {/* Mobile Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-neutral-700 bg-[#11151b] shadow-2xl">
              {suggestions.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => handleSuggestionSelect(result)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-orange-500/10"
                >
                  <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                    {result.type === "bus" && <Bus size={18} />}
                    {result.type === "route" && <Route size={18} />}
                    {result.type === "stop" && <MapPin size={18} />}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      {result.title}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {result.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;