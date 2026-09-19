import React, { useMemo } from "react";

export const formatTimeValue = (
  timeValue,
  { hour12 = true, useUTC = true, fallback = "N/A" } = {}
) => {
  if (!timeValue) return fallback;

  // Handle plain "HH:mm" strings
  if (
    typeof timeValue === "string" &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeValue)
  ) {
    if (!hour12) return timeValue;

    const [hours, minutes] = timeValue.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${String(adjustedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  // Handle ISO strings, Date instances, or timestamps
  const date = new Date(timeValue);
  if (isNaN(date.getTime())) return fallback;

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12,
    ...(useUTC ? { timeZone: "UTC" } : {}),
  });
};

const FormattedTime = ({
  value,
  hour12 = true,
  useUTC = false,
  fallback = "N/A",
  className = "",
}) => {
  const formatted = useMemo(
    () => formatTimeValue(value, { hour12, useUTC, fallback }),
    [value, hour12, useUTC, fallback]
  );

  return (
    <span className={`font-mono text-sm ${className}`}>
      {formatted}
    </span>
  );
};

export default FormattedTime;