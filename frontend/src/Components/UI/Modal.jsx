import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { X, AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
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
  okType = "primary",
  danger = false,
  okButtonProps = {},
  cancelButtonProps = {},
  centered = false,
  closable = true,
  maskClosable = true,
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
  const isDanger = Boolean(danger || okType === "danger");
  const {
    onClick: okExtraClick,
    disabled: okExtraDisabled,
    ...restOkButtonProps
  } = okButtonProps || {};
  const {
    onClick: cancelExtraClick,
    disabled: cancelExtraDisabled,
    ...restCancelButtonProps
  } = cancelButtonProps || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={maskClosable ? onCancel : undefined}
      />

      <div
        className={`flex min-h-full justify-center p-3 sm:p-4 text-center ${
          centered ? "items-center" : "items-start pt-10 sm:pt-16"
        }`}
      >
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full my-4 sm:my-6 border border-gray-100 flex flex-col max-h-[92vh] ${className}`}
          style={{ ...widthStyle, ...style }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || closable) && (
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-gray-100 shrink-0">
              {title && (
                <div className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                  {title}
                </div>
              )}
              {closable && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 inline-flex items-center justify-center transition-colors hover:bg-gray-100 ml-auto focus:outline-none"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-5 sm:px-6 py-4 text-gray-700 overflow-y-auto overscroll-contain flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer !== null && (
            <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/80 shrink-0">
              {footer !== undefined ? (
                footer
              ) : (
                <>
                  <Button
                    onClick={(e) => {
                      cancelExtraClick?.(e);
                      onCancel?.(e);
                    }}
                    disabled={confirmLoading || cancelExtraDisabled}
                    size="middle"
                    {...restCancelButtonProps}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    type={okType === "danger" ? "primary" : okType}
                    danger={isDanger}
                    onClick={(e) => {
                      okExtraClick?.(e);
                      onOk?.(e);
                    }}
                    loading={confirmLoading}
                    disabled={okExtraDisabled}
                    size="middle"
                    {...restOkButtonProps}
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

const DEFAULT_METHOD_ICONS = {
  confirm: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
};

const ImperativeModalHost = ({ initialConfig, methodType, controlsRef, onDestroy }) => {
  const [config, setConfig] = useState(initialConfig);
  const [open, setOpen] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  if (controlsRef) {
    controlsRef.update = (next) => {
      setConfig((prev) => ({ ...prev, ...next }));
    };
    controlsRef.close = () => setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        onDestroy?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, onDestroy]);

  const showCancel =
    config.okCancel !== undefined ? config.okCancel : methodType === "confirm";
  const resolvedIcon =
    config.icon !== undefined ? config.icon : DEFAULT_METHOD_ICONS[methodType];

  const handleCancel = () => {
    if (confirmLoading) return;
    config.onCancel?.();
    setOpen(false);
  };

  const handleOk = async () => {
    if (!config.onOk) {
      setOpen(false);
      return;
    }
    try {
      const result = config.onOk();
      if (result && typeof result.then === "function") {
        setConfirmLoading(true);
        await result;
      }
      setOpen(false);
    } catch (err) {
      console.error("Modal action error:", err);
      setOpen(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  const isDanger = Boolean(config.danger || config.okType === "danger");
  const {
    onClick: okExtraClick,
    disabled: okExtraDisabled,
    ...restOkProps
  } = config.okButtonProps || {};
  const {
    onClick: cancelExtraClick,
    disabled: cancelExtraDisabled,
    ...restCancelProps
  } = config.cancelButtonProps || {};

  const customFooter = (
    <>
      {showCancel && (
        <Button
          onClick={(e) => {
            cancelExtraClick?.(e);
            handleCancel();
          }}
          disabled={confirmLoading || cancelExtraDisabled}
          size="middle"
          {...restCancelProps}
        >
          {config.cancelText || "Cancel"}
        </Button>
      )}
      <Button
        type={config.okType === "danger" || !config.okType ? "primary" : config.okType}
        danger={isDanger}
        onClick={(e) => {
          okExtraClick?.(e);
          handleOk();
        }}
        loading={confirmLoading}
        disabled={okExtraDisabled}
        size="middle"
        {...restOkProps}
      >
        {config.okText || "OK"}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      closable={config.closable ?? false}
      maskClosable={config.maskClosable ?? methodType !== "confirm"}
      centered={config.centered ?? true}
      width={config.width || 440}
      className={config.className || ""}
      style={config.style}
      footer={config.footer !== undefined ? config.footer : customFooter}
      title={
        config.title ? (
          <div className="flex items-center gap-2.5">
            {resolvedIcon}
            <span>{config.title}</span>
          </div>
        ) : null
      }
    >
      {config.content}
    </Modal>
  );
};

const openImperativeModal = (methodType) => (config = {}) => {
  if (typeof document === "undefined") {
    return { destroy: () => {}, update: () => {} };
  }
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const controlsRef = {};

  const destroy = () => {
    document.body.style.overflow = "";
    try {
      root.unmount();
    } catch {
      // ignore unmount race
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  root.render(
    <ImperativeModalHost
      initialConfig={config}
      methodType={methodType}
      controlsRef={controlsRef}
      onDestroy={destroy}
    />
  );

  return {
    destroy,
    update: (next) => controlsRef.update?.(next),
  };
};

Modal.confirm = openImperativeModal("confirm");
Modal.warning = openImperativeModal("warning");
Modal.warn = Modal.warning;
Modal.info = openImperativeModal("info");
Modal.success = openImperativeModal("success");
Modal.error = openImperativeModal("error");

export default Modal;

