"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import apiService from "@/services/api";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { RootState } from "@/store";
import { Inventory } from "@/types/inventory";

import { Pencil, Trash2, User } from "lucide-react";
import { DeleteConfirmationModal } from "@/components";

export default function InventoryItemPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

const router = useRouter();
  const [item, setItem] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isOwner = useMemo(() => {
    return currentUser?.id === item?.userId;
  }, [currentUser, item?.userId]);

  const isInWishlist = useMemo(() => {
    return item ? wishlistItems.some((wItem) => wItem.id === item.id) : false;
  }, [item, wishlistItems]);

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

  const handleEdit = useCallback(() => {
    if (!item) return;
    alert(`Mock Edit: Opening editor for ${item.brand} ${item.model}`);
    console.log("Edit item:", item.id);
  }, [item]);

  const handleDelete = useCallback(() => {
    if (!item) return;
    setIsDeleteModalOpen(true);
  }, [item]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!item) return;
    setIsDeleteModalOpen(false);
    console.log("Delete item:", item.id);
    setIsDeleted(true);
    setTimeout(() => {
      router.push("/inventory");
    }, 1000);
  }, [item, router]);

  if (isDeleted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-red-600">Item Deleted</h1>
        <p className="text-gray-600 mt-2">Redirecting to inventory...</p>
      </div>
    );
  }

  useEffect(() => {
    if (!id) return;
    const itemId = Array.isArray(id) ? id[0] : id;
    fetchItem(itemId);
  }, [id,fetchItem]);

  const handleWishlistToggle = useCallback(() => {
    if (!item) return;
    if (isInWishlist) dispatch(removeFromWishlist(item.id));
    else dispatch(addToWishlist(item));
  }, [item, isInWishlist, dispatch ]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!item) return <div className="p-8 text-center">Item not found</div>;

  return (
    <>
      <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {item.brand} {item.model}
            </h1>
            <p className="text-gray-500 text-lg mt-1 dark:text-gray-400">
              {item.year} - {item.type}
            </p>
          </div>
{isOwner && (
            <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-800 animate-pulse-subtle">
              <User className="w-3.5 h-3.5" />
              Your Listing
            </span>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Price:</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${item.price.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Condition:</span>
            <span className="capitalize dark:text-white">{item.condition}</span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Stock:</span>
            <span
              className={`${item.inStock ? "text-green-600 dark:text-green-400" : "text-red-500"} font-medium`}
            >
              {item.inStock ? `In Stock (${item.quantity} available)` : "Out of Stock"}
            </span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Engine:</span>
            <span className="dark:text-white">{item.engineCapacity}cc</span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Color:</span>
            <span className="capitalize dark:text-white">{item.color}</span>
          </div>

          {item.features && item.features.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2 dark:text-gray-300">Features:</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {item.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          {isOwner && (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-red-600 dark:text-red-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
          <button
            onClick={handleWishlistToggle}
            className={`cursor-pointer px-6 py-3 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isInWishlist
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-500 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
        </div>
      </div>
    </div>

    {item && (
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={`${item.brand} ${item.model}`}
      />
    )}
  </>
);
}
