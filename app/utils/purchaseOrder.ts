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
  return (
    (order._id || "").toLowerCase().includes(query) ||
    (order.itemTitle || "").toLowerCase().includes(query) ||
    (order.customerName || "").toLowerCase().includes(query) ||
    (order.status || "").toLowerCase().includes(query)
  );
};
