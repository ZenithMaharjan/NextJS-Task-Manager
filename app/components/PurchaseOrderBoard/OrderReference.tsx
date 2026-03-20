"use client";

import clsx from "clsx";
import React, { useMemo, useCallback } from "react";

const ORDER_ID_DISPLAY_LENGTH = 8;
const ORDER_ID_PREVIEW_LENGTH = 12;

interface OrderReferenceProps {
  orderId: string;
  variant?: "row" | "drawer";
  isOwner?: boolean;
  onClick?: () => void;
}

const OrderReference: React.FC<OrderReferenceProps> = ({
  orderId,
  variant = "row",
  isOwner = false,
  onClick,
}) => {
  const shortId = useMemo(() => orderId.slice(-ORDER_ID_DISPLAY_LENGTH).toUpperCase(), [orderId]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isOwner && onClick) {
        e.stopPropagation();
        onClick();
      }
    },
    [isOwner, onClick],
  );

  const containerClasses = clsx(
    "flex flex-col rounded-lg transition-all duration-200",
    variant === "drawer" ? "space-y-1" : "",
    isOwner && "cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 p-1 -m-1",
  );

  if (variant === "drawer") {
    return (
      <div className={containerClasses} onClick={handleClick}>
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
    <div className={containerClasses} onClick={handleClick}>
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
