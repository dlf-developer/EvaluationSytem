import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

export const DatePicker = ({
  value,
  onChange,
  disabledDate,
  format = "YYYY-MM-DD",
  placeholder = "Select date",
  disabled = false,
  className = "",
  style,
  size = "middle",
  ...props
}) => {
  // Convert incoming value (moment, dayjs, Date, or string) to YYYY-MM-DD
  const formatToString = (val) => {
    if (!val) return "";
    if (typeof val === "string") {
      return val.split("T")[0];
    }
    if (val._isAMomentObject || (val && typeof val.format === "function")) {
      return val.format("YYYY-MM-DD");
    }
    if (val instanceof Date && !isNaN(val)) {
      return val.toISOString().split("T")[0];
    }
    return "";
  };

  const stringVal = formatToString(value);

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (disabledDate) {
      const checkDate = new Date(newVal);
      if (disabledDate(checkDate)) {
        return;
      }
    }
    onChange?.(newVal, newVal);
  };

  const sizeClasses = {
    small: "py-1 px-2 text-xs",
    middle: "py-2 px-3 text-sm",
    large: "py-2.5 px-4 text-base",
  };

  return (
    <div className={`relative inline-flex items-center w-full ${className}`} style={style}>
      <input
        type="date"
        disabled={disabled}
        value={stringVal}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm transition-colors hover:border-brand-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
          sizeClasses[size] || sizeClasses.middle
        }`}
        {...props}
      />
      <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
    </div>
  );
};

export default DatePicker;

