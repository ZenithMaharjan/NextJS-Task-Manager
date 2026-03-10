import mongoose, { Schema } from "mongoose";

const purchaseSchema = new Schema(
  {
    inventoryId: { type: Schema.Types.ObjectId, ref: "Inventory", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    quantityPurchased: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["initiated", "confirmed", "delivering", "completed", "cancelled"],
      default: "initiated",
    },
  },
  { timestamps: true },
);

export const PurchaseModel = mongoose.model("Purchase", purchaseSchema);
