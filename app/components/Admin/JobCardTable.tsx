"use client";

import clsx from "clsx";
import { Eye, FileText, User, Bike, Calendar } from "lucide-react";
import React, { useMemo, useCallback } from "react";

import { JobCard } from "@/types/jobCard";

const SKELETON_ROW_COUNT = 5;
const TABLE_HEADERS = ["SN", "Customer Name", "Vehicle", "Service Type", "Date"];

interface JobCardTableProps {
  jobCards: JobCard[];
  isLoading: boolean;
  onRowClick: (jobCard: JobCard) => void;
  selectedIds?: string[];
  onToggleSelect?: (jobCardId: string) => void;
  onSelectAll?: (isChecked: boolean) => void;
  currentPage?: number;
  pageSize?: number;
}

export default function JobCardTable({
  jobCards,
  isLoading,
  onRowClick,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  currentPage = 1,
  pageSize = 10,
}: JobCardTableProps) {
  const handleSelectAllChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSelectAll?.(event.target.checked);
    },
    [onSelectAll],
  );

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl w-full" />
        {[...Array(SKELETON_ROW_COUNT)].map((_, index) => (
          <div key={index} className="h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (!jobCards || jobCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No job cards found</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="lg:hidden flex items-center justify-center gap-2 mb-2 animate-pulse">
        <div className="h-px w-8 bg-gray-200 dark:bg-gray-800"></div>
        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
          ← Swipe to view more →
        </span>
        <div className="h-px w-8 bg-gray-200 dark:bg-gray-800"></div>
      </div>

      <div className="w-full bg-white dark:bg-gray-900/40 rounded-4xl border border-gray-100 dark:border-gray-800 p-2 sm:p-4 shadow-sm relative group/table">
        <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none bg-linear-to-l from-white/80 dark:from-gray-950/80 to-transparent z-10 lg:hidden rounded-r-4xl"></div>

        <div className="overflow-x-auto premium-scrollbar pb-4 px-2">
          <table className="w-full border-separate border-spacing-y-3 min-w-225">
            <thead>
              <tr className="text-left text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.25em] bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
                <th className="pl-6 py-4 w-6 rounded-l-2xl">
                  {onSelectAll && jobCards.length > 0 && (
                    <input
                      type="checkbox"
                      checked={selectedIds.length === jobCards.length}
                      onChange={handleSelectAllChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  )}
                </th>
                {TABLE_HEADERS.map(header => (
                  <th key={header} className="px-6 py-4">
                    {header}
                  </th>
                ))}
                <th className="px-6 py-4 text-right rounded-r-2xl pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobCards.map((jobCard, index) => (
                <JobCardRow
                  key={jobCard._id}
                  jobCard={jobCard}
                  onClick={onRowClick}
                  isSelected={selectedIds.includes(jobCard._id)}
                  onToggleSelect={onToggleSelect}
                  sn={(currentPage - 1) * pageSize + index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface JobCardRowProps {
  jobCard: JobCard;
  onClick: (jobCard: JobCard) => void;
  isSelected?: boolean;
  onToggleSelect?: (jobCardId: string) => void;
  sn: number;
}

const JobCardRow = ({ jobCard, onClick, isSelected, onToggleSelect, sn }: JobCardRowProps) => {
  const handleRowClick = useCallback(() => {
    onClick(jobCard);
  }, [onClick, jobCard]);

  const handleCheckboxCellClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const handleCheckboxChange = useCallback(() => {
    onToggleSelect?.(jobCard._id);
  }, [jobCard._id, onToggleSelect]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(jobCard.date));
  }, [jobCard.date]);

  const serviceTypeLabel = useMemo(() => {
    return jobCard.serviceType.replace("_", " ");
  }, [jobCard.serviceType]);

  const isMajorService = useMemo(() => {
    return jobCard.serviceType.toLowerCase().includes("major");
  }, [jobCard.serviceType]);

  return (
    <tr
      onClick={handleRowClick}
      className={clsx(
        "group bg-white dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer shadow-sm hover:shadow-md rounded-xl",
        isSelected && "bg-blue-50/50 dark:bg-blue-900/20",
      )}
    >
      <td
        className="pl-6 py-5 w-6 first:rounded-l-2xl border-y border-l border-gray-100 dark:border-gray-700"
        onClick={handleCheckboxCellClick}
      >
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={handleCheckboxChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        )}
      </td>
      <td className="px-6 py-5 border-y border-gray-100 dark:border-gray-700">
        <span className="font-bold text-gray-900 dark:text-white">
          {String(sn).padStart(2, "0")}
        </span>
      </td>
      <td className="px-6 py-5 border-y border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {jobCard.customer.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 border-y border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Bike className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {jobCard.vehicle.model}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 border-y border-gray-100 dark:border-gray-700">
        <span
          className={clsx(
            "px-3 py-1.5 whitespace-nowrap text-[10px] font-black rounded-full uppercase tracking-wider",
            isMajorService
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
              : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50",
          )}
        >
          {serviceTypeLabel}
        </span>
      </td>
      <td className="px-6 py-5 border-y border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-black text-gray-600 dark:text-gray-400 tracking-tight">
            {formattedDate}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 last:rounded-r-2xl border-y border-r border-gray-100 dark:border-gray-700 text-right">
        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          <Eye className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};
