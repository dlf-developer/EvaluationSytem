import React from "react";

export const Tag = ({
  children,
  color = "default",
  className = "",
  style = {},
  icon,
  ...props
}) => {
  const presetMap = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    volcano: "bg-orange-50 text-orange-700 border-orange-200",
    orange: "bg-amber-50 text-amber-700 border-amber-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    default: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const isHex = typeof color === "string" && (color.startsWith("#") || color.startsWith("rgb"));
  const customStyle = isHex
    ? {
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color,
        ...style,
      }
    : style;

  const colorClass = presetMap[color] || (isHex ? "" : presetMap.default);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass} ${className}`}
      style={customStyle}
      {...props}
    >
      {icon && <span className="mr-1 inline-flex items-center">{icon}</span>}
      {children}
    </span>
  );
};

export const Badge = ({
  count,
  children,
  text,
  status = "default",
  color,
  className = "",
  style,
  ...props
}) => {
  const statusColors = {
    success: "bg-emerald-500",
    processing: "bg-blue-500 animate-pulse",
    default: "bg-gray-400",
    error: "bg-rose-500",
    warning: "bg-amber-500",
  };

  if (!children) {
    if (text) {
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs text-gray-700 ${className}`} style={style} {...props}>
          <span className={`w-2 h-2 rounded-full ${statusColors[status] || "bg-gray-400"}`} />
          <span>{text}</span>
        </span>
      );
    }
    if (count !== undefined) {
      return (
        <span
          className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full ${className}`}
          style={style}
          {...props}
        >
          {count}
        </span>
      );
    }
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`} style={style} {...props}>
      {children}
      {count !== undefined && count !== 0 && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full ring-2 ring-white">
          {count}
        </span>
      )}
    </div>
  );
};

export default Tag;

