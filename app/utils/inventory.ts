import { Inventory, InventoryResponse, ProcessedInventoryData } from "../types/inventory";

export type { Inventory as InventoryItem, InventoryResponse, ProcessedInventoryData as ProcessedData };

export const processInventoryData = (
  data: Inventory[],
  inStockOnly: boolean,
  sortBy: string
): ProcessedInventoryData[] => {
  const filtered = inStockOnly ? data.filter((item) => item.inStock) : data;

  const groups: Record<string, { brand: string; items: Inventory[] }> = {};
  filtered.forEach((item) => {
    if (!groups[item.model]) {
      groups[item.model] = { brand: item.brand, items: [] };
    }
    groups[item.model].items.push(item);
  });

  let result: ProcessedInventoryData[] = Object.entries(groups).map(([model, group]) => {
    const items = group.items;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const avgPrice =
      items.reduce((sum, item) => sum + item.price, 0) / items.length;
    const avgEngineCapacity =
      items.reduce((sum, item) => sum + item.engineCapacity, 0) / items.length;

    return {
      model,
      brand: group.brand,
      avgPrice: Math.round(avgPrice),
      totalQuantity,
      avgEngineCapacity: Math.round(avgEngineCapacity),
    };
  });

  result.sort((a, b) => {
    if (sortBy === "price") return b.avgPrice - a.avgPrice;
    if (sortBy === "quantity") return b.totalQuantity - a.totalQuantity;
    if (sortBy === "capacity") return b.avgEngineCapacity - a.avgEngineCapacity;
    return a.model.localeCompare(b.model);
  });

  return result;
};

export const SORT_OPTIONS = [
  { label: "Model Name", value: "model" },
  { label: "Aggregate Price (High to Low)", value: "price" },
  { label: "Total Quantity (High to Low)", value: "quantity" },
  { label: "Engine Capacity (High to Low)", value: "capacity" },
];
