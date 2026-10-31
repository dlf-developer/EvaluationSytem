import React, { useState } from "react";
import { ChevronDown, ChevronRight, Upload as UploadIcon, Check } from "lucide-react";

export const Typography = {
  Title: ({ level = 1, children, className = "", style, ...props }) => {
    const TagName = `h${Math.min(Math.max(level, 1), 6)}`;
    const sizeMap = {
      1: "text-3xl font-bold",
      2: "text-2xl font-bold",
      3: "text-xl font-semibold",
      4: "text-lg font-semibold",
      5: "text-base font-semibold",
      6: "text-sm font-semibold",
    };
    return (
      <TagName
        className={`${sizeMap[level] || sizeMap[1]} text-gray-900 ${className}`}
        style={style}
        {...props}
      >
        {children}
      </TagName>
    );
  },
  Text: ({ type, children, className = "", style, disabled, ...props }) => {
    const typeClasses = {
      secondary: "text-gray-500",
      success: "text-emerald-600",
      warning: "text-amber-600",
      danger: "text-rose-600",
    };
    return (
      <span
        className={`${type ? typeClasses[type] || "" : "text-gray-700"} ${
          disabled ? "text-gray-400 cursor-not-allowed" : ""
        } ${className}`}
        style={style}
        {...props}
      >
        {children}
      </span>
    );
  },
  Paragraph: ({ children, className = "", style, ...props }) => (
    <p className={`text-sm text-gray-700 mb-3 ${className}`} style={style} {...props}>
      {children}
    </p>
  ),
};

export const Steps = ({
  current = 0,
  items,
  children,
  className = "",
  style,
  onChange,
}) => {
  let stepList = items;
  if (!stepList && children) {
    stepList = React.Children.map(children, (child) => child?.props || {});
  }
  stepList = stepList || [];

  return (
    <div className={`w-full flex items-center justify-between mb-8 ${className}`} style={style}>
      {stepList.map((step, idx) => {
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <React.Fragment key={idx}>
            <div
              className={`flex items-center gap-3 cursor-pointer ${
                onChange ? "hover:opacity-80" : ""
              }`}
              onClick={() => onChange?.(idx)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isActive
                    ? "bg-[#1a4d2e] text-white ring-4 ring-[#e5efe5]"
                    : "bg-gray-100 text-gray-400 border border-gray-300"
                }`}
              >
                {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-gray-900" : isDone ? "text-emerald-700" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-gray-400">{step.description}</span>
                )}
              </div>
            </div>
            {idx < stepList.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-colors ${
                  idx < current ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
Steps.Step = ({ children }) => children;

export const Collapse = ({
  items,
  children,
  defaultActiveKey,
  activeKey,
  onChange,
  className = "",
  style,
}) => {
  const initialKey = defaultActiveKey !== undefined ? defaultActiveKey : [];
  const [internalActive, setInternalActive] = useState(
    Array.isArray(initialKey) ? initialKey : [initialKey]
  );

  const currentActive =
    activeKey !== undefined
      ? Array.isArray(activeKey)
        ? activeKey
        : [activeKey]
      : internalActive;

  const toggle = (key) => {
    const next = currentActive.includes(key)
      ? currentActive.filter((k) => k !== key)
      : [...currentActive, key];
    setInternalActive(next);
    onChange?.(next);
  };

  let panelList = items;
  if (!panelList && children) {
    panelList = React.Children.map(children, (child, idx) => ({
      key: child?.key || String(idx),
      label: child?.props?.header,
      children: child?.props?.children,
    }));
  }
  panelList = panelList || [];

  return (
    <div
      className={`border border-gray-200 rounded-xl divide-y divide-gray-200 bg-white overflow-hidden shadow-sm ${className}`}
      style={style}
    >
      {panelList.map((item, idx) => {
        const itemKey = item.key ?? String(idx);
        const isOpen = currentActive.includes(itemKey);
        return (
          <div key={itemKey} className="w-full">
            <button
              type="button"
              onClick={() => toggle(itemKey)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50/75 hover:bg-gray-100/75 text-left transition-colors font-medium text-sm text-gray-800"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.extra && <div onClick={(e) => e.stopPropagation()}>{item.extra}</div>}
            </button>
            {isOpen && <div className="p-5 text-sm text-gray-700 bg-white">{item.children}</div>}
          </div>
        );
      })}
    </div>
  );
};
Collapse.Panel = ({ children }) => children;

export const Statistic = ({
  title,
  value,
  prefix,
  suffix,
  className = "",
  style,
}) => {
  return (
    <div className={`flex flex-col ${className}`} style={style}>
      {title && <span className="text-xs font-medium text-gray-500 mb-1">{title}</span>}
      <div className="flex items-baseline gap-1.5 text-2xl font-bold text-gray-900">
        {prefix && <span className="text-lg text-gray-500">{prefix}</span>}
        <span>{value}</span>
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
};

export const Descriptions = ({
  title,
  items,
  children,
  bordered = false,
  className = "",
  style,
}) => {
  let itemList = items;
  if (!itemList && children) {
    itemList = React.Children.map(children, (child) => ({
      label: child?.props?.label,
      children: child?.props?.children,
    }));
  }
  itemList = itemList || [];

  return (
    <div className={`w-full ${className}`} style={style}>
      {title && <h4 className="text-base font-semibold text-gray-900 mb-3">{title}</h4>}
      <dl
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          bordered ? "border border-gray-200 rounded-xl p-5 bg-white shadow-sm" : ""
        }`}
      >
        {itemList.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500 min-w-[120px]">
              {item.label}:
            </dt>
            <dd className="text-sm font-medium text-gray-900">{item.children || "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
Descriptions.Item = ({ children }) => children;

export const Upload = ({
  beforeUpload,
  onChange,
  children,
  accept,
  multiple = false,
  fileList,
  className = "",
  style,
}) => {
  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (beforeUpload) {
        const allow = beforeUpload(file, files);
        if (allow === false) return;
      }
    }

    onChange?.({
      file: files[0],
      fileList: files,
    });
  };

  return (
    <div className={`relative inline-block ${className}`} style={style}>
      <label className="cursor-pointer">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        {children || (
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <UploadIcon className="w-4 h-4 text-gray-500" />
            <span>Select File</span>
          </div>
        )}
      </label>
    </div>
  );
};

export default {
  Typography,
  Steps,
  Collapse,
  Statistic,
  Descriptions,
  Upload,
};

