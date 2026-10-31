import React from "react";

export const Card = ({
  title,
  extra,
  children,
  bordered = true,
  className = "",
  style,
  bodyStyle,
  actions,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm ${
        bordered ? "border border-gray-200" : ""
      } overflow-hidden ${className}`}
      style={style}
      {...props}
    >
      {(title || extra) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          {title && (
            <div className="text-base font-semibold text-gray-800">
              {title}
            </div>
          )}
          {extra && <div className="text-sm text-gray-500">{extra}</div>}
        </div>
      )}
      <div className="p-6" style={bodyStyle}>
        {children}
      </div>
      {actions && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-end gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;

