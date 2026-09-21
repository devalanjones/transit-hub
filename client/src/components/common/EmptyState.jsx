import Button from "./Button";
import { Bus } from "lucide-react";

const EmptyState = ({
  title,
  message,
  buttonText,
  onClick,
  icon: Icon = Bus,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/70 p-8 text-center backdrop-blur-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/60 sm:p-12">
      {/* Icon Badge Container */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-sm ring-8 ring-orange-50/50 dark:bg-orange-950/40 dark:text-orange-400 dark:ring-orange-950/20">
        {typeof Icon === "string" ? (
          <span className="text-3xl select-none">{Icon}</span>
        ) : (
          <Icon size={32} strokeWidth={1.75} />
        )}
      </div>

      {/* Title */}
      <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-2xl">
        {title}
      </h2>

      {/* Subtext message */}
      <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400 sm:text-base">
        {message}
      </p>

      {/* Action Button */}
      {buttonText && onClick && (
        <Button onClick={onClick} variant="primary">
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
