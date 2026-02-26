import clsx from "clsx";
import React from "react";

import ShimmerLoading from "./ShimmerLoading";

interface InventoryDetailSkeletonProps {
  className?: string;
}

const InventoryDetailSkeleton: React.FC<InventoryDetailSkeletonProps> = ({ className }) => {
  return (
    <div className={clsx("container mx-auto p-6 max-w-2xl", className)}>
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div className="flex-1 space-y-4">
            <ShimmerLoading className="h-10 w-3/4 rounded-lg" />
            <ShimmerLoading className="h-6 w-1/2 rounded" />
          </div>
          <ShimmerLoading className="h-8 w-24 rounded-full" />
        </div>

        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 pb-4">
            <ShimmerLoading className="h-4 w-16 rounded" />
            <ShimmerLoading className="h-10 w-32 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <ShimmerLoading className="h-3 w-20 rounded" />
                <ShimmerLoading className="h-6 w-32 rounded" />
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <ShimmerLoading className="h-3 w-24 rounded" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <ShimmerLoading key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50/80 dark:bg-black/20 backdrop-blur-sm border-t border-gray-50 dark:border-gray-700 flex justify-end items-center gap-4">
          <div className="flex gap-2">
            <ShimmerLoading className="h-10 w-32 rounded-xl" />
            <ShimmerLoading className="h-10 w-32 rounded-xl" />
          </div>
          <ShimmerLoading className="h-12 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailSkeleton;
