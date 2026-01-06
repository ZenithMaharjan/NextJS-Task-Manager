"use client";

import React from 'react';
import clsx from 'clsx';

interface Option {
  label: string;
  value: string;
}

interface SelectInputProps {
  label?: string;
  options?: Option[];
  value?: string;
  onChange: (e: { value: string }) => void;
  className?: string;
  placeholder?: string;
}

const SelectInput = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  className,
  placeholder = "Select an option..."
}: SelectInputProps) => {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange({ value: e.target.value })}
        className="block w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
