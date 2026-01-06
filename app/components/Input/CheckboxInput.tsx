import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
const Localize = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface CheckboxInputProps {
  label?: string;
  className?: string;
  checkboxClassName?: string;
  size?: string | number;
  value?: string | boolean;
  required?: boolean;
  warning?: boolean;
  showRequired?: boolean;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (target: HTMLInputElement) => void;
  errorMessage?: any;
  info?: string;
  indeterminate?: boolean;
  checked?: boolean;
}

const CheckboxInput = (props: CheckboxInputProps) => {
  const {
    label,
    className: _className,
    checkboxClassName,
    size = "1.25em",
    inputRef,
    disabled,
    required,
    onChange,
    errorMessage,
    warning,
    showRequired,
    info,
    indeterminate,
    checked,
    ...otherProps
  } = props;

  const hasError = !!errorMessage;
  const hasInfo = !!info;
  const hasWarning = !!warning || showRequired;

  const containerClasses = clsx(
    "relative flex items-center gap-2 cursor-pointer select-none transition-opacity",
    {
      "opacity-50 cursor-not-allowed": disabled,
    },
    _className,
  );

  const checkboxClasses = clsx(
    "relative flex shrink-0 items-center justify-center rounded border transition-all duration-200 ease-in-out",
    {
      "bg-blue-600 border-blue-600": checked || indeterminate,
      "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600": !checked && !indeterminate,
      "border-red-500": hasError,
      "border-amber-500": hasWarning,
      "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600": disabled,
    },
    checkboxClassName,
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target);
    },
    [onChange],
  );

  const getErrorMessage = useCallback(() => {
    if (Array.isArray(errorMessage)) {
      return errorMessage[0];
    }
    return errorMessage;
  }, [errorMessage]);

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate, inputRef]);

  const errMsg = getErrorMessage();

  const { value: _v, ...inputProps } = otherProps;

  return (
    <div className="flex flex-col gap-1.5">
      <label className={containerClasses} style={{ fontSize: size }}>
        <div
          className="relative flex items-center justify-center"
          style={{ width: "1em", height: "1em" }}
        >
          <input
            disabled={disabled}
            ref={inputRef}
            type="checkbox"
            checked={checked}
            className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={handleChange}
            {...inputProps}
          />
          <div className={checkboxClasses} style={{ width: "1em", height: "1em" }}>
            {(checked || indeterminate) && (
              <div className="flex items-center justify-center text-white">
                {indeterminate ? (
                  <svg className="h-0.75em w-0.75em fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="h-0.75em w-0.75em fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Localize>{label}</Localize>
          </span>
        )}
      </label>
      {hasInfo && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          <Localize>{info}</Localize>
        </span>
      )}
      {hasError && (
        <span className="text-xs text-red-500">
          <Localize>{errMsg}</Localize>
        </span>
      )}
      {hasWarning && (
        <span className="text-xs text-amber-500">
          <Localize>{warning || "Required"}</Localize>
        </span>
      )}
    </div>
  );
};

export default CheckboxInput;
