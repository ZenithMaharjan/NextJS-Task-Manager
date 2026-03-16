import React, { useState, useEffect, useMemo } from "react";

import { Toast, ToastProps } from "./Toast";

interface ToastContainerProps {
  toasts: Omit<ToastProps, "onClose">[];
  removeToast: (id: string) => void;
}

const MOBILE_BREAKPOINT = 768;
const MAX_TOAST_COUNT_DESKTOP = 5;
const MAX_TOAST_COUNT_MOBILE = 3;

export const ToastContainer: React.FC<ToastContainerProps> = React.memo(
  ({ toasts, removeToast }) => {
    const [limit, setLimit] = useState(MAX_TOAST_COUNT_DESKTOP);

    useEffect(() => {
      const handleResize = () => {
        setLimit(
          window.innerWidth < MOBILE_BREAKPOINT ? MAX_TOAST_COUNT_MOBILE : MAX_TOAST_COUNT_DESKTOP,
        );
      };

      handleResize();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const visibleToasts = useMemo(() => toasts.slice(-limit).reverse(), [toasts, limit]);

    return (
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {visibleToasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    );
  },
);

ToastContainer.displayName = "ToastContainer";
