import React from "react";
import { Loader2 } from "lucide-react";

export const Spin = ({
  spinning = true,
  size = "default",
  tip,
  children,
  className = "",
  style,
}) => {
  const sizeMap = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-10 h-10",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={`animate-spin text-brand-800 ${sizeMap[size] || sizeMap.default}`}
      />
      {tip && <span className="text-xs text-gray-500 font-medium">{tip}</span>}
    </div>
  );

  if (!children) {
    if (!spinning) return null;
    return (
      <div
        className={`inline-flex items-center justify-center p-2 ${className}`}
        style={style}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {children}
      {spinning && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px] transition-opacity">
          {spinner}
        </div>
      )}
    </div>
  );
};

export default Spin;

