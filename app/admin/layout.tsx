"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/store";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!isAuthenticated || (currentUser && !currentUser.isAdmin)) {
      router.replace("/");
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || (currentUser && !currentUser.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
