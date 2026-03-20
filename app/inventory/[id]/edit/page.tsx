"use client";

import { User, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { InventoryEditSkeleton, Dropdown } from "@/components";
import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { setTempEdit } from "@/store/slices/inventorySlice";
import { Inventory, InventoryType } from "@/types/inventory";

const INVENTORY_TYPES: InventoryType[] = [
  "sport",
  "cruiser",
  "touring",
  "naked",
  "adventure",
  "scooter",
];

const CONDITION_OPTIONS = ["new", "used"];

const STOCK_OPTIONS = [
  { label: "In Stock", value: true },
  { label: "Out of Stock", value: false },
];

export default function InventoryEditPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const { showToast } = useToast();

  const [item, setItem] = useState<Inventory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editedData, setEditedData] = useState({
    brand: "",
    model: "",
    year: 0,
    price: 0,
    engineCapacity: 0,
    color: "",
    condition: "",
    type: "sport",
    inStock: false,
    quantity: 0,
    features: "",
  });

  const isOwner = useMemo(() => {
    return currentUser?.id === item?.userId;
  }, [currentUser, item?.userId]);

  const fetchItem = useCallback(
    async (itemId: string) => {
      try {
        const data = await apiService.getInventoryById(itemId);
        setItem(data);
        setEditedData({
          brand: data.brand,
          model: data.model,
          year: data.year,
          price: data.price,
          engineCapacity: data.engineCapacity,
          color: data.color,
          condition: data.condition,
          type: data.type,
          inStock: data.inStock,
          quantity: data.quantity,
          features: data.features.join(", "),
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          showToast(err.message, "error");
        } else {
          showToast("Failed to load inventory item", "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (!id) return;
    const itemId = Array.isArray(id) ? id[0] : id;
    fetchItem(itemId);
  }, [id, fetchItem]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target;
      setEditedData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
      }));
    },
    [],
  );

  const handleConditionSelect = useCallback((value: string) => {
    setEditedData(prev => ({ ...prev, condition: value }));
  }, []);

  const handleTypeSelect = useCallback((value: string) => {
    setEditedData(prev => ({ ...prev, type: value }));
  }, []);

  const handleInStockChange = useCallback((value: boolean) => {
    setEditedData(prev => ({ ...prev, inStock: value }));
  }, []);

  const handleSaveClick = useCallback(async () => {
    if (!id) return;
    const itemId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    try {
      const updatedData = {
        ...editedData,
        year: Number(editedData.year),
        price: Number(editedData.price),
        engineCapacity: Number(editedData.engineCapacity),
        quantity: Number(editedData.quantity),
        features: editedData.features
          .split(",")
          .map(f => f.trim())
          .filter(f => f !== ""),
      };

      dispatch(setTempEdit({ id: itemId, data: updatedData }));
      showToast("Changes saved successfully", "success");
      router.replace("/Inventory");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save changes", "error");
    } finally {
      setIsSaving(false);
    }
  }, [id, editedData, dispatch, router, showToast]);

  const handleCancelClick = useCallback(() => {
    router.push(`/Inventory/${id}`);
  }, [router, id]);

  const handleBackToListing = useCallback(() => {
    router.push(`/Inventory/${id}`);
  }, [router, id]);

  const conditionOptions = useMemo(
    () => CONDITION_OPTIONS.map(option => ({ label: option, value: option })),
    [],
  );

  const typeOptions = useMemo(
    () => INVENTORY_TYPES.map(option => ({ label: option, value: option })),
    [],
  );

  if (isLoading) {
    return <InventoryEditSkeleton />;
  }

  if (!item) return <div className="p-8 text-center dark:text-gray-300">Item not found</div>;

  if (!isOwner) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don&apos;t have permission to edit this listing.</p>
        <button
          onClick={handleBackToListing}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Listing
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <h1 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
              Edit Listing
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-4">
              <div className="flex flex-col gap-1.5">
                <span className="tracking-widest text-xs uppercase text-gray-400 font-bold">
                  Brand
                </span>
                <input
                  type="text"
                  name="brand"
                  value={editedData.brand}
                  onChange={handleInputChange}
                  placeholder="Brand"
                  className="text-2xl font-bold bg-transparent border-b border-blue-500 outline-none w-full text-gray-800 dark:text-white focus:ring-0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="tracking-widest text-xs uppercase text-gray-400 font-bold">
                  Model
                </span>
                <input
                  type="text"
                  name="model"
                  value={editedData.model}
                  onChange={handleInputChange}
                  placeholder="Model"
                  className="text-2xl font-bold bg-transparent border-b border-blue-500 outline-none w-full text-gray-800 dark:text-white focus:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="tracking-widest text-xs uppercase text-gray-400 font-bold">
                  Year
                </span>
                <input
                  type="number"
                  name="year"
                  value={editedData.year}
                  onChange={handleInputChange}
                  className="text-gray-600 dark:text-gray-300 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none w-full py-1 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="tracking-widest text-xs uppercase text-gray-400 font-bold">
                  Condition
                </span>
                <Dropdown
                  value={editedData.condition}
                  options={conditionOptions}
                  onSelect={handleConditionSelect}
                />
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="tracking-widest text-xs uppercase text-gray-400 font-bold">
                  Type
                </span>
                <Dropdown
                  value={editedData.type}
                  options={typeOptions}
                  onSelect={handleTypeSelect}
                  maxHeight="max-h-60"
                />
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 shrink-0">
            <User className="w-3.5 h-3.5" />
            Your Listing
          </span>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col gap-2 border-b border-gray-50 dark:border-gray-700 pb-4">
            <span className="tracking-widest text-xs uppercase text-gray-400 font-bold">Price</span>
            <div className="flex items-center justify-between w-full border-b-2 border-green-500 pb-1">
              <span className="text-2xl font-black text-green-600">$</span>
              <input
                type="number"
                name="price"
                value={editedData.price}
                onChange={handleInputChange}
                className="text-2xl font-black text-green-600 dark:text-green-400 bg-transparent outline-none w-full text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <p className="tracking-widest text-xs uppercase text-gray-400 font-bold md:col-span-1">
              Stock Management
            </p>
            <div className="hidden md:block" />

            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="tracking-widest text-[10px] uppercase text-gray-400 font-bold">
                Status
              </span>
              <Dropdown
                value={editedData.inStock}
                options={STOCK_OPTIONS}
                onSelect={handleInStockChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="tracking-widest text-[10px] uppercase text-gray-400 font-bold">
                Engine Displacement
              </span>
              <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 py-1">
                <input
                  type="number"
                  name="engineCapacity"
                  value={editedData.engineCapacity}
                  onChange={handleInputChange}
                  className="bg-transparent outline-none w-full text-sm font-bold dark:text-white"
                />
                <span className="text-sm font-bold text-gray-400">cc</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="tracking-widest text-[10px] uppercase text-gray-400 font-bold">
                Quantity
              </span>
              <input
                type="number"
                name="quantity"
                value={editedData.quantity}
                onChange={handleInputChange}
                placeholder="Qty"
                className="text-sm font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 outline-none dark:text-white w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="tracking-widest text-[10px] uppercase text-gray-400 font-bold">
                Color
              </span>
              <input
                type="text"
                name="color"
                value={editedData.color}
                onChange={handleInputChange}
                className="w-full text-sm font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 outline-none dark:text-white capitalize"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="tracking-widest text-xs uppercase text-gray-400 font-bold">Features</p>
            <textarea
              name="features"
              value={editedData.features}
              onChange={handleInputChange}
              className="w-full bg-gray-50 dark:bg-gray-100/5 border border-gray-100 dark:border-gray-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium dark:text-gray-300 transition-all resize-none"
              rows={4}
              placeholder="Tell us about the features (comma separated)..."
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50/80 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 flex justify-end items-center gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleCancelClick}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
