"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, Heart, User, Save, X, Check, Loader2 } from "lucide-react";
import clsx from "clsx";
import { Inventory } from "@/types/inventory";
import { RootState } from "@/store";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { setTempEdit, clearTempEdit, setTempDelete } from "@/store/slices/inventorySlice";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import apiService from "@/services/api";

interface InventoryCardProps {
  item: Inventory;
  onDelete: (id: string) => void;
}

const InventoryCard = ({ item, onDelete }: InventoryCardProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const tempEdits = useSelector((state: RootState) => state.inventory.tempEdits);
  const tempDeletes = useSelector((state: RootState) => state.inventory.tempDeletes);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Inventory>>({});

  const activeItem = useMemo(() => {
    return {
      ...item,
      ...(tempEdits[item.id] || {}),
    };
  }, [item, tempEdits]);

  const isDeleted = useMemo(() => {
    return !!tempDeletes[activeItem.id];
  }, [tempDeletes, activeItem.id]);

  const isOwner = useMemo(() => {
    return currentUser?.id === activeItem.userId;
  }, [currentUser, activeItem.userId]);

  const isInWishlist = useMemo(() => {
    return wishlistItems.some((wItem: Inventory) => wItem.id === activeItem.id);
  }, [wishlistItems, activeItem.id]);

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isInWishlist) {
        dispatch(removeFromWishlist(activeItem.id));
      } else {
        dispatch(addToWishlist(activeItem));
      }
    },
    [dispatch, isInWishlist, activeItem]
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
    dispatch(setTempDelete(activeItem.id));
  }, [activeItem.id, dispatch]);

  const handleNavigate = useCallback(() => {
    router.push(`/inventory/${activeItem.id}`);
  }, [router, activeItem.id]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedData({
      brand: activeItem.brand,
      model: activeItem.model,
      price: activeItem.price,
      color: activeItem.color,
      inStock: activeItem.inStock,
    });
    setIsEditing(true);
  }, [activeItem]);

  const handleCancelEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedData({});
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              name === "price" ? Number(value) : 
              name === "inStock" ? value === "true" : value,
    }));
  }, []);

  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    try {
      // Local check if any data really changed
      if (Object.keys(editedData).length === 0) {
        setIsEditing(false);
        return;
      }

      // Update in Redux for immediate UI feedback
      dispatch(setTempEdit({ id: activeItem.id, data: editedData }));
      
      // Update in DB
      await apiService.patchInventory(activeItem.id, editedData);
      
      setIsEditing(false);
      setEditedData({});
    } catch (error) {
      console.error("Failed to save inventory item:", error);
    } finally {
      setSaving(false);
    }
  }, [activeItem.id, editedData, dispatch]);

  return (
    <>
      <div
        onClick={handleNavigate}
        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      >
        <div className="absolute top-4 right-14 z-10 transition-transform duration-300">
          {isOwner && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/90 dark:bg-blue-500/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-md border border-white/20 whitespace-nowrap">
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
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                {isEditing ? (
                  <input
                    name="brand"
                    value={editedData.brand}
                    onChange={handleInputChange}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 outline-none w-full"
                  />
                ) : (
                  <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {activeItem.brand}
                  </h3>
                )}
              </div>
              {isEditing ? (
                <input
                  name="model"
                  value={editedData.model}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xl font-bold text-gray-900 dark:text-white mt-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 outline-none w-full"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
                  {activeItem.model}
                </h2>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100 dark:border-gray-700">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Features</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {activeItem.features.slice(0, 2).join(", ")}{activeItem.features.length > 2 && "..."}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Color</p>
              {isEditing ? (
                <input
                  name="color"
                  value={editedData.color}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 outline-none w-full"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">{activeItem.color}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-gray-900 dark:text-white">$</span>
                  <input
                    type="number"
                    name="price"
                    value={editedData.price}
                    onChange={handleInputChange}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xl font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 outline-none w-24"
                  />
                </div>
              ) : (
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  ${activeItem.price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <select
                  name="inStock"
                  value={editedData.inStock?.toString()}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none"
                >
                  <option value="true">In Stock</option>
                  <option value="false">Sold Out</option>
                </select>
              ) : (
                <span
                  className={clsx(
                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                    activeItem.inStock
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {activeItem.inStock ? "In Stock" : "Sold Out"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {isOwner && (
          <div className={clsx(
            "absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-2 flex justify-around items-center transition-transform duration-300 ease-out z-20",
            isEditing ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
          )}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {saving ? "Saving..." : "Save"}
                </button>
                <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700" />
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditClick}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Listing
                </button>
                <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700" />
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Listing
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={`${activeItem.brand} ${activeItem.model}`}
      />
    </>
  );
};

export default InventoryCard;
