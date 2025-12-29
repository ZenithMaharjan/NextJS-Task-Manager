"use client";
import React, { useContext } from "react";

export interface FormContextType {
  formData: { get: (name: string) => any };
  [key: string]: any;
}

export interface InputGroupContextType {
  name: string;
  [key: string]: any;
}

export const FormContext = React.createContext<FormContextType | null>(null);
export const InputGroupContext = React.createContext<InputGroupContextType | null>(
  null
);

export function useFormContext(props: any) {
  const context = useContext(FormContext);
  return { ...props, ...context };
}

export function useInputGroupContext(props: any) {
  const formContext = useFormContext(props);
  const groupContext = useContext(InputGroupContext);
  
  const defaultValueExtractor = (inputName: string) => {
    if (formContext?.formData?.get) {
      return formContext.formData.get(inputName) || "";
    }
    return "";
  };

  if (!groupContext) {
    return {
      ...props,
      standaloneName: props.name,
      defaultValue: defaultValueExtractor(props.name),
      ...formContext,
    };
  }

  if (groupContext) {
    const { name: groupName } = groupContext;
    const { name: inputName, ...otherProps } = props;
    const resolvedName = groupName.concat(
      groupName.endsWith("]") ? "" : ".",
      inputName
    );
    return {
      ...otherProps,
      ...formContext,
      name: resolvedName,
      standaloneName: inputName,
      defaultValue: defaultValueExtractor(inputName),
    };
  }
}
