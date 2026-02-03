"use client";

import React from "react";

import DashboardFilters from "./components/DashboardFilters";
import InventoryCharts from "./components/InventoryCharts";

import { useInventoryDashboard } from "@/hooks/useInventoryDashboard";

export default function DashboardPage() {
  const { processedData, loading, error, inStockOnly, setInStockOnly, sortBy, setSortBy } =
    useInventoryDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-vh-100 dark:bg-gray-900 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full dark:bg-gray-900">
      <div className="p-8 max-w-7xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Motorcycle Inventory Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Visualize and analyze stock levels, pricing, and specs.
            </p>
          </div>

          <DashboardFilters
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </header>

        <InventoryCharts processedData={processedData} />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-1">
              Please check if the backend API is running and the `.env.local` URL is correct.
            </p>
          </div>
        )}

        {processedData.length === 0 && !loading && !error && (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No data available for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
