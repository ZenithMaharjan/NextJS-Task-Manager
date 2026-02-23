"use client";

import React, { createContext, useState, useCallback, ReactNode } from "react";

import { ToastType } from "../components/Toast/Toast";
import { ToastContainer } from "../components/Toast/ToastContainer";

interface ToastRequest {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_TIMEOUT = 3000;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastRequest[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, TOAST_TIMEOUT);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
