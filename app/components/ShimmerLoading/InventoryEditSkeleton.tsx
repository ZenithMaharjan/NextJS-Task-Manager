import clsx from "clsx";
import React from "react";

import ShimmerLoading from "./ShimmerLoading";

interface InventoryEditSkeletonProps {
  className?: string;
}

const InventoryEditSkeleton: React.FC<InventoryEditSkeletonProps> = ({ className }) => {
  return (
    <div className={clsx("container mx-auto p-6 max-w-2xl", className)}>
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div className="flex-1 space-y-6">
            <ShimmerLoading className="h-4 w-24 rounded" />

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1 space-y-2">
                <ShimmerLoading className="h-3 w-16 rounded" />
                <ShimmerLoading className="h-8 w-full rounded" />
              </div>
              <div className="flex-[2] space-y-2">
                <ShimmerLoading className="h-3 w-16 rounded" />
                <ShimmerLoading className="h-8 w-full rounded" />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="space-y-2">
                <ShimmerLoading className="h-3 w-12 rounded" />
                <ShimmerLoading className="h-6 w-24 rounded" />
              </div>
              <div className="space-y-2">
                <ShimmerLoading className="h-3 w-20 rounded" />
                <ShimmerLoading className="h-6 w-24 rounded" />
              </div>
            </div>
          </div>
          <ShimmerLoading className="h-8 w-24 rounded-full shrink-0" />
        </div>

        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 pb-4">
            <ShimmerLoading className="h-4 w-16 rounded" />
            <ShimmerLoading className="h-10 w-40 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ShimmerLoading className="h-4 w-32 rounded" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <ShimmerLoading className="h-3 w-16 rounded" />
                  <ShimmerLoading className="h-6 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <ShimmerLoading className="h-3 w-20 rounded" />
                  <ShimmerLoading className="h-6 w-full rounded" />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-10">
              <div className="space-y-2">
                <ShimmerLoading className="h-3 w-32 rounded" />
                <ShimmerLoading className="h-6 w-full rounded" />
              </div>
              <div className="space-y-2">
                <ShimmerLoading className="h-3 w-16 rounded" />
                <ShimmerLoading className="h-6 w-full rounded" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <ShimmerLoading className="h-3 w-20 rounded" />
            <ShimmerLoading className="h-32 w-full rounded-xl" />
          </div>
        </div>

        <div className="p-6 bg-gray-50/80 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 flex justify-end items-center gap-4">
          <ShimmerLoading className="h-10 w-36 rounded-xl" />
          <ShimmerLoading className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default InventoryEditSkeleton;
