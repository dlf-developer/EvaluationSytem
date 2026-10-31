import React from "react";

export const Space = ({
  children,
  size = "small",
  direction = "horizontal",
  align,
  wrap = false,
  className = "",
  style,
  ...props
}) => {
  const gapMap = {
    small: "gap-2",
    middle: "gap-3",
    large: "gap-4",
  };

  const isVertical = direction === "vertical";
  const flexDir = isVertical ? "flex-col" : "flex-row";
  const alignClass = align
    ? `items-${align}`
    : isVertical
    ? "items-stretch"
    : "items-center";
  const wrapClass = wrap ? "flex-wrap" : "";
  const gapClass = typeof size === "string" ? gapMap[size] || "gap-2" : "";
  const customStyle = typeof size === "number" ? { gap: `${size}px`, ...style } : style;

  return (
    <div
      className={`inline-flex ${flexDir} ${alignClass} ${wrapClass} ${gapClass} ${className}`}
      style={customStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default Space;

