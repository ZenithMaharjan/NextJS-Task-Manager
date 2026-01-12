"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { Inventory } from "@/types/inventory";
import { RootState } from "@/store";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";

interface InventoryCardProps {
  item: Inventory;
}

const InventoryCard = ({ item }: InventoryCardProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const isInWishlist = useMemo(() => {
    return wishlistItems.some((wItem) => wItem.id === item.id);
  }, [wishlistItems, item.id]);

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isInWishlist) {
        dispatch(removeFromWishlist(item.id));
      } else {
        dispatch(addToWishlist(item));
      }
    },
    [dispatch, isInWishlist, item]
  );

  const handleNavigate = useCallback(() => {
    router.push(`/inventory/${item.id}`);
  }, [router, item.id]);

  return (
    <div
      onClick={handleNavigate}
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleToggleWishlist}
          className={clsx(
            "p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm",
            isInWishlist
              ? "bg-red-50 text-red-500 border border-red-100 dark:bg-red-900/40 dark:border-red-800"
              : "bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-red-400 border border-gray-100 dark:border-gray-700"
          )}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={clsx("w-5 h-5 transition-transform duration-300", 
              isInWishlist ? "fill-current scale-110" : "fill-none scale-100 group-hover:scale-110"
            )}
          />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {item.brand}
          </h3>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
            {item.model}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100 dark:border-gray-700">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Engine</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.engineCapacity} cc</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Color</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">{item.color}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              ${item.price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                item.inStock
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {item.inStock ? "In Stock" : "Sold Out"}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default InventoryCard;
