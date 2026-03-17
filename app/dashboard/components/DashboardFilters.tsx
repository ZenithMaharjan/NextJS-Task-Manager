import React, { useCallback, FC } from "react";

import SelectInput from "@/components/Form/SelectInput";
import CheckboxInput from "@/components/Input/CheckboxInput";
import { SORT_OPTIONS } from "@/utils/inventory";

interface DashboardFiltersProps {
  inStockOnly: boolean;
  onInStockToggle: (value: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const DashboardFilters: FC<DashboardFiltersProps> = ({
  inStockOnly,
  onInStockToggle,
  sortBy,
  onSortChange,
}) => {
  const handleStockChange = useCallback(
    (target: { checked: boolean }) => onInStockToggle(target.checked),
    [onInStockToggle],
  );

  const handleSortChange = useCallback(
    (e: { value: string }) => onSortChange(e.value),
    [onSortChange],
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
