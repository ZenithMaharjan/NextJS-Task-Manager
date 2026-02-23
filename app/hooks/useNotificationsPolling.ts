"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import apiService from "@/services/api";
import { RootState } from "@/store";
import { setNotifications } from "@/store/slices/notificationsSlice";

export const useNotificationsPolling = (intervalMs: number = 20000) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await apiService.getNotifications();
      if (data.success) {
        dispatch(
          setNotifications({
            items: data.results,
            unreadCount: data.unreadCount,
          }),
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, intervalMs);

    return () => clearInterval(intervalId);
  }, [fetchNotifications, intervalMs, isAuthenticated]);

  return { fetchNotifications };
};
