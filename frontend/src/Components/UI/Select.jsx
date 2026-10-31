import React, { useState, useRef, useEffect, forwardRef, useMemo } from "react";
import { ChevronDown, Check, X, Search, Loader2 } from "lucide-react";

export const Option = ({ value, children, disabled, label, ...props }) => {
  return null;
};

export const Select = forwardRef(
  (
    {
      value,
      onChange,
      options,
      children,
      placeholder = "Select...",
      disabled = false,
      size = "middle",
      showSearch,
      allowClear = false,
      mode, // "multiple" or undefined
      className = "",
      style,
      error = false,
      loading = false,
      onSearch,
      filterOption,
      ...props
    },
    ref
  ) => {
    const isMultiple = mode === "multiple";
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Normalize selected value(s)
    const selectedValues = useMemo(() => {
      if (value === undefined || value === null) return [];
      if (Array.isArray(value)) return value;
      return [value];
    }, [value]);

    // Extract options from either props.options or props.children (<Option />)
    const normalizedOptions = useMemo(() => {
      if (options && Array.isArray(options)) {
        return options.map((opt) =>
          typeof opt === "object" && opt !== null
            ? {
                value: opt.value,
                label: opt.label !== undefined ? opt.label : String(opt.value),
                disabled: Boolean(opt.disabled),
              }
            : { value: opt, label: String(opt), disabled: false }
        );
      }

      const list = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          list.push({
            value: child.props.value,
            label: child.props.children || child.props.label || String(child.props.value),
            disabled: Boolean(child.props.disabled),
          });
        }
      });
      return list;
    }, [options, children]);

    // Filter options by search term
    const filteredOptions = useMemo(() => {
      if (!searchTerm.trim()) return normalizedOptions;
      const lower = searchTerm.toLowerCase();
      return normalizedOptions.filter((opt) => {
        if (filterOption && typeof filterOption === "function") {
          return filterOption(searchTerm, opt);
        }
        return String(opt.label).toLowerCase().includes(lower);
      });
    }, [normalizedOptions, searchTerm, filterOption]);

    // Fast windowed rendering
    const DISPLAY_LIMIT = 60;
    const displayedOptions = useMemo(() => {
      return filteredOptions.slice(0, DISPLAY_LIMIT);
    }, [filteredOptions]);

    // Find current selected options objects
    const selectedOptionsList = useMemo(() => {
      return normalizedOptions.filter((opt) => selectedValues.includes(opt.value));
    }, [normalizedOptions, selectedValues]);

    // Close on click outside
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
        if (showSearch || normalizedOptions.length > 5) {
          searchInputRef.current?.focus();
        }
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isOpen, showSearch, normalizedOptions.length]);

    // Handle Option Selection
    const handleSelect = (optVal, optDisabled) => {
      if (optDisabled || disabled) return;

      if (isMultiple) {
        const next = selectedValues.includes(optVal)
          ? selectedValues.filter((v) => v !== optVal)
          : [...selectedValues, optVal];
        onChange?.(next);
      } else {
        onChange?.(optVal);
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleRemoveTag = (e, valToRemove) => {
      e.stopPropagation();
      if (disabled) return;
      if (isMultiple) {
        onChange?.(selectedValues.filter((v) => v !== valToRemove));
      } else {
        onChange?.(undefined);
      }
    };

    const handleClear = (e) => {
      e.stopPropagation();
      onChange?.(isMultiple ? [] : undefined);
      setSearchTerm("");
    };

    const sizeClasses = {
      small: "min-h-[30px] py-1 px-2.5 text-xs",
      middle: "min-h-[36px] py-1.5 px-3 text-sm",
      large: "min-h-[40px] py-2 px-3.5 text-sm",
    };

    const isSearchable = showSearch ?? normalizedOptions.length > 5;

    return (
      <div
        ref={containerRef}
        className={`relative w-full text-left select-none ${className}`}
        style={style}
      >
        {/* Trigger Button */}
        <div
          ref={ref}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between rounded-lg border bg-white shadow-xs transition-colors cursor-pointer ${
            error
              ? "border-red-500 ring-1 ring-red-500"
              : isOpen
              ? "border-[#1a4d2e] ring-1 ring-[#1a4d2e]"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""} ${
            sizeClasses[size] || sizeClasses.middle
          }`}
          {...props}
        >
          <div className="flex-1 flex flex-wrap items-center gap-1.5 overflow-hidden py-0.5">
            {selectedOptionsList.length > 0 ? (
              isMultiple ? (
                selectedOptionsList.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f4f8f4] text-[#1a4d2e] text-xs font-medium border border-[#cce0cd]"
                  >
                    <span className="truncate max-w-[200px]">{opt.label}</span>
                    {!disabled && (
                      <X
                        className="w-3 h-3 text-[#1a4d2e] hover:text-red-600 cursor-pointer"
                        onClick={(e) => handleRemoveTag(e, opt.value)}
                      />
                    )}
                  </span>
                ))
              ) : (
                <span className="truncate block text-gray-900 font-normal">
                  {selectedOptionsList[0].label}
                </span>
              )
            ) : (
              <span className="text-gray-400 truncate block font-normal">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {loading ? (
              <Loader2 className="w-4 h-4 text-[#1a4d2e] animate-spin" />
            ) : (
              <>
                {allowClear && selectedOptionsList.length > 0 && !disabled && (
                  <span
                    onClick={handleClear}
                    className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${
                    isOpen ? "rotate-180 text-[#1a4d2e]" : ""
                  }`}
                />
              </>
            )}
          </div>
        </div>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-full min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {/* Search Input when applicable */}
            {isSearchable && (
              <div className="px-2.5 pt-1.5 pb-1 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      onSearch?.(e.target.value);
                    }}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#1a4d2e]"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto py-0.5">
              {displayedOptions.length > 0 ? (
                displayedOptions.map((opt, idx) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value ?? idx}
                      onClick={() => handleSelect(opt.value, opt.disabled)}
                      className={`flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                        opt.disabled
                          ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400"
                          : isSelected
                          ? "bg-[#f4f8f4] text-[#1a4d2e] font-semibold"
                          : "text-gray-700 hover:bg-[#f4f8f4]/80 hover:text-[#1a4d2e]"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#1a4d2e] shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-3 text-center text-xs text-gray-400 font-medium">
                  {loading ? "Loading..." : "No options found"}
                </div>
              )}
              {filteredOptions.length > DISPLAY_LIMIT && (
                <div className="px-3 py-1 text-[11px] text-gray-400 text-center bg-gray-50 border-t border-gray-100">
                  Showing {DISPLAY_LIMIT} of {filteredOptions.length} — type to filter
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Select.Option = Option;

export default Select;
