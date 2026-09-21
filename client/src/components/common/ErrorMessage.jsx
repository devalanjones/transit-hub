import { AlertCircle } from "lucide-react";

const ErrorMessage = ({
  message = "Something went wrong",
  variant = "inline", // "inline" for form inputs | "banner" for card/page alerts
  className = "",
}) => {
  if (!message) return null;

  // Compact inline format for form fields
  if (variant === "inline") {
    return (
      <div
        className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400 ${className}`}
        role="alert"
      >
        <AlertCircle size={14} className="shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  // Polished alert banner for page/card-level errors
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/80 p-3.5 text-sm text-red-800 backdrop-blur-xs transition-colors duration-200 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 ${className}`}
      role="alert"
    >
      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
      />
      <p className="leading-snug">{message}</p>
    </div>
  );
};

export default ErrorMessage;
