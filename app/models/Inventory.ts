import mongoose, { Schema, Model } from "mongoose";

import { Inventory } from "../types/inventory";

export interface InventoryDocument extends Omit<Inventory, "id" | "_id"> {
  _id: mongoose.Types.ObjectId;
}

const inventorySchema = new Schema<InventoryDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the far future"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["sport", "cruiser", "touring", "naked", "adventure", "scooter"],
    },
    engineCapacity: {
      type: Number,
      required: [true, "Engine capacity is required"],
      min: [0, "Engine capacity must be positive"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["new", "used"],
    },
    features: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
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

// Create indexes for better query performance
inventorySchema.index({ brand: 1, model: 1 });
inventorySchema.index({ type: 1 });
inventorySchema.index({ userId: 1, inStock: 1 });

const InventoryModel: Model<InventoryDocument> =
  mongoose.models.Inventory || mongoose.model<InventoryDocument>("Inventory", inventorySchema);

export default InventoryModel;
