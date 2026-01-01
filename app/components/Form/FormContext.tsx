"use client";
import React, { useContext } from "react";

export interface FormContextType {
  formData: FormData;
  fields?: Record<string, FormFieldType>;
  addField?: (fieldObj: { name: string; field: FormFieldType }) => void;
  removeField?: (fieldName: string) => void;
  showRequiredFields?: boolean;
  error?: Record<string, string>;
  onFormChange?: (payload: unknown) => void;
}

export interface FormFieldType {
  name: string;
  required?: boolean;
  ref?: { onInvalidSubmit?: () => void };
}

export interface InputGroupContextType {
  name: string;
}

export const FormContext = React.createContext<FormContextType | null>(null);
export const InputGroupContext = React.createContext<InputGroupContextType | null>(null);

export function useFormContext<T extends Record<string, unknown>>(
  props: T,
): T & Partial<FormContextType> {
  const context = useContext(FormContext);
  return { ...props, ...context };
}

export function useInputGroupContext<T extends { name?: string }>(
  props: T,
): T &
  Partial<FormContextType> & {
    standaloneName?: string;
    defaultValue?: string;
  } {
  const formContext = useFormContext(props);
  const groupContext = useContext(InputGroupContext);

  const defaultValueExtractor = (inputName: string): string => {
    if (formContext?.formData?.get) {
      const value = formContext.formData.get(inputName);
      return value ? String(value) : "";
    }
    return "";
  };

  if (!groupContext) {
    return {
      ...props,
      standaloneName: props.name,
      defaultValue: props.name ? defaultValueExtractor(props.name) : "",
      ...formContext,
    };
  }

  const { name: groupName } = groupContext;
  const { name: inputName, ...otherProps } = props;
  const resolvedName = groupName.concat(groupName.endsWith("]") ? "" : ".", inputName || "");
  return {
    ...otherProps,
    ...formContext,
    name: resolvedName,
    standaloneName: inputName,
    defaultValue: inputName ? defaultValueExtractor(inputName) : "",
  };
}
