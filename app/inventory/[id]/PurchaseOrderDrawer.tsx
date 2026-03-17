"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import { X, ShoppingCart, Loader2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { Inventory, PurchaseRequest } from "@/types/inventory";

interface PurchaseOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: Inventory;
}

export default function PurchaseOrderDrawer({
  isOpen,
  onClose,
  inventoryItem,
}: PurchaseOrderDrawerProps) {
  const { showToast } = useToast();
  const [quantityToPurchase, setQuantityToPurchase] = useState<number>(1);
  const [isSubmittingPurchaseOrder, setIsSubmittingPurchaseOrder] = useState<boolean>(false);

  const totalPrice = useMemo(() => {
    return quantityToPurchase * inventoryItem.price;
  }, [quantityToPurchase, inventoryItem.price]);

  const handleQuantityChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10);
      const validatedValue = isNaN(value)
        ? 1
        : Math.min(Math.max(1, value), inventoryItem.quantity);
      setQuantityToPurchase(validatedValue);
    },
    [inventoryItem.quantity],
  );

  const handleConfirmPurchase = useCallback(async () => {
    setIsSubmittingPurchaseOrder(true);
    try {
      const purchaseRequestPayload: PurchaseRequest = {
        inventoryId: inventoryItem.id,
        quantityPurchased: quantityToPurchase,
        totalPrice,
      };
      const purchaseResponse = await apiService.purchaseInventory(purchaseRequestPayload);
      if (purchaseResponse.success) {
        showToast("Purchase order placed successfully!", "success");
        onClose();
        setQuantityToPurchase(1);
      } else {
        showToast(purchaseResponse.message || "Failed to place purchase order", "error");
      }
    } catch (confirmError) {
      const errorMessage =
        confirmError instanceof Error
          ? confirmError.message
          : "An error occurred while processing your purchase";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmittingPurchaseOrder(false);
    }
  }, [inventoryItem.id, quantityToPurchase, totalPrice, showToast, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmittingPurchaseOrder) {
      onClose();
    }
  }, [isSubmittingPurchaseOrder, onClose]);

  const isOutOfStock = useMemo(() => {
    return inventoryItem.quantity <= 0 || !inventoryItem.inStock;
  }, [inventoryItem.quantity, inventoryItem.inStock]);

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        className:
          "w-full sm:w-[400px] !bg-white dark:!bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col shadow-2xl border-l border-gray-100 dark:border-gray-800",
        sx: { padding: 0 },
      }}
    >
      <Box className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-blue-600 dark:bg-blue-700">
        <Box className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-white" />
          <Typography variant="h6" className="font-black text-white leading-none">
            Confirm Purchase
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isSubmittingPurchaseOrder}
          className="text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </IconButton>
      </Box>

      <Box className="p-6 flex-1 overflow-y-auto space-y-6 !bg-white dark:!bg-gray-950">
        <Box className="bg-gray-50 dark:!bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <Typography className="text-[10px] text-blue-600 dark:text-blue-400 font-black tracking-[0.2em] uppercase block mb-3">
            Item Details
          </Typography>
          <Typography variant="h5" className="font-black text-gray-900 dark:text-white mb-3">
            {inventoryItem.brand} {inventoryItem.model}
          </Typography>
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                isOutOfStock
                  ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800",
              )}
            >
              STOCK: {inventoryItem.quantity}
            </span>
            <Typography className="text-gray-400 dark:text-gray-500 font-bold text-sm">
              ${inventoryItem.price.toLocaleString()} / unit
            </Typography>
          </div>
        </Box>

        {isOutOfStock ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-900/30">
              <ShoppingCart className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs">
              This item is currently out of stock
            </p>
          </div>
        ) : (
          <Box className="space-y-6">
            <div className="space-y-3">
              <label
                htmlFor="quantityToPurchase"
                className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.2em] block"
              >
                Quantity
              </label>
              <input
                id="quantityToPurchase"
                type="number"
                min="1"
                max={inventoryItem.quantity}
                required
                value={quantityToPurchase}
                onChange={handleQuantityChange}
                disabled={isSubmittingPurchaseOrder}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-lg"
              />
              {quantityToPurchase >= inventoryItem.quantity && (
                <Typography className="text-amber-500 dark:text-amber-400 font-black text-[10px] uppercase tracking-wider">
                  Maximum available stock reached
                </Typography>
              )}
            </div>

            <div className="space-y-3">
              <label
                htmlFor="totalPurchasePrice"
                className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.2em] block"
              >
                Total Price
              </label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-black text-xl">
                  $
                </span>
                <input
                  id="totalPurchasePrice"
                  type="text"
                  readOnly
                  value={totalPrice.toLocaleString()}
                  className="w-full pl-10 pr-5 py-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-green-600 dark:text-green-400 font-black text-2xl outline-none"
                />
              </div>
            </div>
          </Box>
        )}
      </Box>

      <Box className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 space-y-4">
        <button
          onClick={handleConfirmPurchase}
          disabled={isSubmittingPurchaseOrder || isOutOfStock}
          className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer uppercase tracking-widest"
        >
          {isSubmittingPurchaseOrder ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Confirm Purchase
            </>
          )}
        </button>
        <button
          onClick={handleClose}
          disabled={isSubmittingPurchaseOrder}
          className="w-full px-8 py-5 rounded-2xl bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 font-black text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] cursor-pointer uppercase tracking-widest"
        >
          Cancel
        </button>
      </Box>
    </Drawer>
  );
}
