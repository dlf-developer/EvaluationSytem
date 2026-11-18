import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { HelpCircle } from "lucide-react";

export const FormContext = createContext(null);
export const FormListContext = createContext(null);

export class FormStore {
  constructor(initialValues = {}) {
    this.store = { ...initialValues };
    this.listeners = new Set();
    this.fieldRules = {};
    this.errors = {};
    this.onValuesChange = null;
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getFieldValue(name) {
    if (!name) return undefined;
    if (Array.isArray(name)) {
      return name.reduce((acc, part) => (acc ? acc[part] : undefined), this.store);
    }
    return this.store[name];
  }

  setFieldValue(name, value) {
    if (!name) return;
    const prevValue = this.getFieldValue(name);
    const key = this.getNameKey(name);
    const hadError = Boolean(this.errors[key]);
    if (Object.is(prevValue, value) && !hadError) {
      return;
    }

    if (Array.isArray(name)) {
      const nextStore = { ...this.store };
      let current = nextStore;
      for (let i = 0; i < name.length - 1; i++) {
        const part = name[i];
        const existing = current[part];
        if (!existing || typeof existing !== "object") {
          current[part] = typeof name[i + 1] === "number" ? [] : {};
        } else {
          current[part] = Array.isArray(existing) ? [...existing] : { ...existing };
        }
        current = current[part];
      }
      current[name[name.length - 1]] = value;
      this.store = nextStore;
    } else {
      this.store = { ...this.store, [name]: value };
    }
    if (this.errors[key]) {
      delete this.errors[key];
    }
    this.notify();
    if (this.onValuesChange && typeof this.onValuesChange === "function") {
      let changed = {};
      if (Array.isArray(name)) {
        let curr = changed;
        for (let i = 0; i < name.length - 1; i++) {
          curr[name[i]] = typeof name[i + 1] === "number" ? [] : {};
          curr = curr[name[i]];
        }
        curr[name[name.length - 1]] = value;
      } else {
        changed[name] = value;
      }
      try {
        this.onValuesChange(changed, this.getFieldsValue(true));
      } catch (e) {
        console.error("onValuesChange error:", e);
      }
    }
  }

  getNameKey(name) {
    return Array.isArray(name) ? name.join(".") : String(name);
  }

  getFieldsValue(all = true) {
    return { ...this.store };
  }

  setFieldsValue(newValues) {
    if (newValues && typeof newValues === "object") {
      let changed = false;
      const nextStore = { ...this.store };
      for (const k of Object.keys(newValues)) {
        if (!Object.is(nextStore[k], newValues[k])) {
          nextStore[k] = newValues[k];
          delete this.errors[k];
          changed = true;
        }
      }
      if (changed) {
        this.store = nextStore;
        this.notify();
        if (this.onValuesChange && typeof this.onValuesChange === "function") {
          try {
            this.onValuesChange(newValues, this.getFieldsValue(true));
          } catch (e) {
            console.error("onValuesChange error:", e);
          }
        }
      }
    }
  }

  resetFields(fields) {
    if (!fields) {
      this.store = {};
      this.errors = {};
    } else if (Array.isArray(fields)) {
      const nextStore = { ...this.store };
      fields.forEach((f) => {
        if (Array.isArray(f)) {
          this.setFieldValue(f, undefined);
        } else {
          delete nextStore[f];
          delete this.errors[f];
        }
      });
      if (fields.some((f) => !Array.isArray(f))) {
        this.store = nextStore;
      }
    }
    this.notify();
  }

  registerField(name, rules) {
    const key = this.getNameKey(name);
    this.fieldRules[key] = { name, rules };
  }

  clearError(name) {
    const key = this.getNameKey(name);
    if (this.errors[key]) {
      delete this.errors[key];
      this.notify();
    }
  }

  unregisterField(name) {
    const key = this.getNameKey(name);
    delete this.fieldRules[key];
    delete this.errors[key];
  }

  async validateFields(fieldsToValidate) {
    let hasError = false;
    const newErrors = {};
    const errorFields = [];

    const fields = fieldsToValidate
      ? (Array.isArray(fieldsToValidate) ? fieldsToValidate : [fieldsToValidate]).map(
          (f) => this.getNameKey(f)
        )
      : Object.keys(this.fieldRules);

    for (const key of fields) {
      delete this.errors[key];
      const reg = this.fieldRules[key];
      if (!reg || !reg.rules) continue;

      const val = this.getFieldValue(reg.name);
      for (const rule of reg.rules) {
        if (rule.required) {
          if (
            val === undefined ||
            val === null ||
            val === "" ||
            (Array.isArray(val) && val.length === 0)
          ) {
            const msg = rule.message || "This field is required";
            newErrors[key] = msg;
            errorFields.push({ name: Array.isArray(reg.name) ? reg.name : [reg.name], errors: [msg] });
            hasError = true;
            break;
          }
        }
        if (rule.validator && typeof rule.validator === "function") {
          try {
            await rule.validator(rule, val);
          } catch (err) {
            const msg = err.message || String(err) || "Validation failed";
            newErrors[key] = msg;
            errorFields.push({ name: Array.isArray(reg.name) ? reg.name : [reg.name], errors: [msg] });
            hasError = true;
            break;
          }
        }
      }
    }

    this.errors = { ...this.errors, ...newErrors };
    this.notify();

    if (hasError) {
      const validationError = new Error("Validation failed");
      validationError.errorFields = errorFields;
      validationError.values = this.getFieldsValue(true);
      throw validationError;
    }
    return this.getFieldsValue(true);
  }
}

export function useForm(form) {
  const formRef = useRef(null);

  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const store = new FormStore();
      formRef.current = {
        getFieldValue: (n) => store.getFieldValue(n),
        setFieldValue: (n, v) => store.setFieldValue(n, v),
        getFieldsValue: (all) => store.getFieldsValue(all),
        setFieldsValue: (v) => store.setFieldsValue(v),
        resetFields: (f) => store.resetFields(f),
        validateFields: (f) => store.validateFields(f),
        submit: () => {},
        _store: store,
      };
    }
  }

  return [formRef.current];
}

export const Form = ({
  form,
  onFinish,
  onFinishFailed,
  onValuesChange,
  initialValues,
  layout = "vertical",
  children,
  className = "",
  style,
  ...props
}) => {
  const [internalForm] = useForm(form);
  const activeForm = form || internalForm;
  const hasInitializedRef = useRef(false);
  const isMountedRef = useRef(false);
  const pendingNotifyRef = useRef(false);

  if (activeForm?._store) {
    activeForm._store.onValuesChange = onValuesChange;
    if (!hasInitializedRef.current && initialValues && typeof initialValues === "object") {
      const hasMeaningfulData = Object.values(initialValues).some(
        (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
      );
      if (hasMeaningfulData) {
        hasInitializedRef.current = true;
        activeForm._store.store = { ...initialValues, ...activeForm._store.store };
        if (isMountedRef.current) {
          pendingNotifyRef.current = true;
        }
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    if (activeForm?._store) {
      activeForm._store.onValuesChange = onValuesChange;
      if (pendingNotifyRef.current) {
        pendingNotifyRef.current = false;
        activeForm._store.notify();
      }
    }
  }, [activeForm, onValuesChange, initialValues]);

  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmittingRef.current) {
      console.warn("Form submission already in progress, ignoring duplicate submit.");
      return;
    }
    isSubmittingRef.current = true;
    try {
      const values = await activeForm.validateFields();
      const result = onFinish?.(values);
      if (result && typeof result.then === "function") {
        await result;
      }
    } catch (err) {
      if (onFinishFailed) {
        onFinishFailed(err);
      } else {
        console.warn("Form validation failed:", err);
      }
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  activeForm.submit = handleSubmit;

  return (
    <FormContext.Provider value={{ form: activeForm, layout }}>
      <form
        onSubmit={handleSubmit}
        className={`w-full ${className}`}
        style={style}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

Form.useForm = useForm;

Form.useWatch = (name, form) => {
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (form?._store) {
      return form._store.subscribe(() => forceUpdate({}));
    }
  }, [form]);
  return form?.getFieldValue ? form.getFieldValue(name) : undefined;
};

export const FormItem = ({
  name,
  label,
  rules,
  initialValue,
  valuePropName = "value",
  hidden = false,
  noStyle = false,
  shouldUpdate = false,
  dependencies,
  getValueProps,
  fieldKey,
  trigger,
  validateTrigger,
  preserve,
  hasFeedback,
  children,
  className = "",
  style,
  extra,
  help,
  tooltip,
  ...props
}) => {
  const ctx = useContext(FormContext);
  const listCtx = useContext(FormListContext);
  const form = ctx?.form;
  const layout = ctx?.layout || "vertical";
  const [, forceUpdate] = useState({});

  const resolvedName = useMemo(() => {
    if (name === undefined || name === null) return name;
    if (listCtx?.namePath && listCtx.namePath.length > 0) {
      const nameParts = Array.isArray(name) ? name : [name];
      return [...listCtx.namePath, ...nameParts];
    }
    return name;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(name) ? name.join(".") : name, listCtx?.namePath?.join(".")]);

  const key = resolvedName
    ? Array.isArray(resolvedName)
      ? resolvedName.join(".")
      : String(resolvedName)
    : null;

  const prevValuesRef = useRef(form ? form.getFieldsValue(true) : {});
  const resolvedNameRef = useRef(resolvedName);
  resolvedNameRef.current = resolvedName;

  useEffect(() => {
    if (!form?._store) return;

    if (resolvedNameRef.current) {
      form._store.registerField(resolvedNameRef.current, rules);
      if (
        initialValue !== undefined &&
        form.getFieldValue(resolvedNameRef.current) === undefined
      ) {
        form.setFieldValue(resolvedNameRef.current, initialValue);
      }
      const unsubscribe = form._store.subscribe(() => forceUpdate({}));
      return () => {
        unsubscribe?.();
        form._store.unregisterField?.(resolvedNameRef.current);
      };
    }

    if (shouldUpdate || (Array.isArray(dependencies) && dependencies.length > 0)) {
      const unsubscribe = form._store.subscribe(() => {
        const nextValues = form.getFieldsValue(true);
        const prevValues = prevValuesRef.current;
        let shouldRerender = false;

        if (shouldUpdate === true) {
          shouldRerender = true;
        } else if (typeof shouldUpdate === "function") {
          try {
            shouldRerender = Boolean(shouldUpdate(prevValues, nextValues));
          } catch {
            shouldRerender = true;
          }
        } else if (Array.isArray(dependencies)) {
          shouldRerender = dependencies.some((dep) => {
            const getFrom = (obj, path) =>
              Array.isArray(path)
                ? path.reduce((acc, p) => (acc ? acc[p] : undefined), obj)
                : obj?.[path];
            return !Object.is(getFrom(prevValues, dep), getFrom(nextValues, dep));
          });
        }

        if (shouldRerender) {
          prevValuesRef.current = nextValues;
          forceUpdate({});
        }
      });
      return () => unsubscribe?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, form, Boolean(shouldUpdate), Array.isArray(dependencies) ? dependencies.join("|") : ""]);

  useEffect(() => {
    if (!key || !form?._store || !resolvedNameRef.current) return;
    form._store.registerField(resolvedNameRef.current, rules);
    if (!rules || rules.length === 0) {
      form._store.clearError?.(resolvedNameRef.current);
    }
  }, [key, rules, form]);

  const value = resolvedName && form ? form.getFieldValue(resolvedName) : undefined;
  const error = key && form?._store ? form._store.errors[key] : null;

  const isRequired = rules && rules.some((r) => r.required);

  const handleChange = (valOrEvent) => {
    let newVal = valOrEvent;
    if (valOrEvent && valOrEvent.target) {
      newVal =
        valOrEvent.target.type === "checkbox"
          ? valOrEvent.target.checked
          : valOrEvent.target.value;
    }
    if (resolvedName && form) {
      form.setFieldValue(resolvedName, newVal);
    }
  };

  let renderedChild = children;
  if (typeof children === "function") {
    if (form) {
      prevValuesRef.current = form.getFieldsValue(true);
    }
    renderedChild = form ? children(form) : null;
  } else if (resolvedName && React.isValidElement(children)) {
    const acceptsUndefined =
      children.type?.displayName === "CustomSelect" ||
      children.type?.displayName === "CustomDatePicker" ||
      children.type?.displayName === "CustomRangePicker" ||
      children.type?.displayName === "CustomInputNumber" ||
      children.props?.mode === "multiple";

    const mappedValueProps =
      typeof getValueProps === "function"
        ? getValueProps(value) || {}
        : {
            [valuePropName]:
              value !== undefined ? value : acceptsUndefined ? undefined : "",
          };

    const childProps = {
      ...mappedValueProps,
      onChange: (...args) => {
        handleChange(args[0]);
        children.props?.onChange?.(...args);
      },
      error: Boolean(error),
    };
    if (valuePropName === "checked") {
      childProps.checked = Boolean(value);
    }
    renderedChild = React.cloneElement(children, childProps);
  }

  if (hidden) {
    return (
      <div style={{ display: "none" }} aria-hidden="true">
        {renderedChild}
      </div>
    );
  }

  if (noStyle) {
    return (
      <>
        {renderedChild}
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      </>
    );
  }

  const isVertical = layout === "vertical" || !layout;

  const renderLabelContent = () => {
    if (!label) return null;

    const asteriskEl = isRequired ? (
      <span
        className="text-red-500 font-bold ml-1 text-xs select-none inline align-baseline"
        style={{
          fontFamily: "SimSun, sans-serif, system-ui",
          lineHeight: "1",
          display: "inline",
          verticalAlign: "baseline",
        }}
        aria-hidden="true"
      >
        *
      </span>
    ) : null;

    const tooltipEl = tooltip ? (
      <span
        className="text-gray-400 hover:text-gray-600 cursor-help ml-1.5 inline-block align-middle"
        title={tooltip}
      >
        <HelpCircle className="w-3.5 h-3.5 inline" />
      </span>
    ) : null;

    if (React.isValidElement(label)) {
      const existingStyle = label.props?.style || {};
      const existingClassName = label.props?.className || "";
      return React.cloneElement(
        label,
        {
          style: {
            display: "inline",
            margin: 0,
            marginBottom: 0,
            ...existingStyle,
          },
          className: `${existingClassName} inline align-baseline`.trim(),
          as: "span",
        },
        <>
          {label.props?.children}
          {asteriskEl}
          {tooltipEl}
        </>
      );
    }

    return (
      <span style={{ display: "inline", verticalAlign: "baseline" }}>
        {label}
        {asteriskEl}
        {tooltipEl}
      </span>
    );
  };

  return (
    <div
      className={`mb-2.5 ${isVertical ? "flex flex-col" : "flex flex-row items-center gap-3"} ${className}`}
      style={style}
      {...props}
    >
      {label && (
        <label
          className={`block text-xs font-semibold text-gray-700 mb-1.5 leading-snug ${
            isVertical ? "" : "w-1/3 text-right"
          }`}
          style={{ display: "block" }}
        >
          {renderLabelContent()}
        </label>
      )}
      <div className={isVertical ? "w-full" : "w-2/3"}>
        {renderedChild}
        {error ? (
          <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
        ) : help ? (
          <p className="mt-1 text-xs text-gray-500">{help}</p>
        ) : extra ? (
          <p className="mt-1 text-xs text-gray-500">{extra}</p>
        ) : null}
      </div>
    </div>
  );
};

export const FormList = ({ name, rules, initialValue = [], children }) => {
  const ctx = useContext(FormContext);
  const listCtx = useContext(FormListContext);
  const form = ctx?.form;
  const [, forceUpdate] = useState({});

  const fullNamePath = useMemo(() => {
    const parentPath = listCtx?.namePath || [];
    const thisPath = Array.isArray(name) ? name : [name];
    return [...parentPath, ...thisPath];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listCtx?.namePath?.join("."), Array.isArray(name) ? name.join(".") : name]);

  const listKey = fullNamePath ? fullNamePath.join(".") : null;
  const fullNamePathRef = useRef(fullNamePath);
  fullNamePathRef.current = fullNamePath;

  useEffect(() => {
    if (form?._store) {
      return form._store.subscribe(() => forceUpdate({}));
    }
  }, [form]);

  useEffect(() => {
    if (!listKey || !form?._store) return;
    return () => {
      form._store.unregisterField?.(fullNamePathRef.current);
    };
  }, [listKey, form]);

  useEffect(() => {
    if (!listKey || !form?._store) return;
    if (rules) {
      form._store.registerField(fullNamePathRef.current, rules);
    }
  }, [listKey, rules, form]);

  const rawValue = form ? form.getFieldValue(fullNamePath) : undefined;
  const value = Array.isArray(rawValue) ? rawValue : (initialValue || []);
  const listError = listKey && form?._store ? form._store.errors[listKey] : null;

  const add = (defaultValue = {}) => {
    const currentList = form ? form.getFieldValue(fullNamePath) : [];
    const baseList = Array.isArray(currentList) ? currentList : [];
    const next = [...baseList, defaultValue];
    form?.setFieldValue(fullNamePath, next);
  };

  const remove = (index) => {
    const currentList = form ? form.getFieldValue(fullNamePath) : [];
    if (!Array.isArray(currentList)) return;
    const next = currentList.filter((_, i) => i !== index);
    form?.setFieldValue(fullNamePath, next);
  };

  const fields = value.map((_, index) => ({
    key: index,
    name: index,
    fieldKey: index,
    isListField: true,
  }));

  const operation = { add, remove };

  return (
    <FormListContext.Provider value={{ namePath: fullNamePath }}>
      {typeof children === "function" ? children(fields, operation) : null}
      {listError && <p className="mt-1 text-xs text-red-500 font-medium">{listError}</p>}
    </FormListContext.Provider>
  );
};

Form.Item = FormItem;
Form.List = FormList;

export default Form;

