import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

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
    small: "h-7.5 py-1 px-2 text-xs",
    middle: "h-9 py-1.5 px-3 text-sm",
    large: "h-10 py-2 px-3.5 text-base",
  };

  return (
    <div className={`relative inline-flex items-center w-full ${className}`} style={style}>
      <input
        type="date"
        disabled={disabled}
        value={stringVal}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 bg-white text-gray-800 shadow-2xs transition-colors hover:border-[#1a4d2e] focus:border-[#1a4d2e] focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/15 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
          sizeClasses[size] || sizeClasses.middle
        }`}
        {...props}
      />
      <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
    </div>
  );
};

export const RangePicker = ({
  value,
  onChange,
  disabled = false,
  className = "",
  style,
  size = "middle",
  placeholder = ["Start date", "End date"],
  ...props
}) => {
  const startVal = Array.isArray(value) ? formatToString(value[0]) : "";
  const endVal = Array.isArray(value) ? formatToString(value[1]) : "";

  const handleStartChange = (e) => {
    const newStart = e.target.value;
    onChange?.([newStart, endVal], [newStart, endVal]);
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    onChange?.([startVal, newEnd], [startVal, newEnd]);
  };

  const sizeClasses = {
    small: "h-7.5 py-1 px-2 text-xs",
    middle: "h-9 py-1 px-2.5 text-sm",
    large: "h-10 py-1.5 px-3 text-sm",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 w-full rounded-lg border border-gray-300 bg-white px-2.5 shadow-2xs hover:border-[#1a4d2e] focus-within:border-[#1a4d2e] focus-within:ring-2 focus-within:ring-[#1a4d2e]/15 transition-all ${
        sizeClasses[size] || sizeClasses.middle
      } ${disabled ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""} ${className}`}
      style={style}
      {...props}
    >
      <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        type="date"
        disabled={disabled}
        value={startVal}
        onChange={handleStartChange}
        className="w-full bg-transparent text-gray-800 focus:outline-none text-xs md:text-sm"
      />
      <span className="text-gray-400 text-xs shrink-0 select-none font-medium">→</span>
      <input
        type="date"
        disabled={disabled}
        value={endVal}
        onChange={handleEndChange}
        className="w-full bg-transparent text-gray-800 focus:outline-none text-xs md:text-sm"
      />
    </div>
  );
};

DatePicker.RangePicker = RangePicker;

export default DatePicker;
