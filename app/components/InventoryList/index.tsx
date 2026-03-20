"use client";

import clsx from "clsx";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

import SelectInput from "../Form/SelectInput";
import InventoryCard from "../InventoryCard";

import { ShimmerLoading } from "@/components";
import type { RootState } from "@/store";
import { Inventory } from "@/types/inventory";

interface InventoryListProps {
  items: Inventory[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: string | null;
  onDelete: (id: string) => void;
  infiniteScroll?: boolean;
  onLoadMore?: () => void;
  totalItems?: number;
}

const ROWS_PER_PAGE_OPTIONS = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
  { label: "20", value: "20" },
];

const MAX_VISIBLE_PAGES = 7;

function getPaginationRange(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
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
        "w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm",
        currentPage === page
          ? "bg-blue-600 text-white shadow-blue-200 dark:shadow-none"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
      )}
    >
      {page}
    </button>
  );
};

const InventoryList = ({
  items,
  loading,
  loadingMore,
  hasMore,
  error,
  onDelete,
  infiniteScroll = false,
  onLoadMore,
  totalItems,
}: InventoryListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const tempDeletes = useSelector((state: RootState) => state.inventory.tempDeletes);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return items
      .filter(item => !tempDeletes[item._id])
      .filter(
        item =>
          item.brand.toLowerCase().includes(searchLower) ||
          item.model.toLowerCase().includes(searchLower) ||
          (typeof item.type === "string" && item.type.toLowerCase().includes(searchLower)),
      );
  }, [items, searchTerm, tempDeletes]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

  const paginationRange = useMemo(
    () => getPaginationRange(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const activeItems = useMemo(() => {
    if (infiniteScroll) return filteredItems;
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage, infiniteScroll]);

  useEffect(() => {
    if (!infiniteScroll || !onLoadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 1.0 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [infiniteScroll, onLoadMore, hasMore, loadingMore, loading]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleRowsPerPageChange = useCallback((e: { value: string }) => {
    setRowsPerPage(Number(e.value));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
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

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center space-x-4">
              <ShimmerLoading className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <ShimmerLoading className="h-4 w-3/4 rounded" />
                <ShimmerLoading className="h-4 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-6 rounded-xl text-center">
        <p className="text-red-700 dark:text-red-400 font-semibold mb-2 text-lg">
          Error Loading Inventory
        </p>
        <p className="text-red-600 dark:text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md py-4 -mx-4 px-4">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by brand, model or type..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          />
        </div>

        {!infiniteScroll && (
          <div className="flex items-center gap-4 w-full md:w-auto">
            <SelectInput
              label="Rows per page"
              options={ROWS_PER_PAGE_OPTIONS}
              value={rowsPerPage.toString()}
              onChange={handleRowsPerPageChange}
              className="min-w-30"
            />
          </div>
        )}
      </div>

      {activeItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeItems.map((item: Inventory) => (
            <InventoryCard key={item._id} item={item} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No motorcycles found matching your search.
          </p>
        </div>
      )}

      {infiniteScroll && (
        <div className="flex flex-col items-center gap-4 py-8">
          {totalItems !== undefined && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Showing <span className="text-gray-900 dark:text-white">{items.length}</span> of{" "}
              <span className="text-gray-900 dark:text-white">{totalItems}</span> motorcycle items
            </p>
          )}

          {hasMore && (
            <div ref={loaderRef} className="py-2 flex justify-center">
              {loadingMore && (
                <div className="flex flex-col items-center gap-2">
                  <ShimmerLoading className="h-8 w-8 rounded-full" />
                  <ShimmerLoading className="h-4 w-32 rounded" />
                </div>
              )}
            </div>
          )}

          {!hasMore && items.length > 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              You&apos;ve reached the end of your wishlist
            </p>
          )}
        </div>
      )}

      {!infiniteScroll && totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-12 pb-8 px-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {paginationRange.map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-600 font-black text-sm select-none"
                >
                  ...
                </span>
              ) : (
                <PaginationButton
                  key={page}
                  page={page}
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
    </div>
  );
};

export default InventoryList;
