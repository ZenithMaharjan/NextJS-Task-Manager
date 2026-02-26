import clsx from "clsx";
import React from "react";

interface ShimmerLoadingProps {
  className?: string;
  style?: React.CSSProperties;
}

const ShimmerLoading: React.FC<ShimmerLoadingProps> = ({ className, style }) => {
  return (
    <div
      className={clsx("relative overflow-hidden bg-gray-200 dark:bg-gray-800", className)}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent" />
    </div>
  );
};

export default ShimmerLoading;
