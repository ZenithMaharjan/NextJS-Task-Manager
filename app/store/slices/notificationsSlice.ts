import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Notification } from "../../types/notification";

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{ items: Notification[]; unreadCount: number }>,
    ) => {
      state.items = action.payload.items;
      state.unreadCount = Number(action.payload.unreadCount) || 0;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: state => {
      state.items.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markAsRead, markAllRead } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
