"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateInputProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  minDate?: Date;
  dateFormat?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  selected,
  onChange,
  placeholderText = "Select Date",
  minDate,
  dateFormat = "MMM dd, yyyy",
}) => {
  return (
    <div className="relative flex-1 group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none group-focus-within:text-blue-500 transition-colors">
        <CalendarIcon className="w-4 h-4" />
      </div>
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        className="w-full pl-11 pr-4 h-11 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all cursor-pointer"
        dateFormat={dateFormat}
        minDate={minDate}
      />
    </div>
  );
};
