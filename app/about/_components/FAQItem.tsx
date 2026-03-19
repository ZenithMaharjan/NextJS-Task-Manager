"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div
      className={clsx(
        "rounded-xl shadow-sm overflow-hidden transition-all duration-300 border",
        "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md",
      )}
    >
      <button
        onClick={toggle}
        className={clsx(
          "w-full flex justify-between items-center font-semibold text-lg px-6 py-4 transition-colors text-left cursor-pointer",
          "text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/50 ",
        )}
      >
        <span>{question}</span>
        <ChevronRight
          size={20}
          className={clsx(
            "transition-transform duration-300 shrink-0 p-1 rounded-lg cursor-pointer",
            isOpen
              ? "rotate-90 text-white bg-indigo-500 dark:bg-indigo-600"
              : "rotate-0 text-white bg-blue-600 dark:bg-blue-600",
          )}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-2 border-t border-gray-50 dark:border-gray-700/50">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
