"use client";

import React, { useEffect, useState, useCallback } from "react";
import apiService from "@/services/api";
import { Inventory } from "@/types/inventory";
import InventoryList from "@/components/InventoryList";

export default function InventoryPage() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getInventory();
      if (response && response.results) {
        setItems(response.results);
      } else if (Array.isArray(response)) {
        setItems(response as unknown as Inventory[]);
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
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
            Motorcycle <span className="text-blue-600">Inventory</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
            Explore our premium selection of motorcycles. Search, filter, and add your favorites to
            your wishlist.
          </p>
        </header>

        <InventoryList items={items} loading={loading} error={error} onDelete={handleDeleteItem} />
      </div>
    </div>
  );
}
