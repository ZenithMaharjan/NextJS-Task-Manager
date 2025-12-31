"use client";

import React, {
  useImperativeHandle,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useState,
} from "react";

import { FormContext, InputGroupContext, useInputGroupContext, FormFieldType } from "./FormContext";
import useControlledState from "../../hooks/useControlledState";
import { getErrorMessage } from "../../utils/error";
import BaseInput from "../Input";
import Label from "../Label";

// Type definitions
interface ValueExtractorItem {
  value?: unknown;
}

type FieldValueExtractor = (payload: unknown, ...otherArgs: unknown[]) => unknown;
type FormValueExtractor = (value: unknown) => unknown;

interface InputGroupProps {
  name: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  component?: React.ComponentType<unknown> | string;
  error?: Record<string, string>;
  formData?: FormData;
  onChange?: (payload: unknown, ...otherArgs: unknown[]) => void;
  formValueExtractor?: FormValueExtractor;
  fieldValueExtractor?: FieldValueExtractor;
  containerClassName?: string;
  inputContainerClassName?: string;
  labelClassName?: string;
  standaloneName?: string;
  fields?: Record<string, FormFieldType>;
  addField?: (fieldObj: { name: string; field: FormFieldType }) => void;
  removeField?: (fieldName: string) => void;
  showRequiredFields?: boolean;
  onFormChange?: (inputProps: Record<string, unknown>) => void;
  valueExtractor?: (value: unknown) => unknown;
  errorMessage?: string;
  showRequired?: boolean;
}

interface FormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (formData: FormData) => void;
  onChange?: (payload: unknown) => void;
  error?: Record<string, string> | string;
  formErrorClassName?: string;
  onInvalidSubmit?: (reason?: string) => void;
  defaultFormData?: FormData;
  id?: string;
  name?: string;
  autoComplete?: string;
  noValidate?: boolean;
}

interface FormRef {
  getFormData: () => FormData;
  nativeForm: HTMLFormElement | null;
}

const defaultValueExtractor = (item: ValueExtractorItem | unknown): unknown => {
  if (item && typeof item === "object" && "value" in item) {
    return (item as ValueExtractorItem).value;
  }
  return undefined;
};

const InputGroup = (props: InputGroupProps) => {
  const { name, children } = useInputGroupContext(props);

  const inputGroupContext = useMemo(() => {
    return { name: name || "" };
  }, [name]);

  return (
    <InputGroupContext.Provider value={inputGroupContext}>{children}</InputGroupContext.Provider>
  );
};

const Input = (props: InputProps) => {
  const {
    error,
    component: Component = BaseInput,
    formData,
    onChange,
    formValueExtractor,
    fieldValueExtractor,
    containerClassName = "mb-4",
    inputContainerClassName,
    labelClassName,
    label,
    standaloneName,
    fields,
    addField,
    removeField,
    showRequiredFields,
    onFormChange,
    ...inputProps
  } = useInputGroupContext(props) || {};

  const inputFieldRef = useRef<{ onInvalidSubmit?: () => void }>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [showRequired] = useControlledState(false, {
    value: showRequiredFields,
  });

  const handleChange = useCallback(
    (payload: unknown, ...otherArgs: unknown[]) => {
      onChange && onChange(payload, ...otherArgs);
      if (!standaloneName || !inputProps.name || !formData) {
        return;
      }

      const name = inputProps.name;
      let value: unknown;
      if (fieldValueExtractor) {
        value = fieldValueExtractor(payload, ...otherArgs);
      } else if (
        payload &&
        typeof payload === "object" &&
        "nativeEvent" in payload &&
        payload.nativeEvent instanceof Event
      ) {
        value = (payload as React.ChangeEvent<HTMLInputElement>).target.value;
      } else {
        value = defaultValueExtractor(payload) ?? payload;
      }
      formData.set(name, String(value ?? ""));
      onFormChange?.(inputProps as Record<string, unknown>);
    },
    [formData, onChange, fieldValueExtractor, inputProps, standaloneName, onFormChange],
  );

  useEffect(() => {
    if (standaloneName && inputProps.name && formData) {
      let value: unknown = inputProps.value ?? inputProps.defaultValue ?? null;
      if (formValueExtractor) {
        value = value ? formValueExtractor(value) : value;
      } else if (inputProps.valueExtractor) {
        value = value ? inputProps.valueExtractor(value) : value;
      }
      addField?.({
        name: inputProps.name,
        field: {
          name: inputProps.name,
          required: inputProps.required,
          ref: inputFieldRef.current || undefined,
        },
      });
      if (value !== undefined && value !== null) {
        formData.set(inputProps.name, String(value));
      }
      return () => {
        removeField?.(inputProps.name);
        formData.delete(inputProps.name);
      };
    }
  }, [
    formData,
    inputProps.name,
    inputProps.required,
    inputProps.value,
    inputProps.defaultValue,
    inputProps.valueExtractor,
    formValueExtractor,
    standaloneName,
    addField,
    removeField,
  ]);

  const handleInvalidSubmit = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useImperativeHandle(
    inputFieldRef,
    () => ({
      onInvalidSubmit: handleInvalidSubmit,
    }),
    [handleInvalidSubmit],
  );

  const fieldProps = useMemo(() => {
    const value = formData?.get(inputProps.name || "");

    if (typeof Component !== "string") {
      return {
        ...inputProps,
        showRequired:
          inputProps.required && (!value || ["undefined", "null"].includes(String(value)))
            ? showRequired
            : false,
        errorMessage: error?.[inputProps.name || ""],
      };
    }
    return inputProps;
  }, [Component, inputProps, showRequired, formData, error]);

  if (!formData) return <Component {...props} />;

  const hasError = Boolean(fieldProps.errorMessage);

  return (
    <div ref={inputRef} className={containerClassName} style={{ outline: "none" }} tabIndex={-1}>
      {Boolean(label) && <Label className={labelClassName}>{label}</Label>}
      <Component
        {...fieldProps}
        containerClassName={inputContainerClassName}
        onChange={handleChange}
      />
      {hasError && (
        <span className="text-red-500 text-xs mt-1 block">{fieldProps.errorMessage}</span>
      )}
    </div>
  );
};

const Form = React.forwardRef<FormRef, FormProps>((props, ref) => {
  const {
    children,
    onSubmit,
    onChange,
    error,
    formErrorClassName = "text-red-500 text-sm mt-2",
    onInvalidSubmit,
    defaultFormData,
    ...formProps
  } = props;

  const formRef = useRef<HTMLFormElement>(null);

  const [showRequiredFields, setShowRequiredFields] = useState(false);
  const [fields, setFields] = useState<Record<string, FormFieldType>>({});

  const addField = useCallback((fieldObj: { name: string; field: FormFieldType }) => {
    setFields(fs => {
      if (!fs[fieldObj.name]) {
        const newFields = { ...fs, [fieldObj.name]: fieldObj.field };
        return { ...newFields };
      }
      return fs;
    });
  }, []);

  const removeField = useCallback((fieldName: string) => {
    setFields(fs => {
      if (fs[fieldName]) {
        const newFields = { ...fs };
        delete newFields[fieldName];
        return { ...newFields };
      }
      return fs;
    });
  }, []);

  const formDataObject = useRef(defaultFormData || new FormData());
  const formData = useMemo(() => formDataObject.current, []);

  const handleSubmitForm = useCallback(
    (evnt: React.FormEvent<HTMLFormElement>) => {
      evnt.preventDefault();
      let hasError = false;
      for (const key of Object.keys(fields)) {
        const value = formData.get(key);
        if (
          fields[key] &&
          fields[key].required &&
          (!value || ["undefined", "null"].includes(String(value)))
        ) {
          fields[key].ref?.onInvalidSubmit?.();
          hasError = true;
        }
      }

      if (hasError) {
        onInvalidSubmit?.("required");
        setShowRequiredFields(true);
        return;
      }

      onSubmit?.(formData);
    },
    [formData, fields, onInvalidSubmit, onSubmit],
  );

  const handleFormChange = useCallback(
    (payload: unknown) => {
      if (payload && typeof payload === "object" && "target" in payload) {
        const event = payload as React.ChangeEvent<HTMLFormElement>;
        if (!event.target.name) {
          return;
        }
        return onChange?.(payload);
      }
      if (onChange) {
        return onChange({ ...(payload as object), formData });
      }
    },
    [formData, onChange],
  );

  const formContext = useMemo(() => {
    return {
      formData,
      fields,
      addField,
      removeField,
      showRequiredFields,
      error: typeof error === "string" ? undefined : error,
      onFormChange: handleFormChange,
    };
  }, [formData, fields, addField, removeField, showRequiredFields, error, handleFormChange]);

  const hasFormError = useMemo(() => {
    if (!error) {
      return false;
    }
    if (typeof error === "string") {
      return true;
    }
    // Check if there are any errors that are NOT field-specific
    const errorKeys = Object.keys(error);
    const fieldKeys = Object.keys(fields);

    // If there are error keys that don't match any field names, show general error
    const hasNonFieldErrors = errorKeys.some(key => !fieldKeys.includes(key));

    return hasNonFieldErrors;
  }, [fields, error]);

  useImperativeHandle(
    ref,
    () => ({
      getFormData: () => {
        return formData;
      },
      nativeForm: formRef.current,
    }),
    [formData],
  );

  return (
    <FormContext.Provider value={formContext}>
      <form
        ref={formRef}
        noValidate
        {...formProps}
        onSubmit={handleSubmitForm}
        onChange={handleFormChange}
      >
        {children}
      </form>
      {hasFormError && (
        <div className={formErrorClassName}>
          <span>{getErrorMessage(error)}</span>
        </div>
      )}
    </FormContext.Provider>
  );
});

Form.displayName = "Form";

const FormWithSubComponents = Form as typeof Form & {
  InputGroup: typeof InputGroup;
  Input: typeof Input;
};

FormWithSubComponents.InputGroup = InputGroup;
FormWithSubComponents.Input = Input;

export default FormWithSubComponents;
