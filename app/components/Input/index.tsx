"use client";

import React, { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  errorMessage?: string;
  containerClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, errorMessage, containerClassName, ...domProps } = props;

  const hasError = Boolean(errorMessage);

  return (
    <div className={containerClassName || "w-full"}>
      <input
        ref={ref}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${domProps.name}-error` : undefined}
        className={`w-full px-4 py-2 rounded-lg border dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all outline-none ${
          hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700"
        } ${className || ""}`}
        {...domProps}
      />
      {hasError && (
        <p
          id={`${domProps.name}-error`}
          className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
