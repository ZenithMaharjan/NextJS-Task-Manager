"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
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
  const [quantityPurchased, setQuantityPurchased] = useState<number>(1);
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState<boolean>(false);

  const totalPrice = useMemo(() => {
    return quantityPurchased * inventoryItem.price;
  }, [quantityPurchased, inventoryItem.price]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      const validatedValue = isNaN(value)
        ? 1
        : Math.min(Math.max(1, value), inventoryItem.quantity);
      setQuantityPurchased(validatedValue);
    },
    [inventoryItem.quantity],
  );

  const handleConfirmPurchase = useCallback(async () => {
    setIsSubmittingPurchase(true);
    try {
      const payload: PurchaseRequest = {
        inventoryId: inventoryItem.id,
        quantityPurchased,
        totalPrice,
      };
      const response = await apiService.purchaseInventory(payload);
      if (response.success) {
        showToast("Purchase order placed successfully!", "success");
        onClose();
        setQuantityPurchased(1);
      } else {
        showToast(response.message || "Failed to place purchase order", "error");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred while processing your purchase";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmittingPurchase(false);
    }
  }, [inventoryItem.id, quantityPurchased, totalPrice, showToast, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmittingPurchase) {
      onClose();
    }
  }, [isSubmittingPurchase, onClose]);

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
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "#2563eb",
          ".dark &": {
            backgroundColor: "#1d4ed8",
            borderColor: "#1e40af",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ShoppingCart className="w-5 h-5 text-white" />
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#ffffff" }}>
            Confirm Purchase
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isSubmittingPurchase}
          sx={{ color: "#ffffff", cursor: "pointer" }}
        >
          <X className="w-5 h-5" />
        </IconButton>
      </Box>

      <Box className="p-6 flex-1 overflow-y-auto space-y-6 !bg-white dark:!bg-gray-950">
        <Box className="bg-gray-50 dark:!bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Typography
            variant="caption"
            className="text-[10px] text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase block mb-2"
          >
            Item Details
          </Typography>
          <Typography variant="h5" className="font-black text-gray-900 dark:text-white mb-2">
            {inventoryItem.brand} {inventoryItem.model}
          </Typography>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
              STOCK: {inventoryItem.quantity}
            </span>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400 font-bold">
              ${inventoryItem.price.toLocaleString()} / unit
            </Typography>
          </div>
        </Box>
        <Box className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="quantityPurchased"
              className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest block"
            >
              Quantity
            </label>
            <input
              id="quantityPurchased"
              type="number"
              min="1"
              max={inventoryItem.quantity}
              required
              value={quantityPurchased}
              onChange={handleQuantityChange}
              disabled={isSubmittingPurchase}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
            />
            {quantityPurchased >= inventoryItem.quantity && (
              <Typography
                variant="caption"
                className="text-amber-500 dark:text-amber-400 font-bold"
              >
                Max stock reached ({inventoryItem.quantity} available)
              </Typography>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="totalPrice"
              className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest block"
            >
              Total Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">
                $
              </span>
              <input
                id="totalPrice"
                type="text"
                readOnly
                value={totalPrice.toLocaleString()}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-green-600 dark:text-green-400 font-black text-xl outline-none"
              />
            </div>
          </div>
        </Box>
      </Box>

      <Box className="p-6 border-t border-gray-100 dark:border-gray-800 !bg-white dark:!bg-gray-950 space-y-3">
        <button
          onClick={handleConfirmPurchase}
          disabled={isSubmittingPurchase}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
        >
          {isSubmittingPurchase ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Purchase"
          )}
        </button>
        <button
          onClick={handleClose}
          disabled={isSubmittingPurchase}
          className="w-full px-8 py-4 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] cursor-pointer"
        >
          Cancel
        </button>
      </Box>
    </Drawer>
  );
}
