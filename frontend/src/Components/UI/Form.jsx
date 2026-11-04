import React, {
  createContext,
  useContext,
  useState,
  useCallback,
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
    if (Array.isArray(name)) {
      let current = this.store;
      for (let i = 0; i < name.length - 1; i++) {
        const part = name[i];
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = typeof name[i + 1] === "number" ? [] : {};
        }
        current = current[part];
      }
      current[name[name.length - 1]] = value;
    } else {
      this.store[name] = value;
    }
    if (this.errors[this.getNameKey(name)]) {
      delete this.errors[this.getNameKey(name)];
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
      for (const k of Object.keys(newValues)) {
        if (this.store[k] !== newValues[k]) {
          this.store[k] = newValues[k];
          changed = true;
        }
      }
      if (changed) {
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
      fields.forEach((f) => {
        if (Array.isArray(f)) {
          this.setFieldValue(f, undefined);
        } else {
          delete this.store[f];
          delete this.errors[f];
        }
      });
    }
    this.notify();
  }

  registerField(name, rules) {
    const key = this.getNameKey(name);
    this.fieldRules[key] = { name, rules };
  }

  unregisterField(name) {
    const key = this.getNameKey(name);
    delete this.fieldRules[key];
    delete this.errors[key];
  }

  async validateFields(fieldsToValidate) {
    let hasError = false;
    const newErrors = {};

    const fields = fieldsToValidate
      ? (Array.isArray(fieldsToValidate) ? fieldsToValidate : [fieldsToValidate]).map(
          (f) => this.getNameKey(f)
        )
      : Object.keys(this.fieldRules);

    for (const key of fields) {
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
            newErrors[key] = rule.message || "This field is required";
            hasError = true;
            break;
          }
        }
        if (rule.validator && typeof rule.validator === "function") {
          try {
            await rule.validator(rule, val);
          } catch (err) {
            newErrors[key] = err.message || String(err) || "Validation failed";
            hasError = true;
            break;
          }
        }
      }
    }

    this.errors = { ...this.errors, ...newErrors };
    this.notify();

    if (hasError) {
      throw new Error("Validation failed");
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

  if (activeForm?._store) {
    activeForm._store.onValuesChange = onValuesChange;
  }

  useEffect(() => {
    if (activeForm?._store) {
      activeForm._store.onValuesChange = onValuesChange;
    }
  }, [activeForm, onValuesChange]);

  useEffect(() => {
    if (!hasInitializedRef.current && initialValues && typeof initialValues === "object") {
      const hasMeaningfulData = Object.values(initialValues).some(
        (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
      );
      if (hasMeaningfulData) {
        hasInitializedRef.current = true;
        activeForm.setFieldsValue(initialValues);
      }
    }
  }, [initialValues, activeForm]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const values = await activeForm.validateFields();
      onFinish?.(values);
    } catch (err) {
      if (onFinishFailed) {
        onFinishFailed(err);
      } else {
        console.warn("Form validation failed:", err);
      }
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
  }, [name, listCtx]);

  useEffect(() => {
    if (resolvedName && form?._store) {
      form._store.registerField(resolvedName, rules);
      if (initialValue !== undefined && form.getFieldValue(resolvedName) === undefined) {
        form.setFieldValue(resolvedName, initialValue);
      }
      const unsubscribe = form._store.subscribe(() => forceUpdate({}));
      return () => {
        unsubscribe?.();
        form._store.unregisterField?.(resolvedName);
      };
    }
  }, [resolvedName, rules, form, initialValue]);

  const value = resolvedName && form ? form.getFieldValue(resolvedName) : undefined;
  const key = resolvedName ? (Array.isArray(resolvedName) ? resolvedName.join(".") : String(resolvedName)) : null;
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
  if (resolvedName && React.isValidElement(children)) {
    const childProps = {
      [valuePropName]: value !== undefined ? value : "",
      onChange: (v) => {
        handleChange(v);
        children.props?.onChange?.(v);
      },
      error: Boolean(error),
    };
    if (valuePropName === "checked") {
      childProps.checked = Boolean(value);
    }
    renderedChild = React.cloneElement(children, childProps);
  }

  const isVertical = layout === "vertical" || !layout;

  return (
    <div
      className={`mb-2.5 ${isVertical ? "flex flex-col" : "flex flex-row items-center gap-3"} ${className}`}
      style={style}
      {...props}
    >
      {label && (
        <label
          className={`block text-xs font-semibold text-gray-700 mb-1 leading-tight ${
            isVertical ? "" : "w-1/3 text-right"
          }`}
        >
          <span>{label}</span>
          {isRequired && (
            <span
              className="text-red-500 font-bold ml-1 text-xs select-none inline align-baseline"
              style={{
                fontFamily: "SimSun, sans-serif, system-ui",
                lineHeight: "1",
              }}
              aria-hidden="true"
            >
              *
            </span>
          )}
          {tooltip && (
            <span
              className="text-gray-400 hover:text-gray-600 cursor-help ml-1.5 inline-block align-middle"
              title={tooltip}
            >
              <HelpCircle className="w-3.5 h-3.5 inline" />
            </span>
          )}
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
  }, [listCtx, name]);

  useEffect(() => {
    if (form?._store) {
      return form._store.subscribe(() => forceUpdate({}));
    }
  }, [form]);

  useEffect(() => {
    if (fullNamePath && rules && form?._store) {
      form._store.registerField(fullNamePath, rules);
      return () => {
        form._store.unregisterField?.(fullNamePath);
      };
    }
  }, [fullNamePath, rules, form]);

  const rawValue = form ? form.getFieldValue(fullNamePath) : undefined;
  const value = Array.isArray(rawValue) ? rawValue : (initialValue || []);

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
    </FormListContext.Provider>
  );
};

Form.Item = FormItem;
Form.List = FormList;

export default Form;

