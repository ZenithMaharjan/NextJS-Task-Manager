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

const InventoryCharts: React.FC<InventoryChartsProps> = ({
  processedData,
}) => {
  if (!processedData || processedData.length === 0) return null;

  return (
    <main className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
          Aggregate Price per Model ($)
        </h2>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
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
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#818cf8" }}
              />
              <Bar dataKey="avgPrice" name="Avg Price">
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={"#6366f1"} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
          Total Quantity per Model
        </h2>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
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
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#34d399" }}
              />
              <Bar dataKey="totalQuantity" name="Total Quantity">
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={"#10b981"} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 xl:col-span-2">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
          Average Engine Capacity per Model (cc)
        </h2>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
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
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#a78bfa" }}
              />
              <Bar dataKey="avgEngineCapacity" name="Avg CC">
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={"#8b5cf6"} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
};

export default InventoryCharts;
