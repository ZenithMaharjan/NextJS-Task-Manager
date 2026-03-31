"use client";

import clsx from "clsx";
import { Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useCallback, useEffect, useMemo } from "react";

import { JobCardTable, Modal, JobCardForm, DeleteConfirmationModal } from "@/components";
import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { JobCard } from "@/types/jobCard";

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 7;
const PAGINATION_ELLIPSIS = "..." as const;

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

  const fetchJobCards = useCallback(async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const response = await apiService.getJobCards({ page: pageNumber, limit: PAGE_SIZE });
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
  }, []);

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

        {hasSelectedItems && (
          <div className="flex justify-start sm:justify-end animate-in fade-in slide-in-from-right-4 duration-300">
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
      </div>

      <JobCardTable
        jobCards={jobCards}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
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
