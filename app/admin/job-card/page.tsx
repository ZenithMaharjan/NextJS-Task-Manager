"use client";

import clsx from "clsx";
import { Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Search, X, FilterX } from "lucide-react";
import React, { useState, useCallback, useEffect, useMemo } from "react";

import {
  JobCardTable,
  Modal,
  JobCardForm,
  DeleteConfirmationModal,
  Input,
  Dropdown,
  DateInput,
} from "@/components";
import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { JobCard, JobCardServiceType, JobCardQuery } from "@/types/jobCard";
import { debounce } from "@/utils";

import "react-datepicker/dist/react-datepicker.css";

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 7;
const PAGINATION_ELLIPSIS = "..." as const;

const SERVICE_TYPE_OPTIONS: { label: string; value: JobCardServiceType | "all" }[] = [
  { label: "All Services", value: "all" },
  { label: "First Service", value: "first_service" },
  { label: "Normal Service", value: "normal_service" },
];

function getPaginationRange(
  currentPage: number,
  totalPages: number,
): (number | typeof PAGINATION_ELLIPSIS)[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, PAGINATION_ELLIPSIS, totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      PAGINATION_ELLIPSIS,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    PAGINATION_ELLIPSIS,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    PAGINATION_ELLIPSIS,
    totalPages,
  ];
}

const getEndOfDayISO = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
};

interface PaginationButtonProps {
  page: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationButton = ({ page, currentPage, onPageChange }: PaginationButtonProps) => {
  const handleClick = useCallback(() => {
    onPageChange(page);
  }, [onPageChange, page]);

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer",
        currentPage === page
          ? "bg-blue-600 text-white shadow-blue-200 dark:shadow-none"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
      )}
    >
      {page}
    </button>
  );
};

export default function AdminJobCardPage() {
  const { showToast } = useToast();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [serviceType, setServiceType] = useState<JobCardServiceType | "all">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedCustomerSearch(value);
        setCurrentPage(1);
      }, 500),
    [],
  );

  useEffect(() => {
    debouncedSetSearch(customerSearch);
  }, [customerSearch, debouncedSetSearch]);

  const fetchJobCards = useCallback(
    async (pageNumber: number) => {
      const params: JobCardQuery = {
        page: pageNumber,
        limit: PAGE_SIZE,
        customerName: debouncedCustomerSearch || undefined,
        serviceType: serviceType === "all" ? undefined : serviceType,
        created_at__gte: startDate?.toISOString(),
        created_at__lte: getEndOfDayISO(endDate),
      };

      try {
        setIsLoading(true);
        const response = await apiService.getJobCards(params);
        if (response.success) {
          setJobCards(response.data);
          if (response.meta?.total) {
            setTotalPages(Math.ceil(response.meta.total / PAGE_SIZE) || 1);
          } else {
            setTotalPages(Math.ceil(response.data.length / PAGE_SIZE) || 1);
          }
        }
      } catch (error) {
        console.error("Failed to fetch job cards:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedCustomerSearch, serviceType, startDate, endDate],
  );

  useEffect(() => {
    fetchJobCards(currentPage);
  }, [fetchJobCards, currentPage]);

  const handleRowClick = useCallback((jobCard: JobCard) => {
    setSelectedJobCard(jobCard);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedJobCard(null);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    handleCloseModal();
    fetchJobCards(currentPage);
  }, [handleCloseModal, fetchJobCards, currentPage]);

  const handleToggleSelect = useCallback((jobCardId: string) => {
    setSelectedIds(prev =>
      prev.includes(jobCardId)
        ? prev.filter(existingId => existingId !== jobCardId)
        : [...prev, jobCardId],
    );
  }, []);

  const handleSelectAll = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        setSelectedIds(jobCards.map(jobCard => jobCard._id));
      } else {
        setSelectedIds([]);
      }
    },
    [jobCards],
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setIsDeleteModalOpen(true);
  }, [selectedIds.length]);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    const successfullyDeleted: string[] = [];
    const failedDeletes: string[] = [];

    await Promise.all(
      selectedIds.map(async jobCardId => {
        try {
          const response = await apiService.deleteJobCard(jobCardId);
          if (response.success) {
            successfullyDeleted.push(jobCardId);
          } else {
            failedDeletes.push(jobCardId);
          }
        } catch {
          failedDeletes.push(jobCardId);
        }
      }),
    );

    if (failedDeletes.length > 0) {
      showToast(`Failed to delete ${failedDeletes.length} job card(s)`, "error");
    } else {
      showToast("Successfully deleted selected job card(s)", "success");
    }
    setSelectedIds([]);
    fetchJobCards(currentPage);
    setIsDeleting(false);
  }, [selectedIds, showToast, fetchJobCards, currentPage]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages],
  );

  const handlePrevPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  const handleCustomerSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearch(e.target.value);
  }, []);

  const handleClearCustomerSearch = useCallback(() => {
    setCustomerSearch("");
  }, []);

  const handleServiceTypeChange = useCallback((val: string) => {
    setServiceType(val as JobCardServiceType | "all");
  }, []);

  const handleStartDateChange = useCallback((date: Date | null) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: Date | null) => {
    setEndDate(date);
  }, []);

  const handleClearFilters = useCallback(() => {
    setCustomerSearch("");
    setServiceType("all");
    setStartDate(null);
    setEndDate(null);
  }, []);

  const paginationRange = useMemo(
    () => getPaginationRange(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const hasSelectedItems = selectedIds.length > 0;

  const deleteButtonIcon = useMemo(
    () =>
      isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />,
    [isDeleting],
  );

  return (
    <div className="p-4 sm:p-8 lg:p-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Job Card <span className="text-blue-600">Administration</span>
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage and update workshop job cards.
          </p>
        </div>
      </div>

      <div className="mb-8 p-6 bg-white dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
              Customer Name
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Search by customer name..."
                value={customerSearch}
                onChange={handleCustomerSearchChange}
                className="pl-11 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-blue-500/20"
              />
              {customerSearch && (
                <button
                  onClick={handleClearCustomerSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
              Service Type
            </label>
            <Dropdown
              value={serviceType}
              options={SERVICE_TYPE_OPTIONS}
              onSelect={handleServiceTypeChange}
              className="w-full"
              buttonClassName="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-bold hover:border-blue-300 dark:hover:border-blue-700"
            />
          </div>

          <div className="flex-[1.5] space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <DateInput
                selected={startDate}
                onChange={handleStartDateChange}
                placeholderText="Start Date"
              />
              <span className="text-gray-300 dark:text-gray-700 font-black">~</span>
              <DateInput
                selected={endDate}
                onChange={handleEndDateChange}
                placeholderText="End Date"
                minDate={startDate || undefined}
              />
            </div>
          </div>

          <div className="flex items-end h-11">
            {(customerSearch || serviceType !== "all" || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-2 px-4 h-11 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                title="Clear all filters"
              >
                <FilterX className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {hasSelectedItems && (
        <div className="mb-4 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl border border-red-500 text-sm font-black text-white shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap h-10 min-w-0 shrink-0"
          >
            {deleteButtonIcon}
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}

      <JobCardTable
        jobCards={jobCards}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />

      {totalPages >= 1 && (
        <div className="flex justify-center items-center gap-1 mt-12 pb-8 px-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {paginationRange.map((pageItem, index) =>
              pageItem === PAGINATION_ELLIPSIS ? (
                <span
                  key={`ellipsis-${index}`}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-600 font-black text-sm select-none"
                >
                  ...
                </span>
              ) : (
                <PaginationButton
                  key={pageItem}
                  page={pageItem}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              ),
            )}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {selectedJobCard && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseModal} className="max-w-7xl">
          <JobCardForm
            initialData={selectedJobCard}
            onSuccess={handleUpdateSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemName={
            selectedIds.length === 1 ? "the selected job card" : `${selectedIds.length} job cards`
          }
        />
      )}
    </div>
  );
}
