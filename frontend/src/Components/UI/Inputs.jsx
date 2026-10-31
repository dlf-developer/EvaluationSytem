import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Select, Option } from "./Select";

export { Select, Option };

export const Input = forwardRef(
  ({ size = "middle", className = "", error, ...props }, ref) => {
    const sizeClasses = {
      small: "py-1 px-2.5 text-xs",
      middle: "py-2 px-3.5 text-sm",
      large: "py-2.5 px-4 text-base",
    };

    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-white text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${
          error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-brand-500 hover:border-brand-500"
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
  ({ checked = false, onChange, disabled = false, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-brand-800" : "bg-gray-200"
        } ${className}`}
        {...props}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
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
