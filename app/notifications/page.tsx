"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check, Trash2, ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { markAsRead, markAllRead, setNotifications } from "@/store/slices/notificationsSlice";
import apiService from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      dispatch(markAsRead(id));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, [dispatch]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      dispatch(markAllRead());
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  }, [dispatch]);

  const handleBack = useCallback(() => router.back(), [router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">No notifications yet</h2>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              We'll notify you when there's an update to your inventory or wishlist.
            </p>
            <Link
              href="/"
              className="mt-8 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Go Home
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                  !notification.isRead
                    ? "bg-white border-blue-100 shadow-sm ring-1 ring-blue-50"
                    : "bg-gray-50/50 border-transparent text-gray-600"
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.25 bg-blue-600 rounded-l-2xl" />
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3
                      className={`text-sm ${!notification.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}
                    >
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-wider">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.isRead ? (
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0 animate-pulse" />
                  ) : (
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
