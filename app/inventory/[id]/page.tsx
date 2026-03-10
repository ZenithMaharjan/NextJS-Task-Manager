"use client";

import clsx from "clsx";
import { Pencil, Trash2, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import PurchaseOrderDrawer from "./PurchaseOrderDrawer";

import { DeleteConfirmationModal } from "@/components";
import { InventoryDetailSkeleton } from "@/components";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { setTempDelete } from "@/store/slices/inventorySlice";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { Inventory } from "@/types/inventory";

export default function InventoryItemPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const tempEdits = useSelector((state: RootState) => state.inventory.tempEdits);
  const tempDeletes = useSelector((state: RootState) => state.inventory.tempDeletes);
  const router = useRouter();

  const [item, setItem] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeletedUI, setShowDeletedUI] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);

  const activeItem = useMemo(() => {
    if (!item) return null;
    return {
      ...item,
      ...(tempEdits[item.id] || {}),
    };
  }, [item, tempEdits]);

  const isDeletedLocally = useMemo(() => {
    return activeItem ? !!tempDeletes[activeItem.id] : false;
  }, [activeItem, tempDeletes]);

  const isOwner = useMemo(() => {
    return currentUser?.id === activeItem?.userId;
  }, [currentUser, activeItem?.userId]);

  const isInWishlist = useMemo(() => {
    return activeItem
      ? wishlistItems.some((wItem: Inventory) => wItem.id === activeItem.id)
      : false;
  }, [activeItem, wishlistItems]);

  const fetchItem = useCallback(async (itemId: string) => {
    try {
      const data = await apiService.getInventoryById(itemId);
      setItem(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to load inventory item");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditClick = useCallback(() => {
    if (!activeItem) return;
    router.push(`/Inventory/${activeItem.id}/edit`);
  }, [router, activeItem]);

  const handleDelete = useCallback(() => {
    if (!activeItem) return;
    setIsDeleteModalOpen(true);
  }, [activeItem]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!activeItem) return;
    setIsDeleteModalOpen(false);
    dispatch(setTempDelete(activeItem.id));

    setShowDeletedUI(true);
    setTimeout(() => {
      router.push("/Inventory");
    }, 1000);
  }, [activeItem, router, dispatch]);

  const handleOpenPurchaseDrawer = useCallback(() => {
    setIsPurchaseDrawerOpen(true);
  }, []);

  const handleClosePurchaseDrawer = useCallback(() => {
    setIsPurchaseDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (!id) return;
    const itemId = Array.isArray(id) ? id[0] : id;
    fetchItem(itemId);
  }, [id, fetchItem]);

  const toggleWishlist = useCallback(() => {
    if (!activeItem) return;
    if (isInWishlist) {
      dispatch(removeFromWishlist(activeItem.id));
    } else {
      dispatch(addToWishlist(activeItem));
    }
  }, [dispatch, isInWishlist, activeItem]);

  if (showDeletedUI || isDeletedLocally) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-red-600">Item Deleted</h1>
        <p className="text-gray-600 mt-2">Redirecting to inventory...</p>
      </div>
    );
  }
  if (loading) {
    return <InventoryDetailSkeleton />;
  }
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!activeItem) return <div className="p-8 text-center dark:text-gray-300">Item not found</div>;

  return (
    <>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
            <div className="flex-1">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">{activeItem.brand}</span>
                  {activeItem.model}
                </h1>
                <p className="text-gray-500 text-lg mt-2 dark:text-gray-400 font-medium">
                  {activeItem.year} <span className="mx-2 text-gray-300">•</span>{" "}
                  <span className="capitalize">{activeItem.condition}</span>
                </p>
              </div>
            </div>
            {isOwner && (
              <span className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30">
                <User className="w-3.5 h-3.5" />
                Your Listing
              </span>
            )}
          </div>

          <div className="p-8 space-y-6 transition-all duration-300">
            <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 pb-4">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Price
              </span>
              <span className="text-3xl font-black text-green-600 dark:text-green-400">
                ${activeItem.price.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Stock Status
                </p>
                <p
                  className={clsx(
                    "text-lg font-bold",
                    activeItem.inStock ? "text-green-500" : "text-red-500",
                  )}
                >
                  {activeItem.inStock ? `In Stock (${activeItem.quantity})` : "Out of Stock"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Engine
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  {activeItem.engineCapacity}cc
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Color
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                  {activeItem.color}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                Features
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {activeItem.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 px-3 py-2 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gray-50/80 dark:bg-black/20 backdrop-blur-sm border-t border-gray-50 dark:border-gray-700 flex justify-end items-center gap-4">
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 font-bold text-sm transition-all active:scale-95 shadow-lg cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Listing
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900/30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Listing
                </button>
              </div>
            )}
            <button
              onClick={toggleWishlist}
              className={clsx(
                "px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg cursor-pointer",
                isInWishlist
                  ? "bg-red-500 text-white shadow-red-500/30 hover:bg-red-600"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90",
              )}
            >
              {isInWishlist ? "Unsave Item" : "Save to Wishlist"}
            </button>
            {currentUser && (
              <button
                onClick={handleOpenPurchaseDrawer}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30 cursor-pointer"
              >
                Purchase
              </button>
            )}
          </div>
        </div>
      </div>

      <PurchaseOrderDrawer
        isOpen={isPurchaseDrawerOpen}
        onClose={handleClosePurchaseDrawer}
        inventoryItem={activeItem}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={`${activeItem.brand} ${activeItem.model}`}
      />
    </>
  );
}
