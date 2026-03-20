"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import React, { useMemo } from "react";

import { PurchaseStatus } from "@/types/purchase";

interface Step {
  id: PurchaseStatus;
  label: string;
}

const STEPS: Step[] = [
  { id: "initiated", label: "Initiated" },
  { id: "confirmed", label: "Confirmed" },
  { id: "delivering", label: "Delivering" },
  { id: "completed", label: "Completed" },
];

interface PurchaseOrderStepperProps {
  currentStatus: PurchaseStatus;
}

const PurchaseOrderStepper: React.FC<PurchaseOrderStepperProps> = ({ currentStatus }) => {
  const currentIndex = useMemo(() => {
    return STEPS.findIndex(step => step.id === currentStatus);
  }, [currentStatus]);

  const isCancelled = currentStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800">
        <span className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
          Order Cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -translate-y-1/2" />

        <div
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 transition-all duration-700 ease-in-out -translate-y-1/2"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex || currentStatus === "completed";
          const isActive = index === currentIndex && currentStatus !== "completed";
          const isPending = index > currentIndex && currentStatus !== "completed";

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={clsx(
                  "w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center",
                  isCompleted && "bg-blue-600 border-blue-600",
                  isActive &&
                    "bg-white dark:bg-gray-900 border-blue-600 ring-4 ring-blue-100 dark:ring-blue-600/20",
                  isPending && "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600",
                )}
              >
                {isCompleted && <Check className="w-2.5 h-2.5 text-white stroke-[4]" />}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
              </div>
              <span
                className={clsx(
                  "absolute top-6 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                  isCompleted || isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-8" />
    </div>
  );
};

export default React.memo(PurchaseOrderStepper);
