"use client";

import { useCallback, useState } from "react";
import API from "services/api";

const ExamplePage = () => {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleHealthCheck = useCallback(async () => {
    setChecking(true);
    try {
      const response = await API.health();
      setHealthStatus(typeof response === "string" ? response : JSON.stringify(response));
    } catch (error) {
      setHealthStatus("Error: Failed to fetch health status");
      console.error("Health Check Error:", error);
    } finally {
      setChecking(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="max-w-4xl mx-auto ">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            API Health Check
          </h1>
          <button
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 text-left w-full cursor-pointer disabled:opacity-50"
            onClick={handleHealthCheck}
            disabled={checking}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {checking ? "Checking..." : "Check Health"}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">→</span>
            </div>
          </button>

          {healthStatus && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                healthStatus.startsWith("Error")
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              <p className="text-sm font-medium">Status: {healthStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamplePage;
