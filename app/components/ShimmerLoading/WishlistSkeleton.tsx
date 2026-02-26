import clsx from "clsx";
import React from "react";

import ShimmerLoading from "./ShimmerLoading";

interface WishlistSkeletonProps {
  className?: string;
  itemCount?: number;
}

const WishlistSkeleton: React.FC<WishlistSkeletonProps> = ({ className, itemCount = 8 }) => {
  return (
    <div className={clsx("min-h-screen w-full dark:bg-gray-900", className)}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="space-y-4">
          <ShimmerLoading className="h-10 w-64 rounded-lg" />
          <ShimmerLoading className="h-5 w-96 rounded" />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-2/3">
                  <ShimmerLoading className="h-6 w-full rounded" />
                  <ShimmerLoading className="h-4 w-3/4 rounded" />
                </div>
                <ShimmerLoading className="h-8 w-8 rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <ShimmerLoading className="h-3 w-16 rounded" />
                  <ShimmerLoading className="h-5 w-20 rounded" />
                </div>
                <div className="space-y-2">
                  <ShimmerLoading className="h-3 w-16 rounded" />
                  <ShimmerLoading className="h-5 w-20 rounded" />
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <ShimmerLoading className="h-6 w-24 rounded" />
                <ShimmerLoading className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistSkeleton;
