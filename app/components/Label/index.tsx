import React from "react";

export default function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
