"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import BoardToolbar from "./BoardToolbar";
import PurchaseOrderDetailDrawer from "./PurchaseOrderDetailDrawer";
import PurchaseOrderRow from "./PurchaseOrderRow";

import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { setOrders, removeOrders, setFilterStatus } from "@/store/slices/purchaseSlice";
import { PurchaseOrder, PurchaseStatus } from "@/types/purchase";
import { matchesSearchQuery } from "@/utils/purchaseOrder";

const PurchaseOrderBoard: React.FC = () => {
  const dispatch = useDispatch();
  const { items: orders, filterStatus } = useSelector((state: RootState) => state.purchase);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"buyer" | "seller">("buyer");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<PurchaseOrder | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return orders.filter(order => {
      const matchesFilter = filterStatus === "All" || order.status === filterStatus;
      const matchesSearch = matchesSearchQuery(order, normalizedQuery);
      return matchesFilter && matchesSearch;
    });
  }, [orders, searchQuery, filterStatus]);

  const selectedInView = useMemo(() => {
    return selectedOrderIds.filter(id => filteredOrders.some(o => o._id === id));
  }, [selectedOrderIds, filteredOrders]);

  const isSelectionAuthorized = useMemo(() => {
    if (selectedInView.length === 0) return false;
    return selectedInView.every(id => {
      const order = orders.find(o => o._id === id);
      if (!order || !currentUser) return false;
      const isBuyer = order.userId === currentUser.id;
      const isOwner = order.inventoryId?.userId === currentUser.id;
      return isBuyer || isOwner;
    });
  }, [selectedInView, orders, currentUser]);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getPurchaseOrders(view);
      if (response.success) {
        dispatch(setOrders(response.data || []));
      } else {
        setError("Failed to fetch purchase orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [view, dispatch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setSelectedOrderIds([]);
  }, []);

  const handleViewSelect = useCallback((newView: "buyer" | "seller") => {
    setView(newView);
    setSelectedOrderIds([]);
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

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        const newlySelected = filteredOrders.map(o => o._id);
        setSelectedOrderIds(prev => Array.from(new Set([...prev, ...newlySelected])));
      } else {
        const filteredIds = filteredOrders.map(o => o._id);
        setSelectedOrderIds(prev => prev.filter(id => !filteredIds.includes(id)));
      }
    },
    [filteredOrders],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedOrderIds.length === 0) return;

    setIsDeleting(true);
    const successfullyDeleted: string[] = [];
    const failedDeletes: string[] = [];

    await Promise.all(
      selectedOrderIds.map(async id => {
        try {
          const res = await apiService.deletePurchaseOrder(id);
          if (res.success) {
            successfullyDeleted.push(id);
          } else {
            failedDeletes.push(id);
          }
        } catch (_err) {
          failedDeletes.push(id);
        }
      }),
    );

    if (successfullyDeleted.length > 0) {
      dispatch(removeOrders(successfullyDeleted));
      setSelectedOrderIds(prev => prev.filter(id => !successfullyDeleted.includes(id)));
    }

    if (failedDeletes.length > 0) {
      showToast(`Failed to delete ${failedDeletes.length} order(s)`, "error");
    } else {
      showToast("Successfully deleted selected order(s)", "success");
    }

    setIsDeleting(false);
  }, [selectedOrderIds, dispatch, showToast]);

  const handleFilterStatusChange = useCallback(
    (value: PurchaseStatus | "All") => {
      dispatch(setFilterStatus(value));
      setSelectedOrderIds([]);
    },
    [dispatch],
  );

  const handleOpenDetail = useCallback((order: PurchaseOrder) => {
    setSelectedDetailOrder(order);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailDrawerOpen(false);
  }, []);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <BoardToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchQueryChange}
        view={view}
        onViewChange={handleViewSelect}
        resultsCount={filteredOrders.length}
        filterStatus={filterStatus}
        onFilterStatusChange={handleFilterStatusChange}
        selectedInViewCount={selectedInView.length}
        isSelectionAuthorized={isSelectionAuthorized}
        isDeleting={isDeleting}
        onDeleteSelected={handleDeleteSelected}
      />

      <div className="relative group">
        {isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-100 gap-4 rounded-4xl border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900/40 backdrop-blur-md">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-xs">
              Loading Orders...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-100 gap-6 text-center rounded-4xl border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900/40 backdrop-blur-md">
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
          <div className="overflow-x-auto rounded-4xl border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900/40 backdrop-blur-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-linear-to-l from-white dark:from-gray-900 to-transparent z-10 opacity-60 lg:hidden"></div>
            <div className="min-w-250 lg:min-w-0 relative">
              {isLoading && orders.length > 0 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-4xl">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                    {view === "buyer" && (
                      <th className="pl-6 pr-2 py-6 w-6">
                        {filteredOrders.length > 0 && (
                          <input
                            type="checkbox"
                            checked={
                              filteredOrders.length > 0 &&
                              selectedInView.length === filteredOrders.length
                            }
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                      </th>
                    )}
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] whitespace-nowrap">
                      PO Reference
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] whitespace-nowrap">
                      {view === "buyer" ? "Inventory Item" : "Customer"}
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] whitespace-nowrap">
                      Quantity
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] whitespace-nowrap">
                      Total Amount
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] whitespace-nowrap">
                      Created At
                    </th>
                    <th className="px-8 py-6 whitespace-nowrap"></th>
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
                        isSelected={selectedOrderIds.includes(order._id)}
                        onToggleSelect={handleToggleSelect}
                        onViewDetail={handleOpenDetail}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={view === "buyer" ? 8 : 7} className="px-8 py-20 text-center">
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

      <PurchaseOrderDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetail}
        order={selectedDetailOrder}
      />
    </div>
  );
};

export default PurchaseOrderBoard;
