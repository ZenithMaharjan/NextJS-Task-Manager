import clsx from "clsx";
import React from "react";

import ShimmerLoading from "./ShimmerLoading";

interface DashboardSkeletonProps {
  className?: string;
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ className }) => {
  return (
    <div className={clsx("min-h-screen w-full dark:bg-gray-900", className)}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-3 w-full max-w-sm">
            <ShimmerLoading className="h-10 w-3/4 rounded-lg" />
            <ShimmerLoading className="h-5 w-5/6 rounded" />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <ShimmerLoading className="h-10 w-32 rounded-lg" />
            <ShimmerLoading className="h-10 w-32 rounded-lg" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ShimmerLoading className="h-64 rounded-xl" />
          <ShimmerLoading className="h-64 rounded-xl" />
          <ShimmerLoading className="h-64 rounded-xl" />
        </div>

        <ShimmerLoading className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
