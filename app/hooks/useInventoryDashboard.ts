import { useState, useEffect, useMemo } from "react";
import API from "services/api";
import { 
  InventoryItem, 
  InventoryResponse,
  processInventoryData, 
  ProcessedData 
} from "@/utils/inventory";

export const useInventoryDashboard = () => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("model");

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const result = await API.getInventory() as InventoryResponse;
        setData(result.results || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processedData = useMemo(() => {
    return processInventoryData(data, inStockOnly, sortBy);
  }, [data, inStockOnly, sortBy]);

  return {
    data,
    processedData,
    loading,
    error,
    inStockOnly,
    setInStockOnly,
    sortBy,
    setSortBy,
  };
};
