const Button = ({
  children,
  type = "button",
  variant = "primary", // primary | secondary | outline | ghost | danger
  size = "md", // sm | md | lg
  onClick,
  className = "",
  disabled = false,
  loading = false,
}) => {
  // Base sizing tokens
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-5 py-3 text-base rounded-xl gap-2.5",
  };

  // Modern variant styles
  const variants = {
    // Vibrant solid orange with soft layered glow, top inner highlight, and micro-press scale
    primary: `
      bg-orange-500 text-white font-semibold
      shadow-sm shadow-orange-500/30 hover:shadow-md hover:shadow-orange-500/40
      hover:bg-orange-600 active:bg-orange-700
      border border-orange-400/30
    `,
    // Soft tinted orange surface for secondary actions
    secondary: `
      bg-orange-50 text-orange-600 font-medium
      hover:bg-orange-100 active:bg-orange-200
      dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-950/50
    `,
    // Crisp bordered button with hover fill
    outline: `
      border border-orange-300 text-orange-600 bg-transparent font-medium
      hover:bg-orange-50 hover:border-orange-400 active:bg-orange-100
      dark:border-orange-500/30 dark:text-orange-400 dark:hover:bg-orange-950/30
    `,
    // Subtle button with zero border
    ghost: `
      text-orange-600 bg-transparent font-medium
      hover:bg-orange-50/80 active:bg-orange-100
      dark:text-orange-400 dark:hover:bg-neutral-800
    `,
    // Dedicated destructive action style
    danger: `
      bg-red-600 text-white font-semibold
      shadow-sm shadow-red-500/30 hover:bg-red-700 active:bg-red-800
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center select-none tracking-tight
        transition-all duration-200 ease-out
        active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-neutral-900
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none
        ${sizes[size] || sizes.md}
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
