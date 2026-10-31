import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const FormContext = createContext(null);

export class FormStore {
  constructor(initialValues = {}) {
    this.store = { ...initialValues };
    this.listeners = new Set();
    this.fieldRules = {};
    this.errors = {};
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
  }

  getNameKey(name) {
    return Array.isArray(name) ? name.join(".") : String(name);
  }

  getFieldsValue(all = true) {
    return { ...this.store };
  }

  setFieldsValue(newValues) {
    if (newValues && typeof newValues === "object") {
      this.store = { ...this.store, ...newValues };
      this.notify();
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
  const [, forceUpdate] = useState({});

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
        _store: store,
      };
    }
  }

  useEffect(() => {
    if (formRef.current?._store) {
      return formRef.current._store.subscribe(() => forceUpdate({}));
    }
  }, []);

  return [formRef.current];
}

export const Form = ({
  form,
  onFinish,
  onFinishFailed,
  initialValues,
  layout = "vertical",
  children,
  className = "",
  style,
  ...props
}) => {
  const [internalForm] = useForm(form);
  const activeForm = form || internalForm;

  useEffect(() => {
    if (initialValues) {
      activeForm.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const values = await activeForm.validateFields();
      onFinish?.(values);
    } catch (err) {
      onFinishFailed?.(err);
    }
  };

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
  valuePropName = "value",
  children,
  className = "",
  style,
  extra,
  help,
  ...props
}) => {
  const ctx = useContext(FormContext);
  const form = ctx?.form;
  const layout = ctx?.layout || "vertical";

  useEffect(() => {
    if (name && form?._store) {
      form._store.registerField(name, rules);
    }
  }, [name, rules, form]);

  const value = name && form ? form.getFieldValue(name) : undefined;
  const key = name ? (Array.isArray(name) ? name.join(".") : String(name)) : null;
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
    if (name && form) {
      form.setFieldValue(name, newVal);
    }
  };

  let renderedChild = children;
  if (name && React.isValidElement(children)) {
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
      className={`mb-3.5 ${isVertical ? "flex flex-col" : "flex flex-row items-center gap-3"} ${className}`}
      style={style}
      {...props}
    >
      {label && (
        <label className={`block text-xs font-semibold text-gray-700 tracking-wide mb-1 ${isVertical ? "" : "w-1/3 text-right"}`}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
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

export const FormList = ({ name, children }) => {
  const ctx = useContext(FormContext);
  const form = ctx?.form;
  const value = name && form ? form.getFieldValue(name) || [] : [];

  const add = (defaultValue = {}) => {
    const next = [...value, defaultValue];
    form?.setFieldValue(name, next);
  };

  const remove = (index) => {
    const next = value.filter((_, i) => i !== index);
    form?.setFieldValue(name, next);
  };

  const fields = value.map((_, index) => ({
    key: index,
    name: index,
    isListField: true,
  }));

  const operation = { add, remove };

  return <>{children(fields, operation)}</>;
};

Form.Item = FormItem;
Form.List = FormList;

export default Form;

