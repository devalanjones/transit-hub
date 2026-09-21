const Loading = ({
  message = "Loading...",
  size = "md", // "sm" | "md" | "lg"
  fullScreen = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-14 w-14 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 transition-colors duration-200 ${
        fullScreen
          ? "fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs"
          : "h-96 w-full"
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Dual-ring branded spinner */}
      <div className="relative flex items-center justify-center">
        {/* Soft background track ring */}
        <div
          className={`rounded-full border-orange-200 dark:border-slate-800 ${sizeClasses[size] || sizeClasses.md}`}
        />
        {/* Animated accent ring */}
        <div
          className={`absolute rounded-full border-transparent border-t-orange-500 border-r-orange-500 animate-spin ${sizeClasses[size] || sizeClasses.md}`}
        />
      </div>

      {/* Subtext */}
      {message && (
        <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loading;
