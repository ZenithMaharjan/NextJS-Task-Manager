"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { X, FileText, Download, Package, User, Calendar, DollarSign, Bike } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import OrderReference from "./OrderReference";
import PurchaseOrderStepper from "./PurchaseOrderStepper";
import StatusBadge from "./StatusBadge";

import { PurchaseOrder } from "@/types/purchase";
import { exportPurchaseOrderPDF } from "@/utils/pdfExport";
import { formatOrderDate, formatOrderPrice } from "@/utils/purchaseOrder";

interface PurchaseOrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  view?: "buyer" | "seller";
}

export default function PurchaseOrderDetailDrawer({
  isOpen,
  onClose,
  order,
  view = "buyer",
}: PurchaseOrderDetailDrawerProps) {
  const router = useRouter();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleReferenceClick = useCallback(() => {
    router.push("/inventory");
  }, [router]);

  const handleExportPdf = useCallback(() => {
    if (!order) return;
    setIsExportingPdf(true);
    try {
      exportPurchaseOrderPDF(order);
    } finally {
      setIsExportingPdf(false);
    }
  }, [order]);

  if (!order) return null;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        className:
          "w-full sm:w-[450px] !bg-white dark:!bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col shadow-2xl",
        sx: { padding: 0 },
      }}
    >
      <Box className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-blue-600 dark:bg-blue-700">
        <Box className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-white" />
          <Typography variant="h6" className="font-black text-white leading-none">
            Order Details
          </Typography>
        </Box>
        <IconButton onClick={onClose} className="text-white hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </IconButton>
      </Box>

      <Box className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 !bg-white dark:!bg-gray-950 premium-scrollbar">
        <div className="flex justify-between items-start">
          <OrderReference
            orderId={order._id}
            variant="drawer"
            isOwner={view === "seller"}
            onClick={handleReferenceClick}
          />
          <StatusBadge status={order.status} />
        </div>

        <PurchaseOrderStepper currentStatus={order.status} />

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-600 text-white">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">
                Vehicle Details
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                {order.inventoryId?.brand} {order.inventoryId?.model}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                Year
              </span>
              <p className="font-black text-gray-900 dark:text-white">
                {order.inventoryId?.year || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                Condition
              </span>
              <p className="font-black text-gray-900 dark:text-white capitalize">
                {order.inventoryId?.condition || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                Engine
              </span>
              <p className="font-black text-gray-900 dark:text-white">
                {order.inventoryId?.engineCapacity
                  ? `${order.inventoryId.engineCapacity}cc`
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                Color
              </span>
              <p className="font-black text-gray-900 dark:text-white capitalize">
                {order.inventoryId?.color || "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6 px-2">
          <div className="flex items-center gap-4">
            <User className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">
                Buyer Name
              </span>
              <p className="font-black text-gray-900 dark:text-white">{order.customerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">
                Order Date
              </span>
              <p className="font-black text-gray-900 dark:text-white">
                {formatOrderDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Package className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">
                Quantity
              </span>
              <p className="font-black text-gray-900 dark:text-white">
                {order.quantityPurchased} Units
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">
                Total Amount
              </span>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">
                ${formatOrderPrice(order.totalPrice)}
              </p>
            </div>
          </div>
        </div>
      </Box>

      <Box className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 space-y-4">
        {order.status === "completed" && (
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-3xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-sm shadow-xl shadow-gray-500/10 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            {isExportingPdf ? "Generating PDF..." : "Export as PDF"}
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full px-8 py-5 rounded-3xl bg-white dark:bg-gray-900 text-gray-500 font-black text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] cursor-pointer uppercase tracking-widest"
        >
          Close Detail
        </button>
      </Box>
    </Drawer>
  );
}
