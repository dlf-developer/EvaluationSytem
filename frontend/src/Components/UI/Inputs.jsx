import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Select, Option } from "./Select";

export { Select, Option };

export const Input = forwardRef(
  ({ size = "middle", className = "", error, ...props }, ref) => {
    const sizeClasses = {
      small: "h-8 py-1 px-2.5 text-xs",
      middle: "h-9 py-1.5 px-3 text-sm",
      large: "h-10 py-2 px-3.5 text-sm",
    };

    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-white text-gray-900 shadow-xs transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/15 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
          error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#1a4d2e] hover:border-gray-400"
        } ${sizeClasses[size] || sizeClasses.middle} ${className}`}
        {...props}
      />
    );
  }
);

Input.TextArea = forwardRef(
  ({ rows = 4, className = "", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full rounded-lg border bg-white p-3 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${
          error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-brand-500 hover:border-brand-500"
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.Password = forwardRef(({ size = "middle", className = "", ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        size={size}
        type={show ? "text" : "password"}
        className={`pr-10 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

export const TextArea = Input.TextArea;
export const Password = Input.Password;

export const InputNumber = forwardRef(
  ({ size = "middle", className = "", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        size={size}
        className={className}
        {...props}
      />
    );
  }
);

export const Switch = forwardRef(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      checkedChildren,
      unCheckedChildren,
      className = "",
      size = "middle",
      ...props
    },
    ref
  ) => {
    const isSmall = size === "small";
    const labelText = checked ? checkedChildren : unCheckedChildren;

    const trackWidth = isSmall ? 32 : 44;
    const trackHeight = isSmall ? 18 : 24;
    const knobSize = isSmall ? 14 : 20;
    const padding = 2;
    const translateX = trackWidth - knobSize - padding * 2; // exactly 20px for middle, 14px for small

    return (
      <div
        className={`inline-flex items-center gap-2 select-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
        onClick={() => !disabled && onChange?.(!checked)}
      >
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onChange?.(!checked);
          }}
          className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed ${
            isSmall ? "w-8 h-[18px]" : "w-11 h-6"
          }`}
          style={{
            width: `${trackWidth}px`,
            height: `${trackHeight}px`,
            minWidth: `${trackWidth}px`,
            minHeight: `${trackHeight}px`,
            padding: `${padding}px`,
            borderRadius: "9999px",
            backgroundColor: checked ? "#1a4d2e" : "#e5e7eb",
            border: "0",
            outline: "none",
            boxShadow: checked
              ? "0 0 0 1px rgba(26,77,46,0.15)"
              : "inset 0 0 0 1px rgba(0,0,0,0.06)",
            boxSizing: "border-box",
            lineHeight: 0,
            appearance: "none",
            WebkitAppearance: "none",
          }}
          {...props}
        >
          <span
            className="pointer-events-none inline-block rounded-full bg-white transition-transform duration-200 ease-in-out"
            style={{
              width: `${knobSize}px`,
              height: `${knobSize}px`,
              minWidth: `${knobSize}px`,
              minHeight: `${knobSize}px`,
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
              transform: checked ? `translateX(${translateX}px)` : "translateX(0px)",
              flexShrink: 0,
            }}
          />
        </button>
        {labelText && (
          <span
            className={`text-xs font-semibold tracking-tight transition-colors ${
              checked ? "text-[#1a4d2e]" : "text-gray-500"
            }`}
          >
            {labelText}
          </span>
        )}
      </div>
    );
  }
);

export const Checkbox = forwardRef(
  ({ checked, onChange, children, disabled = false, className = "", ...props }, ref) => {
    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked, e)}
          className="h-4 w-4 rounded border-gray-300 text-brand-800 focus:ring-brand-500"
          {...props}
        />
        {children && <span className="text-sm text-gray-700">{children}</span>}
      </label>
    );
  }
);

export const Radio = forwardRef(
  ({ value, checked, onChange, children, disabled = false, className = "", ...props }, ref) => {
    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e)}
          className="h-4 w-4 border-gray-300 text-brand-800 focus:ring-brand-500"
          {...props}
        />
        {children && <span className="text-sm text-gray-700">{children}</span>}
      </label>
    );
  }
);

Radio.Group = ({ value, onChange, children, className = "", options, ...props }) => {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`} {...props}>
      {options
        ? options.map((opt) => {
            const val = typeof opt === "object" ? opt.value : opt;
            const lbl = typeof opt === "object" ? opt.label : opt;
            return (
              <Radio
                key={val}
                value={val}
                checked={value === val}
                onChange={() => onChange?.({ target: { value: val } })}
              >
                {lbl}
              </Radio>
            );
          })
        : React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(child, {
              checked: child.props.value === value,
              onChange: (e) => onChange?.(e),
            });
          })}
    </div>
  );
};
