"use client";

import clsx from "clsx";
import React from "react";

import { PurchaseStatus } from "@/types/purchase";

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  initiated:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  confirmed:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  delivering:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  cancelled:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

interface StatusBadgeProps {
  status: PurchaseStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 shadow-sm",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
