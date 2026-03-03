"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { InventoryType } from "@/types/inventory";

const INVENTORY_TYPES: InventoryType[] = [
  "sport",
  "cruiser",
  "touring",
  "naked",
  "adventure",
  "scooter",
];

export default function InventoryAddPage() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    engineCapacity: 0,
    color: "",
    condition: "new",
    type: "sport",
    inStock: true,
    quantity: 1,
    features: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  const handleInStockChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, inStock: e.target.value === "true" }));
  }, []);

  const handleSaveClick = useCallback(async () => {
    if (!formData.brand || !formData.model) {
      showToast("Brand and Model are required.", "error");
      return;
    }
    if (
      formData.price <= 0 ||
      formData.engineCapacity <= 0 ||
      formData.quantity < 0 ||
      formData.year <= 1900
    ) {
      showToast(
        "Please enter valid numeric values for price, engine capacity, quantity, and year.",
        "error",
      );
      return;
    }

    setIsSaving(true);
    try {
      const newInventoryData = {
        ...formData,
        year: Number(formData.year),
        price: Number(formData.price),
        engineCapacity: Number(formData.engineCapacity),
        quantity: Number(formData.quantity),
        features: formData.features
          ? formData.features
              .split(",")
              .map(f => f.trim())
              .filter(f => f !== "")
          : [],
      };

      await apiService.createInventory(newInventoryData);
      showToast("Inventory created successfully", "success");
      router.push("/Inventory");
    } catch (err: any) {
      showToast(err?.message || "Failed to create inventory item", "error");
    } finally {
      setIsSaving(false);
    }
  }, [formData, router, showToast]);

  const handleCancelClick = useCallback(() => {
    router.push("/Inventory");
  }, [router]);

  useEffect(() => {
    if (!currentUser) {
      showToast("You need to be logged in to add inventory.", "error");
      router.push("/Login");
    }
  }, [currentUser, router, showToast]);

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div className="flex-1 space-y-4">
            <h1 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex flex-col gap-2">
              Add New Listing
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Brand *</span>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g. Yamaha"
                  className="text-2xl font-bold bg-transparent border-b border-blue-500 outline-none w-full text-gray-800 dark:text-white focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>
              <div className="flex-[2] flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Model *</span>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g. YZF-R1"
                  className="text-2xl font-bold bg-transparent border-b border-blue-500 outline-none w-full text-gray-800 dark:text-white focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-6 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Year *</span>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="text-gray-600 dark:text-gray-300 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none w-24 py-1 font-medium"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Condition</span>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="text-gray-600 dark:text-gray-300 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none py-1 cursor-pointer font-medium"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Type</span>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="text-gray-600 dark:text-gray-300 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none py-1 cursor-pointer font-medium capitalize"
                >
                  {INVENTORY_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 pb-4">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Price *
            </span>
            <div className="flex items-center gap-1 border-b-2 border-green-500 pb-1">
              <span className="text-2xl font-black text-green-600">$</span>
              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="text-2xl font-black text-green-600 dark:text-green-400 bg-transparent outline-none w-40 text-right placeholder:text-green-200 dark:placeholder:text-green-900"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
              Stock & Engine
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Status</span>
                <select
                  name="inStock"
                  value={formData.inStock.toString()}
                  onChange={handleInStockChange}
                  className="text-sm font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 outline-none dark:bg-gray-800 dark:text-white cursor-pointer w-full"
                >
                  <option value="true" className="dark:bg-gray-800 dark:text-white">
                    In Stock
                  </option>
                  <option value="false" className="dark:bg-gray-800 dark:text-white">
                    Out of Stock
                  </option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Quantity *</span>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Qty"
                  className="text-sm font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 outline-none dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Engine Displacement *
                </span>
                <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 py-1">
                  <input
                    type="number"
                    name="engineCapacity"
                    min="0"
                    value={formData.engineCapacity}
                    onChange={handleInputChange}
                    className="bg-transparent outline-none w-full text-sm font-bold dark:text-white"
                    placeholder="e.g. 1000"
                  />
                  <span className="text-sm font-bold text-gray-400">cc</span>
                </div>
              </div>

              {/* Color */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Color</span>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g. Blue"
                  className="w-full text-sm font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 outline-none dark:text-white capitalize placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                Features
              </p>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-100/5 border border-gray-100 dark:border-gray-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium dark:text-gray-300 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                rows={4}
                placeholder="Tell us about the features (comma separated)... e.g. ABS, Traction Control, Quickshifter"
              />
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50/80 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 flex justify-end items-center gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleCancelClick}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
