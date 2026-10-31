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
      small: "px-3 py-1 text-xs h-8 rounded-lg font-medium",
      middle: "px-4 py-1.5 text-sm h-9 rounded-lg font-medium",
      large: "px-5 py-2 text-sm md:text-base h-10 rounded-xl font-semibold tracking-wide",
    };

    let variantClasses = "";
    let inlineStyles = { ...style };
    const radiusMap = {
      small: "8px",
      middle: "10px",
      large: "12px",
    };
    inlineStyles.borderRadius = inlineStyles.borderRadius || radiusMap[size] || "10px";

    if (danger) {
      if (type === "primary") {
        variantClasses =
          "text-white shadow-xs hover:brightness-105 active:scale-[0.985] active:brightness-95 focus:ring-2 focus:ring-rose-500/30 cursor-pointer";
        inlineStyles.background =
          inlineStyles.background || "linear-gradient(180deg, #e11d48 0%, #be123c 100%)";
        inlineStyles.borderColor = inlineStyles.borderColor || "#9f1239";
        inlineStyles.color = inlineStyles.color || "#ffffff";
        inlineStyles.boxShadow =
          inlineStyles.boxShadow ||
          "0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
      } else {
        variantClasses =
          "border border-rose-300 text-rose-600 hover:bg-rose-50 active:scale-[0.985] cursor-pointer";
      }
    } else {
      switch (type) {
        case "primary":
          variantClasses =
            "text-white shadow-xs hover:brightness-105 hover:shadow-md hover:shadow-[#1a4d2e]/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] active:brightness-95 focus:ring-2 focus:ring-[#1a4d2e]/30 focus:ring-offset-1 cursor-pointer transition-all duration-150";
          inlineStyles.background =
            inlineStyles.background ||
            "linear-gradient(180deg, #225934 0%, #174528 100%)";
          inlineStyles.borderColor = inlineStyles.borderColor || "#133c23";
          inlineStyles.color = inlineStyles.color || "#ffffff";
          inlineStyles.boxShadow =
            inlineStyles.boxShadow ||
            "0 1px 3px rgba(23, 69, 40, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
          break;
        case "secondary":
          variantClasses =
            "border border-emerald-200/80 hover:bg-emerald-100/60 text-[#1a4d2e] shadow-2xs active:scale-[0.985] cursor-pointer";
          inlineStyles.backgroundColor = inlineStyles.backgroundColor || "#f4f8f4";
          inlineStyles.color = inlineStyles.color || "#1a4d2e";
          break;
        case "outline":
          variantClasses =
            "border border-[#1a4d2e] text-[#1a4d2e] hover:bg-[#1a4d2e]/5 shadow-2xs active:scale-[0.985] cursor-pointer";
          inlineStyles.borderColor = inlineStyles.borderColor || "#1a4d2e";
          inlineStyles.color = inlineStyles.color || "#1a4d2e";
          break;
        case "dashed":
          variantClasses =
            "border border-dashed border-gray-300 text-gray-700 hover:border-[#1a4d2e] hover:text-[#1a4d2e] bg-white active:scale-[0.985] cursor-pointer";
          break;
        case "text":
          variantClasses =
            "text-gray-700 hover:bg-gray-100/80 bg-transparent border-0 active:scale-[0.985] cursor-pointer";
          break;
        case "link":
          variantClasses =
            "hover:underline bg-transparent border-0 p-0 font-medium cursor-pointer";
          inlineStyles.color = inlineStyles.color || "#1a4d2e";
          break;
        case "default":
        default:
          variantClasses =
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-2xs active:scale-[0.985] cursor-pointer";
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
        className={`${displayClasses} transition-all duration-150 border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none ${
          sizeClasses[size] || sizeClasses.middle
        } ${variantClasses} ${className}`}
        style={inlineStyles}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current shrink-0" />
        ) : icon ? (
          <span
            className={
              children
                ? "mr-2 inline-flex items-center shrink-0"
                : "inline-flex items-center shrink-0"
            }
          >
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

export default Button;
