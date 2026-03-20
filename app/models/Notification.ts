import mongoose, { Schema, Model } from "mongoose";

export type NotificationType =
  | "low_stock"
  | "price_change"
  | "wishlist_update"
  | "inventory_added"
  | "inventory_deleted"
  | "system"
  | "info";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface NotificationDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  inventoryId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "low_stock",
        "price_change",
        "wishlist_update",
        "inventory_added",
        "inventory_deleted",
        "system",
        "info",
      ],
      default: "info",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        if (ret._id) {
          ret._id = ret._id.toString();
        }

        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

// TTL index to auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const NotificationModel: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", notificationSchema);

export default NotificationModel;
