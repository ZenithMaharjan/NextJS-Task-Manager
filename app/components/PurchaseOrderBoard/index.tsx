"use client";

import clsx from "clsx";
import {
  Search,
  Package,
  Calendar,
  User,
  ChevronRight,
  ShoppingCart,
  Tag,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import OrderActionButtons from "./OrderActionButtons";

import apiService from "@/services/api";
import { PurchaseOrder, PurchaseStatus } from "@/types/purchase";
import { formatOrderDate, formatOrderPrice, matchesSearchQuery } from "@/utils/purchaseOrder";

const ORDER_ID_DISPLAY_LENGTH = 8;
const ORDER_ID_PREVIEW_LENGTH = 12;

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  initiated:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  confirmed:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  delivering:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  cancelled:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

interface PurchaseOrderRowProps {
  order: PurchaseOrder;
  view: "buyer" | "seller";
  onUpdateStatus: (purchaseId: string, status: PurchaseStatus) => void;
  isUpdating: boolean;
}

const PurchaseOrderRow: React.FC<PurchaseOrderRowProps> = React.memo(
  ({ order, view, onUpdateStatus, isUpdating }) => {
    const router = useRouter();

    const handleRowClick = useCallback(() => {
      if (!isUpdating) {
        router.push(`/Inventory/${order.inventoryId?._id}`);
      }
    }, [isUpdating, router, order.inventoryId?._id]);

    return (
      <tr
        onClick={handleRowClick}
        className={clsx(
          "group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-500",
          isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <td className="px-8 py-7">
          <div className="flex flex-col">
            <span className="font-black text-blue-600 dark:text-blue-400 text-xs tracking-wider">
              #{order._id.slice(-ORDER_ID_DISPLAY_LENGTH).toUpperCase()}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 font-bold">
              Full ID: {order._id.slice(0, ORDER_ID_PREVIEW_LENGTH)}...
            </span>
          </div>
        </td>
        <td className="px-8 py-7">
          <div className="flex items-center gap-4">
            {view === "buyer" ? (
              <div className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-colors">
                <Package className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-colors">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-black text-gray-900 dark:text-gray-100 text-sm tracking-tight leading-tight">
                {view === "buyer" ? order.itemTitle : order.customerName}
              </span>
              {view === "buyer" && (
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                  Ref: {order.inventoryId?._id}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-8 py-7">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-gray-700 dark:text-gray-300 text-xs">
            {order.quantityPurchased}
          </div>
        </td>
        <td className="px-8 py-7">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-gray-500 dark:text-gray-400">$</span>
            <span className="font-black text-gray-900 dark:text-white text-lg tracking-tight">
              {formatOrderPrice(order.totalPrice)}
            </span>
          </div>
        </td>
        <td className="px-8 py-7">
          <span
            className={clsx(
              "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-all duration-500 shadow-sm",
              STATUS_STYLES[order.status],
            )}
          >
            {order.status}
          </span>
        </td>
        <td className="px-8 py-7">
          <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 opacity-50" />
            <span className="text-[11px] font-black tracking-tight">
              {formatOrderDate(order.createdAt)}
            </span>
          </div>
        </td>
        <td className="px-8 py-7 text-right">
          <div className="flex items-center justify-end gap-3">
            <OrderActionButtons
              order={order}
              view={view}
              onUpdateStatus={onUpdateStatus}
              isUpdating={isUpdating}
            />
            <div className="inline-flex p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-600 transition-all duration-500 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:border-blue-500">
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-white transition-colors" />
            </div>
          </div>
        </td>
      </tr>
    );
  },
);

PurchaseOrderRow.displayName = "PurchaseOrderRow";

const PurchaseOrderBoard: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"buyer" | "seller">("buyer");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getPurchaseOrders(view);
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setError("Failed to fetch purchase orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleBuyerViewSelect = useCallback(() => {
    setView("buyer");
  }, []);

  const handleSellerViewSelect = useCallback(() => {
    setView("seller");
  }, []);

  const handleUpdateStatus = useCallback(
    async (purchaseId: string, status: PurchaseStatus) => {
      try {
        setUpdatingOrderId(purchaseId);
        const response = await apiService.patchPurchaseOrder(purchaseId, status);
        if (response.success) {
          fetchOrders();
        } else {
          setError(response.message || "Failed to update status");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [fetchOrders],
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return orders.filter(order => matchesSearchQuery(order, normalizedQuery));
  }, [orders, searchQuery]);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by ID, Item, Customer, or Status..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBuyerViewSelect}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer",
                view === "buyer"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              Purchaser View
            </button>
            <button
              onClick={handleSellerViewSelect}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer",
                view === "seller"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              Seller View
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">
              {filteredOrders.length} Results
            </span>
          </div>
        </div>
      </div>
      <div className="lg:hidden flex items-center justify-center gap-2 mb-4 animate-pulse">
        <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          ← Swipe to view more →
        </span>
        <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
      </div>

      <div className="relative group">
        {isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900/40 backdrop-blur-md">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-xs">
              Loading Orders...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900/40 backdrop-blur-md">
            <div className="p-6 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <ShoppingCart className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Error Loading Orders
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchOrders}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900/40 backdrop-blur-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 opacity-60 lg:hidden"></div>
            <div className="min-w-[1000px] lg:min-w-0 relative">
              {isLoading && orders.length > 0 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-[32px]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
                      PO Reference
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
                      {view === "buyer" ? "Inventory Item" : "Customer"}
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
                      Quantity
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
                      Total Amount
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
                      Status
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
                      Created At
                    </th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <PurchaseOrderRow
                        key={order._id}
                        order={order}
                        view={view}
                        onUpdateStatus={handleUpdateStatus}
                        isUpdating={updatingOrderId === order._id}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-inner">
                            <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                          </div>
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-black text-lg">
                              No Orders Found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                              Try adjusting your search or filters.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderBoard;
