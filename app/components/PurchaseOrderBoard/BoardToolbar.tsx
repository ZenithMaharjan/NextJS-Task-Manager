"use client";

import clsx from "clsx";
import { Search, Tag, Filter, Loader2, Trash2 } from "lucide-react";
import React, { useCallback } from "react";

import { Dropdown } from "@/components";
import { PurchaseStatus } from "@/types/purchase";

const STATUS_OPTIONS: { label: string; value: PurchaseStatus | "All" }[] = [
  { label: "All Status", value: "All" },
  { label: "Initiated", value: "initiated" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Delivering", value: "delivering" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

interface BoardToolbarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  view: "buyer" | "seller";
  onViewChange: (view: "buyer" | "seller") => void;
  resultsCount: number;
  filterStatus: PurchaseStatus | "All";
  onFilterStatusChange: (value: PurchaseStatus | "All") => void;
  selectedInViewCount: number;
  isSelectionAuthorized: boolean;
  isDeleting: boolean;
  onDeleteSelected: () => void;
}

const BoardToolbar: React.FC<BoardToolbarProps> = ({
  searchQuery,
  onSearchChange,
  view,
  onViewChange,
  resultsCount,
  filterStatus,
  onFilterStatusChange,
  selectedInViewCount,
  isSelectionAuthorized,
  isDeleting,
  onDeleteSelected,
}) => {
  const handleBuyerViewClick = useCallback(() => {
    onViewChange("buyer");
  }, [onViewChange]);

  const handleSellerViewClick = useCallback(() => {
    onViewChange("seller");
  }, [onViewChange]);

  const handleOptionSelect = useCallback(
    (value: PurchaseStatus | "All") => {
      onFilterStatusChange(value);
    },
    [onFilterStatusChange],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:w-112.5 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by ID, Item, Customer, or Status..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBuyerViewClick}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer",
                view === "buyer"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              Purchaser View
            </button>
            <button
              onClick={handleSellerViewClick}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer",
                view === "seller"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              Seller View
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">
              {resultsCount} Results
            </span>
          </div>
        </div>
      </div>

      <div className="lg:hidden flex items-center justify-center gap-2 mb-4 animate-pulse">
        <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          ← Swipe to view more →
        </span>
        <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
      </div>

      <div className="flex flex-row gap-3 justify-end items-center mb-4 flex-wrap">
        {view === "buyer" && selectedInViewCount > 0 && isSelectionAuthorized ? (
          <>
            <button
              onClick={onDeleteSelected}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-2xl border border-red-500 text-sm font-black text-white shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap h-10 min-w-0 shrink-0"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Selected ({selectedInViewCount})
            </button>
            <Dropdown
              value={filterStatus}
              options={STATUS_OPTIONS}
              onSelect={handleOptionSelect}
              icon={Filter}
              showCheckmark={false}
              align="right"
              buttonClassName="w-auto h-10"
              dropdownClassName="w-44"
            />
          </>
        ) : (
          <Dropdown
            value={filterStatus}
            options={STATUS_OPTIONS}
            onSelect={handleOptionSelect}
            icon={Filter}
            showCheckmark={false}
            align="right"
            buttonClassName="w-auto h-10"
            dropdownClassName="w-44"
          />
        )}
      </div>
    </div>
  );
};

export default BoardToolbar;
