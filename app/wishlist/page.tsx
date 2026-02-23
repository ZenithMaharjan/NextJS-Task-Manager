"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RAList } from "@/components";
import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { setWishlist, appendWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWishlist = useCallback(
    async (pageToFetch: number, isInitial: boolean = false) => {
      try {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        const response = await apiService.getWishlist(pageToFetch, 6);
        if (response.success) {
          if (isInitial) {
            dispatch(setWishlist(response.wishlists));
          } else {
            dispatch(appendWishlist(response.wishlists));
          }
          setHasMore(response.hasMore);
          setTotalCount(response.count);
        }
      } catch {
        showToast("Failed to fetch wishlist", "error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [dispatch, showToast],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/Login");
      return;
    }

    fetchWishlist(1, true);
  }, [isAuthenticated, router, fetchWishlist]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWishlist(nextPage);
    }
  }, [hasMore, loadingMore, page, fetchWishlist]);

  const handleDeleteItem = useCallback(
    (id: string) => {
      dispatch(removeFromWishlist(id));
    },
    [dispatch],
  );

  const handleBrowseInventory = useCallback(() => router.push("/Inventory"), [router]);

  if (!isAuthenticated) return null;

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full dark:bg-gray-900">
      <div className="p-8 max-w-7xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Heart className="fill-current text-indigo-500" />
            My Wishlist
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage the items you&apos;re interested in.
          </p>
        </header>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start adding items from the inventory to track them here.
            </p>
            <button
              onClick={handleBrowseInventory}
              className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors"
            >
              Browse Inventory
            </button>
          </div>
        ) : (
          <RAList
            items={wishlistItems}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onDelete={handleDeleteItem}
            infiniteScroll={true}
            onLoadMore={handleLoadMore}
            totalItems={totalCount}
          />
        )}
      </div>
    </div>
  );
}
