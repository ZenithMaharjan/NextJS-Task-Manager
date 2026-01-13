"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, Heart, User } from "lucide-react";
import clsx from "clsx";
import { Inventory } from "@/types/inventory";
import { RootState } from "@/store";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";

interface InventoryCardProps {
  item: Inventory;
  onDelete: (id: string) => void;
}

const InventoryCard = ({ item, onDelete }: InventoryCardProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const isOwner = useMemo(() => {
    return currentUser?.id === item.userId;
  }, [currentUser, item.userId]);

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

  const [isExiting, setIsExiting] = useState(false);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      alert(`Mock Edit: Opening editor for ${item.brand} ${item.model}`);
      console.log("Edit item:", item.id);
    },
    [item.brand, item.model, item.id]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete this ${item.brand} ${item.model}?`)) {
        setIsExiting(true);
        console.log("Starting temporary delete animation for item:", item.id);
        setTimeout(() => {
          onDelete(item.id);
        }, 300);
      }
    },
    [item.brand, item.model, item.id, onDelete]
  );

  const handleNavigate = useCallback(() => {
    router.push(`/inventory/${item.id}`);
  }, [router, item.id]);


  return (
    <div
      onClick={handleNavigate}
      className={clsx(
        "group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transform hover:-translate-y-1",
        isExiting && "opacity-0 scale-95 pointer-events-none"
      )}
    >
<div className="absolute top-4 left-4 z-10">
        {isOwner && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/90 dark:bg-blue-500/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-md border border-white/20 animate-in fade-in zoom-in duration-500">
            <User className="w-3 h-3" />
            Your Listing
          </span>
        )}
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleToggleWishlist}
          className={clsx(
            "p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-sm border",
            isInWishlist
              ? "bg-red-100 text-red-500 border-red-200 dark:bg-red-900/80 dark:border-red-700"
              : "bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-400 border-gray-100 dark:border-gray-800"
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
        <div className="pt-2">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {item.brand}
            </h3>
          </div>
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

      {isOwner && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-2 flex justify-around items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Listing
          </button>
          <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Listing
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryCard;
