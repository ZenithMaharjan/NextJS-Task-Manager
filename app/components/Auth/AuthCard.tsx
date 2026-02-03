import React from "react";

import { STATUS_COLORS, StatusType } from "../../constants/auth";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  status?: { type: StatusType; message: string } | null;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children, status }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {children}
        {status && (
          <div
            className="text-sm text-center font-medium mt-4"
            aria-live="polite"
            style={{ color: STATUS_COLORS[status.type] }}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};
