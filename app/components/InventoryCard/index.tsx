"use client";

import clsx from "clsx";
import { Pencil, Trash2, Heart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import DeleteConfirmationModal from "../DeleteConfirmationModal";

import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { setTempDelete, clearTempDelete } from "@/store/slices/inventorySlice";
import { setWishlist } from "@/store/slices/wishlistSlice";
import { Inventory } from "@/types/inventory";

interface InventoryCardProps {
  item: Inventory;
  onDelete?: (id: string) => void;
}

const InventoryCard = ({ item, onDelete: _onDelete }: InventoryCardProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const tempEdits = useSelector((state: RootState) => state.inventory.tempEdits);

  const mergedItem = useMemo(() => {
    return {
      ...item,
      ...(tempEdits[item.id] || {}),
    };
  }, [item, tempEdits]);

  const isOwner = useMemo(() => {
    return currentUser?.id === mergedItem.userId;
  }, [currentUser, mergedItem.userId]);

  const isInWishlist = useMemo(() => {
    return wishlistItems.some((wItem: Inventory) => wItem.id === mergedItem.id);
  }, [wishlistItems, mergedItem.id]);

  const handleToggleWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        if (isInWishlist) {
          const response = await apiService.removeFromWishlist(mergedItem.id);
          if (response.success) {
            dispatch(setWishlist(response.wishlists));
          }
        } else {
          const response = await apiService.addToWishlist(mergedItem.id);
          if (response.success) {
            dispatch(setWishlist(response.wishlists));
          }
        }
      } catch {
        showToast("Failed to update wishlist", "error");
      }
    },
    [dispatch, isInWishlist, mergedItem.id, showToast],
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setIsDeleteModalOpen(false);

    dispatch(setTempDelete(mergedItem.id));

    setTimeout(() => {
      dispatch(clearTempDelete(mergedItem.id));
    }, 20000);

    showToast("Item deleted temporarily", "info");
  }, [mergedItem.id, dispatch, showToast]);

  const handleNavigate = useCallback(() => {
    router.push(`/Inventory/${mergedItem.id}`);
  }, [router, mergedItem.id]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/Inventory/${mergedItem.id}/edit`);
    },
    [router, mergedItem.id],
  );

  return (
    <>
      <div
        onClick={handleNavigate}
        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500"
      >
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start gap-2 min-h-[32px]">
            {isOwner ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/90 dark:bg-blue-500/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-md border border-white/20 whitespace-nowrap">
                <User className="w-3 h-3" />
                Your Listing
              </span>
            ) : (
              <div />
            )}

            <button
              onClick={handleToggleWishlist}
              className={clsx(
                "p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-sm border",
                isInWishlist
                  ? "bg-red-100 text-red-500 border-red-200 dark:bg-red-900/80 dark:border-red-700"
                  : "bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-400 border-gray-100 dark:border-gray-800",
              )}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={clsx(
                  "w-5 h-5 transition-transform duration-300",
                  isInWishlist
                    ? "fill-current scale-110"
                    : "fill-none scale-100 group-hover:scale-110",
                )}
              />
            </button>
          </div>

          <div className="pt-0">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {mergedItem.brand}
                </h3>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
                {mergedItem.model}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100 dark:border-gray-700">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                Features
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {mergedItem.features.slice(0, 2).join(", ")}
                {mergedItem.features.length > 2 && "..."}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                Color
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">
                {mergedItem.color}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                ${mergedItem.price.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                  mergedItem.inStock
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}
              >
                {mergedItem.inStock ? "In Stock" : "Sold Out"}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {isOwner && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-2 flex justify-around items-center transition-all duration-300 ease-out z-20 translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0">
            <button
              onClick={handleEditClick}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer outline-none focus:text-blue-700"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Listing
            </button>
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-blue-300 transition-colors cursor-pointer outline-none focus:text-red-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Listing
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={`${mergedItem.brand} ${mergedItem.model}`}
      />
    </>
  );
};

export default InventoryCard;
