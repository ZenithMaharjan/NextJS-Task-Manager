"use client";

import { Package } from "lucide-react";
import React from "react";

import PurchaseOrderBoard from "@/components/PurchaseOrderBoard";

export default function PurchaseOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">
              Management System
            </h2>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Purchase
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              Orders
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-2xl font-medium leading-relaxed">
            Track and manage your inventory procurement with our professional order tracking system.
          </p>
        </div>

        <PurchaseOrderBoard />
      </div>
    </div>
  );
}
