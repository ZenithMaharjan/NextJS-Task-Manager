"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

import InventoryList from "@/components/InventoryList";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { Inventory } from "@/types/inventory";

export default function InventoryPage() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMyItems, setShowMyItems] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getInventory();

      if (response && response.results) {
        setItems(response.results);
      } else if (Array.isArray(response)) {
        setItems(response as Inventory[]);
      } else {
        setItems([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching inventory.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleDeleteItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const filteredItems = useMemo(() => {
    return showMyItems && currentUser
      ? items.filter(item => String(item.userId) === String(currentUser.id))
      : items;
  }, [items, showMyItems, currentUser]);

  const handleToggleMyItems = useCallback(() => {
    setShowMyItems(prev => !prev);
  }, []);

  const handleAddInventoryClick = useCallback(() => {
    router.push("/Inventory/add");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
              Motorcycle <span className="text-blue-600">Inventory</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
              Explore our premium selection of motorcycles.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {currentUser && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  My Inventory
                </span>

                <button
                  onClick={handleToggleMyItems}
                  className={`relative w-16 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                    showMyItems
                      ? "bg-gradient-to-r from-green-400 to-blue-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      showMyItems ? "translate-x-8" : ""
                    }`}
                  />
                </button>
              </div>
            )}

            {currentUser && (
              <button
                onClick={handleAddInventoryClick}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
              >
                + Add Inventory
              </button>
            )}
          </div>
        </div>

        <InventoryList
          items={filteredItems}
          loading={loading}
          error={error}
          onDelete={handleDeleteItem}
        />
      </div>
    </div>
  );
}
