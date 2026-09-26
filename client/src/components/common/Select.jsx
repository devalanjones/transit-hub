import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  (
    {
      id,
      name,
      value,
      onChange,
      options = [],
      placeholder,
      className = "",
      disabled = false,
      error = false,
      ...rest
    },
    ref,
  ) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          id={id}
          name={name}
          defaultValue={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl border bg-white py-2.5 pl-4 pr-10 text-sm text-slate-800 shadow-xs transition-all duration-200 outline-none
            
            /* Border & Orange Focus states */
            ${error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
              : "border-slate-300 hover:border-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
            }

            /* Dark mode styling */
            dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-orange-500 dark:focus:ring-orange-500/20

            /* Disabled states */
            disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100/75 disabled:text-slate-400 disabled:shadow-none
            dark:disabled:border-slate-800 dark:disabled:bg-slate-900 dark:disabled:text-slate-600

            ${className}`}
          {...rest}
        >
          {placeholder && (
            <option
              value=""
              disabled
              className="text-slate-400 dark:bg-slate-800"
            >
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
          <ChevronDown size={18} strokeWidth={2} />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
