"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Bell, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  inventoryId?: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

const ITEMS_PER_PAGE = 3;

export const NotificationDropdown = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  unreadCount,
}: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPages = useMemo(
    () => Math.ceil(notifications.length / ITEMS_PER_PAGE),
    [notifications.length],
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = useMemo(
    () => notifications.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [notifications, startIndex],
  );

  const toggleDropdown = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  const handleMarkAllAsRead = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMarkAllAsRead();
    },
    [onMarkAllAsRead],
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleNextPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    },
    [currentPage, totalPages],
  );

  const handlePrevPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    },
    [currentPage],
  );

  const handleNotificationClick = useCallback(
    (id: string) => {
      onMarkAsRead(id);
    },
    [onMarkAsRead],
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-1 ring-white shadow-sm animate-bounce-subtle">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full uppercase tracking-wider">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  We'll let you know when something happens.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {currentItems.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`group relative flex items-start gap-4 px-5 py-4 cursor-pointer transition-all duration-200 ${
                      !notification.isRead
                        ? "bg-blue-50/40 hover:bg-blue-50"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!notification.isRead && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${!notification.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                        >
                          {notification.title}
                        </p>
                        {notification.isRead && (
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-tight">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
              <span className="text-[11px] font-bold text-gray-400 tracking-tight">
                PAGE {currentPage} OF {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg transition-all ${
                    currentPage === 1
                      ? "text-gray-200 cursor-not-allowed"
                      : "text-gray-600 hover:bg-white hover:shadow-sm active:scale-95"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-1.5 rounded-lg transition-all ${
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-200 cursor-not-allowed"
                      : "text-gray-600 hover:bg-white hover:shadow-sm active:scale-95"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
