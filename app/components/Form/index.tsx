"use client";

import React, {
  useImperativeHandle,
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
} from "react";

import { FormContext, InputGroupContext, useInputGroupContext, FormFieldType } from "./FormContext";
import useControlledState from "../../hooks/useControlledState";
import { getErrorMessage } from "../../utils/error";
import BaseInput from "../Input";
import Label from "../Label";


interface ValueExtractorItem {
  value?: unknown;
}

type FieldValueExtractor = (payload: unknown, ...otherArgs: unknown[]) => unknown;
type FormValueExtractor = (value: unknown) => unknown;

interface InputGroupProps {
  name: string;
  children: React.ReactNode;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  component?: React.ComponentType<any> | string;
  formData?: FormData;
  onChange?: (payload: unknown, ...otherArgs: unknown[]) => void;
  formValueExtractor?: FormValueExtractor;
  fieldValueExtractor?: FieldValueExtractor;
  containerClassName?: string;
  inputContainerClassName?: string;
  labelClassName?: string;
  standaloneName?: string;
  addField?: (fieldObj: { name: string; field: FormFieldType }) => void;
  removeField?: (fieldName: string) => void;
  showRequiredFields?: boolean;
  onFormChange?: (inputProps: Record<string, unknown>) => void;
  errorMessage?: string;
  error?: Record<string, string>;
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


const InputGroup = ({ name, children }: InputGroupProps) => {
  const context = useMemo(() => ({ name: name || "" }), [name]);
  return <InputGroupContext.Provider value={context}>{children}</InputGroupContext.Provider>;
};

const FormInput = (props: InputProps) => {
  const context = useInputGroupContext(props) || {};
  const {
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
    addField,
    removeField,
    showRequiredFields,
    onFormChange,
    error,
    ...inputProps
  } = context;

  const inputFieldRef = useRef<{ onInvalidSubmit?: () => void }>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [showRequired] = useControlledState(false, { value: showRequiredFields });

  const handleChange = useCallback(
    (payload: unknown, ...otherArgs: unknown[]) => {
      onChange?.(payload, ...otherArgs);
      if (!standaloneName || !inputProps.name || !formData) return;

      const name = inputProps.name;
      let value: unknown;
      if (fieldValueExtractor) {
        value = fieldValueExtractor(payload, ...otherArgs);
      } else if (payload && typeof payload === "object" && "target" in payload) {
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
      addField?.({
        name: inputProps.name,
        field: {
          name: inputProps.name,
          required: inputProps.required,
          ref: inputFieldRef.current || undefined,
        },
      });
      return () => {
        removeField?.(inputProps.name);
        formData.delete(inputProps.name);
      };
    }
  }, [formData, inputProps.name, inputProps.required, standaloneName, addField, removeField]);

  useImperativeHandle(inputFieldRef, () => ({
    onInvalidSubmit: () => inputRef.current?.focus(),
  }));

  const fieldProps = useMemo(() => {
    const value = formData?.get(inputProps.name || "");
    const isError = inputProps.required && (!value || ["undefined", "null"].includes(String(value))) && showRequired;
    
    return {
      ...inputProps,
      errorMessage: error?.[inputProps.name || ""] || (isError ? "This field is required" : undefined),
    };
  }, [inputProps, showRequired, formData, error]);

  if (!formData) return <Component {...props} />;

  return (
    <div ref={inputRef} className={containerClassName} style={{ outline: "none" }} tabIndex={-1}>
      {Boolean(label) && <Label className={labelClassName}>{label}</Label>}
      <Component
        {...fieldProps}
        containerClassName={inputContainerClassName}
        onChange={handleChange}
      />
    </div>
  );
};


const Form = React.forwardRef<FormRef, FormProps>((props, ref) => {
  const {
    children,
    onSubmit,
    onChange,
    error,
    formErrorClassName = "text-red-500 text-sm mt-2 font-medium",
    onInvalidSubmit,
    defaultFormData,
    ...formProps
  } = props;

  const formRef = useRef<HTMLFormElement>(null);
  const [showRequiredFields, setShowRequiredFields] = useState(false);
  const [fields, setFields] = useState<Record<string, FormFieldType>>({});

  const addField = useCallback((fieldObj: { name: string; field: FormFieldType }) => {
    setFields(fs => fs[fieldObj.name] ? fs : { ...fs, [fieldObj.name]: fieldObj.field });
  }, []);

  const removeField = useCallback((fieldName: string) => {
    setFields(fs => {
      if (!fs[fieldName]) return fs;
      const newFields = { ...fs };
      delete newFields[fieldName];
      return newFields;
    });
  }, []);

  const formDataObject = useRef(defaultFormData || new FormData());
  const formData = useMemo(() => formDataObject.current, []);

  const handleSubmitForm = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      let hasError = false;
      
      Object.keys(fields).forEach(key => {
        const value = formData.get(key);
        if (fields[key]?.required && (!value || ["undefined", "null"].includes(String(value)))) {
          fields[key].ref?.onInvalidSubmit?.();
          hasError = true;
        }
      });

      if (hasError) {
        onInvalidSubmit?.("required");
        setShowRequiredFields(true);
        return;
      }

      onSubmit?.(formData);
    },
    [formData, fields, onInvalidSubmit, onSubmit],
  );

  const context = useMemo(() => ({
    formData,
    fields,
    addField,
    removeField,
    showRequiredFields,
    error: typeof error === "string" ? undefined : error,
    onFormChange: onChange,
  }), [formData, fields, addField, removeField, showRequiredFields, error, onChange]);

  const hasFormError = useMemo(() => {
    if (!error) return false;
    if (typeof error === "string") return true;
    
    return Object.keys(error).some(key => !fields[key]);
  }, [fields, error]);

  useImperativeHandle(ref, () => ({
    getFormData: () => formData,
    nativeForm: formRef.current,
  }), [formData]);

  return (
    <FormContext.Provider value={context}>
      <form
        ref={formRef}
        noValidate
        {...formProps}
        onSubmit={handleSubmitForm}
        onChange={onChange}
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

const ExportedForm = Form as typeof Form & {
  InputGroup: typeof InputGroup;
  Input: typeof FormInput;
};

ExportedForm.InputGroup = InputGroup;
ExportedForm.Input = FormInput;

export default ExportedForm;
