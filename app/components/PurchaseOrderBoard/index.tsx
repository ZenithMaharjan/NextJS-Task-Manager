"use client";

import clsx from "clsx";
import { Search, Package, Calendar, User, ChevronRight, ShoppingCart, Tag } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

type PurchaseStatus = "initiated" | "confirmed" | "delivering" | "completed" | "cancelled";

interface PurchaseOrder {
  id: string;
  inventoryId: string;
  userId: string;
  customerName: string;
  itemTitle: string;
  quantityPurchased: number;
  totalPrice: number;
  status: PurchaseStatus;
  createdAt: string;
}

const MOCK_ORDERS: PurchaseOrder[] = [
  {
    id: "65f1a2b3c4d5e6f7a8b9c0d1",
    inventoryId: "INV-001",
    userId: "USER-123",
    customerName: "John Doe",
    itemTitle: "Ducati Panigale V4 S",
    quantityPurchased: 1,
    totalPrice: 28500.0,
    status: "completed",
    createdAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c0d2",
    inventoryId: "INV-002",
    userId: "USER-456",
    customerName: "Sarah Smith",
    itemTitle: "BMW S1000RR",
    quantityPurchased: 2,
    totalPrice: 42000.0,
    status: "confirmed",
    createdAt: "2024-03-05T14:30:00Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c0d3",
    inventoryId: "INV-003",
    userId: "USER-123",
    customerName: "John Doe",
    itemTitle: "Yamaha YZF-R1M",
    quantityPurchased: 1,
    totalPrice: 26900.0,
    status: "initiated",
    createdAt: "2024-03-08T09:15:00Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c0d4",
    inventoryId: "INV-004",
    userId: "USER-789",
    customerName: "Mike Johnson",
    itemTitle: "Kawasaki Ninja H2R",
    quantityPurchased: 1,
    totalPrice: 55000.0,
    status: "delivering",
    createdAt: "2024-03-09T16:45:00Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c0d5",
    inventoryId: "INV-005",
    userId: "USER-456",
    customerName: "Sarah Smith",
    itemTitle: "Honda CBR1000RR-R",
    quantityPurchased: 1,
    totalPrice: 24500.0,
    status: "cancelled",
    createdAt: "2024-03-02T11:20:00Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c0d6",
    inventoryId: "INV-006",
    userId: "USER-999",
    customerName: "Alice Wong",
    itemTitle: "KTM 1290 Super Duke R",
    quantityPurchased: 3,
    totalPrice: 58500.0,
    status: "confirmed",
    createdAt: "2024-03-07T13:10:00Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c0d7",
    inventoryId: "INV-007",
    userId: "USER-123",
    customerName: "John Doe",
    itemTitle: "Aprilia RSV4 Factory",
    quantityPurchased: 1,
    totalPrice: 25999.0,
    status: "completed",
    createdAt: "2024-02-28T08:50:00Z",
  },
];

const statusStyles: Record<PurchaseStatus, string> = {
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

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const PRICE_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
};

function matchesSearchQuery(order: PurchaseOrder, query: string): boolean {
  return (
    order.id.toLowerCase().includes(query) ||
    order.itemTitle.toLowerCase().includes(query) ||
    order.customerName.toLowerCase().includes(query) ||
    order.status.toLowerCase().includes(query)
  );
}

function formatOrderDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, DATE_FORMAT_OPTIONS);
}

function formatOrderPrice(price: number): string {
  return price.toLocaleString(undefined, PRICE_FORMAT_OPTIONS);
}

const PurchaseOrderBoard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"buyer" | "seller">("buyer");

  const handleSearchQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleBuyerViewSelect = useCallback(() => {
    setView("buyer");
  }, []);

  const handleSellerViewSelect = useCallback(() => {
    setView("seller");
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return MOCK_ORDERS.filter(order => matchesSearchQuery(order, normalizedQuery));
  }, [searchQuery]);

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
                "px-6 py-2 rounded-xl text-sm font-black transition-all duration-300",
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
                "px-6 py-2 rounded-xl text-sm font-black transition-all duration-300",
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
        <div className="overflow-x-auto rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900/40 backdrop-blur-md custom-scrollbar">
          <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 opacity-60 lg:hidden"></div>

          <div className="min-w-[1000px] lg:min-w-0">
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
                    <tr
                      key={order.id}
                      className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-500 cursor-pointer"
                    >
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="font-black text-blue-600 dark:text-blue-400 text-xs tracking-wider">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-1 font-bold">
                            Full ID: {order.id.slice(0, 12)}...
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
                                Ref: {order.inventoryId}
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
                          <span className="text-sm font-black text-gray-500 dark:text-gray-400">
                            $
                          </span>
                          <span className="font-black text-gray-900 dark:text-white text-lg tracking-tight">
                            {formatOrderPrice(order.totalPrice)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span
                          className={clsx(
                            "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-all duration-500 shadow-sm",
                            statusStyles[order.status],
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
                        <div className="inline-flex p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-600 transition-all duration-500 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:border-blue-500">
                          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-white transition-colors" />
                        </div>
                      </td>
                    </tr>
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
      </div>
    </div>
  );
};

export default PurchaseOrderBoard;
