import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Drawer = ({
  open,
  onClose,
  placement = "left",
  children,
  closable = true,
  className = "",
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const placementContainerClass =
    placement === "right"
      ? "inset-y-0 right-0 max-w-full flex"
      : placement === "top"
      ? "inset-x-0 top-0 max-h-full flex"
      : placement === "bottom"
      ? "inset-x-0 bottom-0 max-h-full flex"
      : "inset-y-0 left-0 max-w-full flex";

  const panelSizeClass =
    placement === "top" || placement === "bottom"
      ? "w-full max-h-[85vh]"
      : "w-80 max-w-xs";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`fixed ${placementContainerClass}`}>
        <div className={`relative ${panelSizeClass} bg-white shadow-xl flex flex-col ${className}`}>
          {closable && (
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;

