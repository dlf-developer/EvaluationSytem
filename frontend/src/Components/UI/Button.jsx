import React from "react";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(
  (
    {
      children,
      type = "default",
      size = "middle",
      danger = false,
      loading = false,
      icon,
      disabled = false,
      htmlType = "button",
      className = "",
      style = {},
      onClick,
      block = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      small: "px-2.5 py-1 text-xs min-h-[30px]",
      middle: "px-4 py-1.5 text-sm min-h-[36px]",
      large: "px-5 py-2 text-sm md:text-base min-h-[42px]",
    };

    let variantClasses = "";
    let inlineStyles = { ...style };

    if (danger) {
      variantClasses =
        type === "primary"
          ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500/20"
          : "border border-rose-300 text-rose-600 hover:bg-rose-50";
      if (type === "primary") {
        inlineStyles.backgroundColor = inlineStyles.backgroundColor || "#dc2626";
        inlineStyles.borderColor = inlineStyles.borderColor || "#dc2626";
        inlineStyles.color = inlineStyles.color || "#ffffff";
      }
    } else {
      switch (type) {
        case "primary":
          variantClasses =
            "text-white shadow-sm focus:ring-2 focus:ring-[#4f6f52]/30 active:opacity-90";
          inlineStyles.backgroundColor = inlineStyles.backgroundColor || "#1a4d2e";
          inlineStyles.borderColor = inlineStyles.borderColor || "#1a4d2e";
          inlineStyles.color = inlineStyles.color || "#ffffff";
          break;
        case "secondary":
          variantClasses =
            "border border-[#cce0cd] hover:bg-[#e5efe5] text-[#1a4d2e]";
          inlineStyles.backgroundColor = inlineStyles.backgroundColor || "#f4f8f4";
          inlineStyles.color = inlineStyles.color || "#1a4d2e";
          break;
        case "outline":
          variantClasses =
            "border hover:bg-[#f4f8f4]";
          inlineStyles.borderColor = inlineStyles.borderColor || "#1a4d2e";
          inlineStyles.color = inlineStyles.color || "#1a4d2e";
          break;
        case "dashed":
          variantClasses =
            "border border-dashed border-gray-300 text-gray-700 hover:border-[#4f6f52] hover:text-[#1a4d2e] bg-white";
          break;
        case "text":
          variantClasses =
            "text-gray-700 hover:bg-gray-100 bg-transparent border-0";
          break;
        case "link":
          variantClasses =
            "hover:underline bg-transparent border-0 p-0 font-medium";
          inlineStyles.color = inlineStyles.color || "#1a4d2e";
          break;
        case "default":
        default:
          variantClasses =
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-xs";
          break;
      }
    }

    const displayClasses = block
      ? "w-full flex items-center justify-center"
      : "inline-flex items-center justify-center";

    return (
      <button
        ref={ref}
        type={htmlType}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${displayClasses} font-medium rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          sizeClasses[size] || sizeClasses.middle
        } ${variantClasses} ${className}`}
        style={inlineStyles}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current shrink-0" />
        ) : icon ? (
          <span className={children ? "mr-2 inline-flex items-center shrink-0" : "inline-flex items-center shrink-0"}>
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

export default Button;
