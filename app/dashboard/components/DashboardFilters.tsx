import React from "react";
import CheckboxInput from "@/components/Input/CheckboxInput";
import SelectInput from "@/components/Form/SelectInput";
import { SORT_OPTIONS } from "@/utils/inventory";

interface DashboardFiltersProps {
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  inStockOnly,
  setInStockOnly,
  sortBy,
  setSortBy,
}) => {
  const handleStockChange = React.useCallback(
    (target: { checked: boolean }) => setInStockOnly(target.checked),
    [setInStockOnly],
  );

  const handleSortChange = React.useCallback(
    (e: { value: string }) => setSortBy(e.value),
    [setSortBy],
  );

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full md:w-auto">
      <CheckboxInput
        label="In Stock Only"
        checked={inStockOnly}
        onChange={handleStockChange}
        size="20px"
      />
      <SelectInput
        label="Sort By"
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={handleSortChange}
        className="w-full sm:w-64"
      />
    </div>
  );
};

export default DashboardFilters;
