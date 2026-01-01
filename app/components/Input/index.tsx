"use client";

import React, { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  showRequired?: boolean;
  errorMessage?: string;
  containerClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, showRequired, errorMessage, containerClassName, ...domProps } = props;

  return (
    <div className={containerClassName || ""}>
      <input
        ref={ref}
        aria-invalid={showRequired || Boolean(errorMessage) || undefined}
        aria-describedby={errorMessage ? `${domProps.name}-error` : undefined}
        className={`w-full px-4 py-2 rounded-lg border dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all ${
          showRequired || errorMessage ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        } ${className || ""}`}
        {...domProps}
      />
      {showRequired && errorMessage && (
        <p id={`${domProps.name}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
