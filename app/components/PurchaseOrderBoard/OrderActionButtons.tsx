"use client";

import clsx from "clsx";
import React, { useCallback } from "react";

import { PurchaseOrder, PurchaseStatus } from "@/types/purchase";

interface OrderActionButtonsProps {
  order: PurchaseOrder;
  view: "buyer" | "seller";
  onUpdateStatus: (purchaseId: string, status: PurchaseStatus) => void;
  isUpdating: boolean;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  order,
  view,
  onUpdateStatus,
  isUpdating,
}) => {
  const handleCancelClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onUpdateStatus(order._id, "cancelled");
    },
    [order._id, onUpdateStatus],
  );

  const handleConfirmClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onUpdateStatus(order._id, "confirmed");
    },
    [order._id, onUpdateStatus],
  );

  const handleMarkDeliveringClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onUpdateStatus(order._id, "delivering");
    },
    [order._id, onUpdateStatus],
  );

  const handleMarkCompletedClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onUpdateStatus(order._id, "completed");
    },
    [order._id, onUpdateStatus],
  );

  if (view === "buyer") {
    return (
      <div className="flex items-center gap-2">
        {order.status === "initiated" && (
          <button
            onClick={handleCancelClick}
            disabled={isUpdating}
            className={clsx(
              "px-4 py-1.5 text-xs font-black text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-xl transition-all",
              isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            )}
          >
            Cancel Order
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {order.status === "initiated" && (
        <button
          onClick={handleConfirmClick}
          disabled={isUpdating}
          className={clsx(
            "px-4 py-1.5 text-xs font-black text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-xl transition-all",
            isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          Confirm Order
        </button>
      )}
      {order.status === "confirmed" && (
        <button
          onClick={handleMarkDeliveringClick}
          disabled={isUpdating}
          className={clsx(
            "px-4 py-1.5 text-xs font-black text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-xl transition-all",
            isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          Mark as Delivering
        </button>
      )}
      {order.status === "delivering" && (
        <button
          onClick={handleMarkCompletedClick}
          disabled={isUpdating}
          className={clsx(
            "px-4 py-1.5 text-xs font-black text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-xl transition-all",
            isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          Mark as Completed
        </button>
      )}
    </div>
  );
};

export default OrderActionButtons;
