import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { ProcessedData } from "@/utils/inventory";

interface InventoryChartsProps {
  processedData: ProcessedData[];
}

const MIN_CHART_WIDTH = 500;

const PRICE_CHART_COLOR = "#6366f1";
const QUANTITY_CHART_COLOR = "#10b981";
const ENGINE_CHART_COLOR = "#8b5cf6";
const TOOLTIP_BG_COLOR = "#1f2937";
const TOOLTIP_TEXT_COLOR = "#fff";
const PRICE_TOOLTIP_ITEM_COLOR = "#818cf8";
const QUANTITY_TOOLTIP_ITEM_COLOR = "#34d399";
const ENGINE_TOOLTIP_ITEM_COLOR = "#a78bfa";

const InventoryCharts: React.FC<InventoryChartsProps> = ({ processedData }) => {
  const dynamicMinWidth = Math.max(MIN_CHART_WIDTH, processedData.length * 35);

  return (
    <main className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
          Aggregate Price per Model ($)
        </h2>
        <div className="h-87.5 overflow-x-auto overflow-y-hidden premium-scrollbar">
          <div style={{ minWidth: dynamicMinWidth }} className="h-full will-change-transform">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  fontSize={12}
                  tick={{ fill: "currentColor" }}
                />
                <YAxis fontSize={12} tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: TOOLTIP_BG_COLOR,
                    border: "none",
                    borderRadius: "8px",
                    color: TOOLTIP_TEXT_COLOR,
                  }}
                  itemStyle={{ color: PRICE_TOOLTIP_ITEM_COLOR }}
                />
                <Bar dataKey="avgPrice" name="Avg Price" isAnimationActive={false}>
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-price-${index}`} fill={PRICE_CHART_COLOR} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
          Total Quantity per Model
        </h2>
        <div className="h-87.5 overflow-x-auto overflow-y-hidden premium-scrollbar">
          <div style={{ minWidth: dynamicMinWidth }} className="h-full will-change-transform">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  fontSize={12}
                  tick={{ fill: "currentColor" }}
                />
                <YAxis fontSize={12} tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: TOOLTIP_BG_COLOR,
                    border: "none",
                    borderRadius: "8px",
                    color: TOOLTIP_TEXT_COLOR,
                  }}
                  itemStyle={{ color: QUANTITY_TOOLTIP_ITEM_COLOR }}
                />
                <Bar dataKey="totalQuantity" name="Total Quantity" isAnimationActive={false}>
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-qty-${index}`} fill={QUANTITY_CHART_COLOR} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 xl:col-span-2 overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
          Average Engine Capacity per Model (cc)
        </h2>
        <div className="h-87.5 overflow-x-auto overflow-y-hidden premium-scrollbar">
          <div style={{ minWidth: dynamicMinWidth }} className="h-full will-change-transform">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  fontSize={12}
                  tick={{ fill: "currentColor" }}
                />
                <YAxis fontSize={12} tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: TOOLTIP_BG_COLOR,
                    border: "none",
                    borderRadius: "8px",
                    color: TOOLTIP_TEXT_COLOR,
                  }}
                  itemStyle={{ color: ENGINE_TOOLTIP_ITEM_COLOR }}
                />
                <Bar dataKey="avgEngineCapacity" name="Avg CC" isAnimationActive={false}>
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-engine-${index}`} fill={ENGINE_CHART_COLOR} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
};

export default React.memo(InventoryCharts);
