import React from "react";
import { Inbox } from "lucide-react";

const SIMPLE_IMAGE_SENTINEL = "__PRESENTED_IMAGE_SIMPLE__";

export const Empty = ({
  description = "No Data",
  children,
  image,
  className = "",
  style,
}) => {
  const isSimple = image === SIMPLE_IMAGE_SENTINEL;

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isSimple ? "p-4" : "p-8"
      } text-center text-gray-400 ${className}`}
      style={style}
    >
      {image && !isSimple ? (
        <div className="mb-3">{image}</div>
      ) : (
        <Inbox
          className={`${
            isSimple ? "w-8 h-8 mb-2" : "w-12 h-12 mb-3"
          } stroke-[1.25] text-gray-300`}
        />
      )}
      {description !== false && (
        <p className="text-sm text-gray-500 font-medium">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

Empty.PRESENTED_IMAGE_SIMPLE = SIMPLE_IMAGE_SENTINEL;

export default Empty;

