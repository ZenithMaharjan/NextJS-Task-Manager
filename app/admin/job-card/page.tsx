"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";

import { JobCardTable, Modal, JobCardForm } from "@/components";
import apiService from "@/services/api";
import { JobCard } from "@/types/jobCard";

export default function AdminJobCardPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchJobCards = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const response = await apiService.getJobCards({ page: currentPage, limit });
      if (response.success) {
        setJobCards(response.data);
        if (response.meta?.totalPages) {
          setHasMore(currentPage < response.meta.totalPages);
        } else {
          setHasMore(response.data.length === limit);
        }
      }
    } catch (error) {
      console.error("Failed to fetch job cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobCards(page);
  }, [fetchJobCards, page]);

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
    fetchJobCards(page);
  }, [handleCloseModal, fetchJobCards, page]);

  const handlePrevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const memoizedJobCards = useMemo(() => jobCards, [jobCards]);

  return (
    <div className="p-4 sm:p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Job Card <span className="text-blue-600">Administration</span>
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Manage and update workshop job cards.
        </p>
      </div>

      <JobCardTable jobCards={memoizedJobCards} isLoading={isLoading} onRowClick={handleRowClick} />

      <div className="mt-8 flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevPage}
          disabled={page === 1 || isLoading}
          className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Page {page}</span>
        <button
          onClick={handleNextPage}
          disabled={!hasMore || isLoading}
          className="px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>

      {selectedJobCard && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseModal} className="max-w-7xl">
          <JobCardForm
            initialData={selectedJobCard}
            onSuccess={handleUpdateSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
