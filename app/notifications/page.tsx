"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
        <Bell className="w-10 h-10 text-gray-300 dark:text-gray-700" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">No notifications yet</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
        We'll notify you when there's an update to your inventory or wishlist.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
      >
        Go Home
      </Link>
    </div>
  );
}

interface NotificationItemProps {
  notification: any;
  onRead: (id: string) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const handleClick = useCallback(() => onRead(notification.id), [notification.id, onRead]);

  const containerClasses = useMemo(
    () =>
      `relative p-4 rounded-2xl border transition-all cursor-pointer ${
        !notification.isRead
          ? "bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900 shadow-sm ring-1 ring-blue-50 dark:ring-blue-900/20"
          : "bg-gray-50/50 dark:bg-gray-900/40 border-transparent dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
      }`,
    [notification.isRead],
  );

  const titleClasses = useMemo(
    () =>
      `text-sm ${
        !notification.isRead
          ? "font-bold text-gray-900 dark:text-white"
          : "font-semibold text-gray-700 dark:text-gray-300"
      }`,
    [notification.isRead],
  );

  const formattedTime = useMemo(() => formatTime(notification.createdAt), [notification.createdAt]);

  return (
    <div key={notification.id} onClick={handleClick} className={containerClasses}>
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1.25 bg-blue-600 rounded-l-2xl" />
      )}

      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className={titleClasses}>{notification.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {notification.message}
          </p>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-3 uppercase tracking-wider">
            {formattedTime}
          </p>
        </div>

        {!notification.isRead ? (
          <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
        ) : (
          <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
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
