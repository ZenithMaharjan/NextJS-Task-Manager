"use client";

import { Bell, Check, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

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

  const toggleDropdown = useCallback(() => setIsOpen(prevIsOpen => !prevIsOpen), []);

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
        className="relative p-2 rounded-full text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
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
        <div className="absolute right-[-40px] sm:right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-wider">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyDropdownState />
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {currentItems.map(notification => (
                  <DropdownNotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-tight">
                PAGE {currentPage} OF {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg transition-all ${
                    currentPage === 1
                      ? "text-gray-200 dark:text-gray-700 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm active:scale-95 cursor-pointer"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-1.5 rounded-lg transition-all ${
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-200 dark:text-gray-700 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm active:scale-95 cursor-pointer"
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

function EmptyDropdownState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-gray-300 dark:text-gray-700" />
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">No notifications yet</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        We&apos;ll let you know when something happens.
      </p>
    </div>
  );
}

interface DropdownNotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

function DropdownNotificationItem({ notification, onClick }: DropdownNotificationItemProps) {
  const handleClick = useCallback(() => onClick(notification.id), [notification.id, onClick]);

  const itemClasses = useMemo(
    () =>
      `group relative flex items-start gap-4 px-5 py-4 cursor-pointer transition-all duration-200 ${
        !notification.isRead
          ? "bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
      }`,
    [notification.isRead],
  );

  const titleClasses = useMemo(
    () =>
      `text-sm ${
        !notification.isRead
          ? "font-bold text-gray-900 dark:text-white"
          : "font-medium text-gray-700 dark:text-gray-300"
      }`,
    [notification.isRead],
  );

  const formattedTime = useMemo(() => formatTime(notification.createdAt), [notification.createdAt]);

  return (
    <div key={notification.id} onClick={handleClick} className={itemClasses}>
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={titleClasses}>{notification.title}</p>
          {notification.isRead && <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-tight">
          {formattedTime}
        </p>
      </div>
    </div>
  );
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
