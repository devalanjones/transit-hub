import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      id,
      type = "text",
      placeholder = "",
      className = "",
      disabled = false,
      error = false,
      ...rest
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400
          shadow-xs transition-all duration-200 ease-out outline-none

          /* Default border & hover */
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
              : "border-neutral-300 hover:border-neutral-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
          }

          /* Dark mode adaptation */
          dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500
          dark:hover:border-neutral-600 dark:focus:border-orange-500 dark:focus:ring-orange-500/20

          /* Disabled states */
          disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100/75 disabled:text-neutral-400 disabled:shadow-none
          dark:disabled:border-neutral-800 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-600

          ${className}`}
        {...rest}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
