"use client";

import { ChevronRight } from "lucide-react";
import * as React from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex justify-between items-center font-semibold text-gray-900 text-lg px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        {question}
        <ChevronRight
          size={20}
          className={`transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
