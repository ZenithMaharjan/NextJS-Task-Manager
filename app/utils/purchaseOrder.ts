import { PurchaseOrder } from "@/types/purchase";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const PRICE_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
};

export const formatOrderDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, DATE_FORMAT_OPTIONS);
};

export const formatOrderPrice = (price: number): string => {
  return price.toLocaleString(undefined, PRICE_FORMAT_OPTIONS);
};

export const matchesSearchQuery = (order: PurchaseOrder, query: string): boolean => {
  const normalizedQuery = query.toLowerCase();
  const inventory = order.inventoryId;

  return (
    (order._id || "").toLowerCase().includes(normalizedQuery) ||
    (inventory?.brand || "").toLowerCase().includes(normalizedQuery) ||
    (inventory?.model || "").toLowerCase().includes(normalizedQuery) ||
    (order.customerName || "").toLowerCase().includes(normalizedQuery) ||
    (order.status || "").toLowerCase().includes(normalizedQuery)
  );
};
