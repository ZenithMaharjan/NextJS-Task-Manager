"use client";

import React, { useMemo } from "react";

const ORDER_ID_DISPLAY_LENGTH = 8;
const ORDER_ID_PREVIEW_LENGTH = 12;

interface OrderReferenceProps {
  orderId: string;
  variant?: "row" | "drawer";
}

const OrderReference: React.FC<OrderReferenceProps> = ({ orderId, variant = "row" }) => {
  const shortId = useMemo(() => orderId.slice(-ORDER_ID_DISPLAY_LENGTH).toUpperCase(), [orderId]);

  if (variant === "drawer") {
    return (
      <div className="space-y-1">
        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          PO REFERENCE
        </span>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">#{shortId}</h2>
        <p className="text-[10px] text-gray-400 font-bold truncate max-w-[200px]">
          Full ID: {orderId}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="font-black text-blue-600 dark:text-blue-400 text-xs tracking-wider">
        #{shortId}
      </span>
      <span className="text-[10px] text-gray-400 mt-1 font-bold">
        Full ID: {orderId.slice(0, ORDER_ID_PREVIEW_LENGTH)}...
      </span>
    </div>
  );
};

export default OrderReference;
