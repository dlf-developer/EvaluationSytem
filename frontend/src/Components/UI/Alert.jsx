import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export const Alert = ({
  type = "info",
  message,
  description,
  showIcon = false,
  closable = false,
  onClose,
  className = "",
  style,
}) => {
  const [closed, setClosed] = React.useState(false);
  if (closed) return null;

  const styleMap = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-900",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-900",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  const current = styleMap[type] || styleMap.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${current.bg} ${className}`}
      style={style}
    >
      {showIcon && <div className="mt-0.5">{current.icon}</div>}
      <div className="flex-1 text-sm">
        {message && <div className="font-semibold">{message}</div>}
        {description && <div className="mt-1 text-xs opacity-90">{description}</div>}
      </div>
      {closable && (
        <button
          type="button"
          onClick={() => {
            setClosed(true);
            onClose?.();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

