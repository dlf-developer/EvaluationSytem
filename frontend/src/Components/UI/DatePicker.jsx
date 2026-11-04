import React, { forwardRef, useEffect, useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, X } from "lucide-react";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css";

const MONTH_OPTIONS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const yr = currentYear - 15 + i;
  return { value: yr, label: String(yr) };
});

const CalendarDropdown = ({ value, options, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      setTimeout(() => {
        if (listRef.current) {
          const selectedEl = listRef.current.querySelector('[data-selected="true"]');
          if (selectedEl) {
            selectedEl.scrollIntoView({ block: "nearest" });
          }
        }
      }, 20);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const selectedOpt = options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#1a4d2e] bg-[#f4f8f4] hover:bg-[#e8f5e9] border border-[#cce0cd] rounded-lg px-2.5 py-1 transition-colors cursor-pointer outline-none shadow-2xs"
      >
        <span>{selectedOpt?.label || label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#1a4d2e] transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute left-0 top-full mt-1.5 w-36 max-h-48 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 p-1 z-[100] space-y-0.5 custom-calendar-dropdown-list"
          style={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                data-selected={isSelected}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors select-none ${
                  isSelected
                    ? "bg-[#1a4d2e] text-white font-semibold"
                    : "text-gray-700 hover:bg-[#f4f8f4] hover:text-[#1a4d2e] font-medium"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const parseToDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (val._isAMomentObject || (val && typeof val.toDate === "function")) {
    try {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      // fallback
    }
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10) - 1;
      const d = parseInt(isoMatch[3], 10);
      const date = new Date(y, m, d);
      return isNaN(date.getTime()) ? null : date;
    }
    const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (slashMatch) {
      const d = parseInt(slashMatch[1], 10);
      const m = parseInt(slashMatch[2], 10) - 1;
      const y = parseInt(slashMatch[3], 10);
      const date = new Date(y, m, d);
      return isNaN(date.getTime()) ? null : date;
    }
    const fallback = new Date(val);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const formatDate = (date, format = "YYYY-MM-DD") => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (format === "DD/MM/YYYY" || format === "DD-MM-YYYY") {
    return `${d}/${m}/${y}`;
  }
  return `${y}-${m}-${d}`;
};

const formatDisplay = (date) => {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const makeFilterDate = (disabledDate) => {
  if (!disabledDate) return undefined;
  return (date) => {
    try {
      const djs = dayjs(date);
      djs._isAMomentObject = true;
      const isDis = disabledDate(djs) || disabledDate(date);
      return !isDis;
    } catch {
      return true;
    }
  };
};

const renderCustomHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => (
  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white relative z-20">
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        decreaseMonth();
      }}
      disabled={prevMonthButtonDisabled}
      aria-label="Previous Month"
      className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>

    <div className="flex items-center gap-2">
      <CalendarDropdown
        value={date.getMonth()}
        options={MONTH_OPTIONS}
        onChange={changeMonth}
        label="Month"
      />
      <CalendarDropdown
        value={date.getFullYear()}
        options={YEAR_OPTIONS}
        onChange={changeYear}
        label="Year"
      />
    </div>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        increaseMonth();
      }}
      disabled={nextMonthButtonDisabled}
      aria-label="Next Month"
      className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

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
  allowClear = true,
  ...props
}) => {
  const selectedDate = parseToDate(value);

  const handleDateChange = (date) => {
    if (!date) {
      onChange?.(null, "");
      return;
    }
    const djs = dayjs(date);
    djs._isAMomentObject = true;
    const strVal = formatDate(date, format);
    onChange?.(djs, strVal);
  };

  const handleClear = () => {
    onChange?.(null, "");
  };

  const sizeClasses = {
    small: "h-8 py-1 px-2.5 text-xs",
    middle: "h-9 py-1.5 px-3 text-sm",
    large: "h-10 py-2 px-3.5 text-sm",
  };

  const DateCustomInput = forwardRef(({ onClick }, ref) => {
    const text = selectedDate ? formatDisplay(selectedDate) : "";

    return (
      <div
        ref={ref}
        onClick={!disabled ? onClick : undefined}
        className={`group relative flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white px-3 transition-all cursor-pointer hover:border-[#1a4d2e] focus-within:border-[#1a4d2e] focus-within:ring-2 focus-within:ring-[#1a4d2e]/15 ${
          sizeClasses[size] || sizeClasses.middle
        } ${disabled ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""} ${className}`}
        style={style}
      >
        <span
          className={`text-sm truncate select-none ${
            text ? "text-gray-800 font-medium" : "text-gray-400"
          }`}
        >
          {text || placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedDate && allowClear && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              title="Clear date"
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-[#1a4d2e] transition-colors" />
        </div>
      </div>
    );
  });

  DateCustomInput.displayName = "DateCustomInput";

  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      disabled={disabled}
      filterDate={makeFilterDate(disabledDate)}
      renderCustomHeader={renderCustomHeader}
      calendarClassName="custom-calendar-popup"
      popperPlacement="bottom-start"
      customInput={<DateCustomInput />}
      dateFormat="dd/MM/yyyy"
      portalId={typeof document !== "undefined" && document.getElementById("root") ? "root" : undefined}
      {...props}
    />
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
  disabledDate,
  allowClear = true,
  ...props
}) => {
  const initialStart = Array.isArray(value) && value[0] ? parseToDate(value[0]) : null;
  const initialEnd = Array.isArray(value) && value[1] ? parseToDate(value[1]) : null;

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  useEffect(() => {
    setStartDate(initialStart);
    setEndDate(initialEnd);
  }, [
    initialStart ? initialStart.getTime() : null,
    initialEnd ? initialEnd.getTime() : null,
  ]);

  const handleRangeChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const d1 = dayjs(start);
      const d2 = dayjs(end);
      d1._isAMomentObject = true;
      d2._isAMomentObject = true;
      const s1 = formatDate(start, "YYYY-MM-DD");
      const s2 = formatDate(end, "YYYY-MM-DD");
      onChange?.([d1, d2], [s1, s2]);
    } else if (!start && !end) {
      onChange?.(null, null);
    }
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange?.(null, null);
  };

  const sizeClasses = {
    small: "h-8 py-1 px-2.5 text-xs",
    middle: "h-9 py-1.5 px-3 text-sm",
    large: "h-10 py-2 px-3.5 text-sm",
  };

  const RangeCustomInput = forwardRef(({ onClick }, ref) => {
    const startText = startDate ? formatDisplay(startDate) : "";
    const endText = endDate ? formatDisplay(endDate) : "";
    const hasValue = Boolean(startDate || endDate);

    return (
      <div
        ref={ref}
        onClick={!disabled ? onClick : undefined}
        className={`group relative flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white px-3 transition-all cursor-pointer hover:border-[#1a4d2e] focus-within:border-[#1a4d2e] focus-within:ring-2 focus-within:ring-[#1a4d2e]/15 ${
          sizeClasses[size] || sizeClasses.middle
        } ${disabled ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""} ${className}`}
        style={style}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={`text-sm truncate select-none ${
              startText ? "text-gray-800 font-medium" : "text-gray-400"
            }`}
          >
            {startText || placeholder[0] || "Start date"}
          </span>
          <span className="text-gray-400 text-xs shrink-0 select-none">→</span>
          <span
            className={`text-sm truncate select-none ${
              endText ? "text-gray-800 font-medium" : "text-gray-400"
            }`}
          >
            {endText || placeholder[1] || "End date"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {hasValue && allowClear && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              title="Clear date range"
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-[#1a4d2e] transition-colors" />
        </div>
      </div>
    );
  });

  RangeCustomInput.displayName = "RangeCustomInput";

  return (
    <ReactDatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={handleRangeChange}
      disabled={disabled}
      filterDate={makeFilterDate(disabledDate)}
      renderCustomHeader={renderCustomHeader}
      calendarClassName="custom-calendar-popup"
      popperPlacement="bottom-start"
      customInput={<RangeCustomInput />}
      dateFormat="dd/MM/yyyy"
      portalId={typeof document !== "undefined" && document.getElementById("root") ? "root" : undefined}
      {...props}
    />
  );
};

DatePicker.RangePicker = RangePicker;

export default DatePicker;
