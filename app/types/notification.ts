export type NotificationType =
  | "low_stock"
  | "price_change"
  | "wishlist_update"
  | "inventory_added"
  | "inventory_deleted"
  | "system"
  | "info";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  inventoryId?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  count: number;
  unreadCount: number;
  results: Notification[];
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  inventoryId?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}
