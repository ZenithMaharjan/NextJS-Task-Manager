import { Inventory } from "./inventory";

export type PurchaseStatus = "initiated" | "confirmed" | "delivering" | "completed" | "cancelled";

export interface PurchaseOrder {
  _id: string;
  inventoryId: Inventory;
  userId: string;
  customerName: string;
  quantityPurchased: number;
  totalPrice: number;
  status: PurchaseStatus;
  createdAt: string;
  inventory?: string;
}

export interface PurchaseOrderResponse {
  success: boolean;
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    view: string;
    expanded: boolean;
  };
}
