"use client";

import clsx from "clsx";
import { Package, User, Calendar, ChevronRight } from "lucide-react";
import React, { useCallback } from "react";

import OrderActionButtons from "./OrderActionButtons";
import OrderReference from "./OrderReference";
import StatusBadge from "./StatusBadge";

import { PurchaseOrder, PurchaseStatus } from "@/types/purchase";
import { formatOrderDate, formatOrderPrice } from "@/utils/purchaseOrder";

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

interface PurchaseOrderRowProps {
  order: PurchaseOrder;
  view: "buyer" | "seller";
  onUpdateStatus: (purchaseId: string, status: PurchaseStatus) => void;
  isUpdating: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetail: (order: PurchaseOrder) => void;
}

const PurchaseOrderRow: React.FC<PurchaseOrderRowProps> = React.memo(
  ({ order, view, onUpdateStatus, isUpdating, isSelected, onToggleSelect, onViewDetail }) => {
    const handleRowClick = useCallback(() => {
      if (!isUpdating) {
        onViewDetail(order);
      }
    }, [isUpdating, order, onViewDetail]);

    const handleCheckboxChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onToggleSelect(order._id);
      },
      [order._id, onToggleSelect],
    );

    return (
      <tr
        onClick={handleRowClick}
        className={clsx(
          "group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-500",
          isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          isSelected && "bg-blue-50/50 dark:bg-blue-900/20",
        )}
      >
        {view === "buyer" && (
          <td className="pl-6 pr-2 py-7 w-6" onClick={stopPropagation}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </td>
        )}
        <td className="px-8 py-7">
          <OrderReference orderId={order._id} variant="row" />
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
                {view === "buyer"
                  ? `${order.inventoryId?.brand} ${order.inventoryId?.model}`
                  : order.customerName}
              </span>
              {view === "buyer" && (
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                  Ref: {(order.inventoryId as any)?._id || order.inventoryId?.id}
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
          <StatusBadge status={order.status} />
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
          <div className="flex items-center justify-end gap-3 whitespace-nowrap">
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

export default PurchaseOrderRow;
