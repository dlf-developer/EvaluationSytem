import React, { useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import Button from "./Button";

export const Modal = ({
  open,
  visible,
  title,
  onCancel,
  onOk,
  footer,
  okText = "OK",
  cancelText = "Cancel",
  confirmLoading = false,
  width = 520,
  children,
  destroyOnClose = false,
  className = "",
  style,
}) => {
  const isOpen = open !== undefined ? open : visible;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && destroyOnClose) return null;
  if (!isOpen) return null;

  const widthStyle =
    typeof width === "number" ? { maxWidth: `${width}px` } : { maxWidth: width };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full my-8 border border-gray-100 ${className}`}
          style={{ ...widthStyle, ...style }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 inline-flex items-center justify-center transition-colors hover:bg-gray-100 ml-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 text-gray-700">{children}</div>

          {/* Footer */}
          {footer !== null && (
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-gray-100 bg-gray-50/60">
              {footer !== undefined ? (
                footer
              ) : (
                <>
                  <Button onClick={onCancel} disabled={confirmLoading}>
                    {cancelText}
                  </Button>
                  <Button
                    type="primary"
                    onClick={onOk}
                    loading={confirmLoading}
                  >
                    {okText}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

