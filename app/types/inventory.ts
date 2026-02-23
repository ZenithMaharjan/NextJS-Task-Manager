export type InventoryType = "sport" | "cruiser" | "touring" | "naked" | "adventure" | "scooter";
export type InventoryCondition = "new" | "used";

export interface Inventory {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  type: InventoryType | string;
  engineCapacity: number;
  color: string;
  price: number;
  quantity: number;
  condition: InventoryCondition | string;
  features: string[];
  inStock: boolean;
}

export interface InventoryResponse {
  count: number;
  results: Inventory[];
}

export interface ProcessedInventoryData {
  model: string;
  brand: string;
  avgPrice: number;
  totalQuantity: number;
  avgEngineCapacity: number;
}
