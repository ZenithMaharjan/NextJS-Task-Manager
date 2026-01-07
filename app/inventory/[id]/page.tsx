"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import apiService from "@/services/api";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { RootState } from "@/store";
import { Inventory } from "@/types/inventory";

export default function InventoryItemPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const [item, setItem] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
        <div className="bg-gray-50 p-6 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800">
            {item.brand} {item.model}
          </h1>
          <p className="text-gray-500 text-lg mt-1">
            {item.year} - {item.type}
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700">Price:</span>
            <span className="text-2xl font-bold text-green-600">
              ${item.price.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700">Condition:</span>
            <span className="capitalize">{item.condition}</span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700">Stock:</span>
            <span
              className={`${item.inStock ? "text-green-600" : "text-red-500"} font-medium`}
            >
              {item.inStock ? `In Stock (${item.quantity} available)` : "Out of Stock"}
            </span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700">Engine:</span>
            <span>{item.engineCapacity}cc</span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700">Color:</span>
            <span className="capitalize">{item.color}</span>
          </div>

          {item.features && item.features.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Features:</h3>
              <ul className="list-disc list-inside text-gray-600">
                {item.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleWishlistToggle}
            className={`cursor-pointer px-6 py-3 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isInWishlist
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-500"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
