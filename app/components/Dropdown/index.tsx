"use client";

import clsx from "clsx";
import { ChevronDown, Check, LucideIcon } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";

interface DropdownOptionProps<T> {
  label: string;
  value: T;
  isSelected: boolean;
  onSelect: (value: T) => void;
  showCheckmark?: boolean;
}

function DropdownOptionInner<T>({
  label,
  value,
  isSelected,
  onSelect,
  showCheckmark = true,
}: DropdownOptionProps<T>) {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [value, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "flex items-center justify-between w-full text-left px-4 py-2.5 text-sm font-bold transition-all",
        isSelected
          ? "bg-blue-600 text-white"
          : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400",
      )}
    >
      <span className="capitalize">{label}</span>
      {isSelected && showCheckmark && <Check className="w-4 h-4" />}
    </button>
  );
}

const DropdownOption = memo(DropdownOptionInner) as typeof DropdownOptionInner;

interface DropdownProps<T> {
  value: T;
  options: { label: string; value: T }[];
  onSelect: (value: T) => void;
  label?: string;
  maxHeight?: string;
  icon?: LucideIcon;
  showCheckmark?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  align?: "left" | "right";
}

const Dropdown = <T,>({
  value,
  options,
  onSelect,
  label,
  maxHeight,
  icon: Icon,
  showCheckmark = true,
  className,
  buttonClassName,
  dropdownClassName,
  align = "left",
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  const handleSelect = useCallback(
    (val: T) => {
      onSelect(val);
      closeDropdown();
    },
    [onSelect, closeDropdown],
  );

  const selectedOption = useMemo(
    () => options.find(option => option.value === value),
    [options, value],
  );

  const triggerLabel = useMemo(
    () => label || selectedOption?.label || String(value),
    [label, selectedOption, value],
  );

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={clsx(
          "flex items-center justify-between w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-black text-blue-600 dark:text-blue-400 transition-all hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer h-10 min-w-0 shrink-0",
          buttonClassName,
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon className="w-4 h-4 text-gray-400 shrink-0" />}
          <span className="capitalize truncate">{triggerLabel}</span>
        </div>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-1",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          className={clsx(
            "absolute z-50 mt-2 min-w-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl shadow-black/10 overflow-hidden premium-scrollbar",
            align === "right" ? "right-0" : "left-0",
            maxHeight && `${maxHeight} overflow-y-auto`,
            dropdownClassName,
          )}
        >
          {options.map(option => (
            <DropdownOption
              key={String(option.value)}
              label={option.label}
              value={option.value}
              isSelected={value === option.value}
              onSelect={handleSelect}
              showCheckmark={showCheckmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(Dropdown) as typeof Dropdown;
