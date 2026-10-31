import React from "react";
import { Inbox } from "lucide-react";

export const Empty = ({
  description = "No Data",
  children,
  image,
  className = "",
  style,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center text-gray-400 ${className}`}
      style={style}
    >
      {image ? (
        <div className="mb-3">{image}</div>
      ) : (
        <Inbox className="w-12 h-12 mb-3 stroke-[1.25] text-gray-300" />
      )}
      {description !== false && (
        <p className="text-sm text-gray-500 font-medium">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default Empty;

