import mongoose from "mongoose";

import InventoryModel from "../../../models/Inventory";
import NotificationModel from "../../../models/Notification";
import { PurchaseModel } from "../../../models/Purchase";

export const createPurchase = async (purchaseData: any) => {
  const purchase = await PurchaseModel.create(purchaseData);
  return purchase;
};

export const confirmPurchase = async (purchaseId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await PurchaseModel.findById(purchaseId).session(session);
    if (!purchase) throw new Error("Purchase not found");
    if (purchase.status !== "initiated")
      throw new Error("Only initiated purchases can be confirmed");

    const qty = purchase.quantityPurchased;
    const inventoryId = purchase.inventoryId;

    const updatedInventory = await InventoryModel.findOneAndUpdate(
      { _id: inventoryId, quantity: { $gte: qty }, inStock: true },
      { $inc: { quantity: -qty } },
      { new: true, session },
    );

    if (!updatedInventory) throw new Error("Out of stock or insufficient quantity");

    if (updatedInventory.quantity === 0) {
      updatedInventory.inStock = false;
      await updatedInventory.save({ session });
    }

    purchase.status = "confirmed";
    await purchase.save({ session });
    // Create notifications for purchaser and inventory owner
    try {
      const ownerId = updatedInventory.userId;
      const titleBuyer = `Purchase confirmed: ${updatedInventory.brand} ${updatedInventory.model}`;
      const msgBuyer = `Your order for ${updatedInventory.brand} ${updatedInventory.model} (x${qty}) has been confirmed.`;

      const titleOwner = `Item sold: ${updatedInventory.brand} ${updatedInventory.model}`;
      const msgOwner = `${purchase.customerName} purchased ${updatedInventory.brand} ${updatedInventory.model} (x${qty}).`;

      await NotificationModel.create([
        {
          userId: String(purchase.userId),
          type: "info",
          title: titleBuyer,
          message: msgBuyer,
          priority: "medium",
          inventoryId: inventoryId,
        },
        {
          userId: String(ownerId),
          type: "info",
          title: titleOwner,
          message: msgOwner,
          priority: "high",
          inventoryId: inventoryId,
        },
      ]);
    } catch (notifyErr) {
      // don't fail the whole transaction for notification errors
      console.error("Failed to create notifications:", notifyErr);
    }
    await session.commitTransaction();
    return { success: true, purchase };
  } catch (error: any) {
    await session.abortTransaction();
    return { success: false, message: error.message };
  } finally {
    session.endSession();
  }
};

export const cancelPurchase = async (purchaseId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await PurchaseModel.findById(purchaseId).session(session);
    if (!purchase) throw new Error("Purchase not found");

    // If purchase was confirmed (inventory already decremented), restore quantity
    if (purchase.status === "confirmed") {
      const qty = purchase.quantityPurchased;
      await InventoryModel.findByIdAndUpdate(
        purchase.inventoryId,
        { $inc: { quantity: qty } },
        { session },
      );
    }

    purchase.status = "cancelled";
    await purchase.save({ session });
    // Notify purchaser and owner about cancellation
    try {
      const ownerInv = await InventoryModel.findById(purchase.inventoryId).lean();
      const ownerId = ownerInv?.userId;
      const titleBuyer = `Purchase cancelled: ${ownerInv?.brand || "item"}`;
      const msgBuyer = `Your order for ${ownerInv?.brand || "item"} has been cancelled.`;

      const titleOwner = `Purchase cancelled for ${ownerInv?.brand || "item"}`;
      const msgOwner = `${purchase.customerName || "A customer"}'s purchase was cancelled.`;

      await NotificationModel.create([
        {
          userId: String(purchase.userId),
          type: "info",
          title: titleBuyer,
          message: msgBuyer,
          priority: "medium",
          inventoryId: purchase.inventoryId,
        },
        {
          userId: String(ownerId),
          type: "info",
          title: titleOwner,
          message: msgOwner,
          priority: "medium",
          inventoryId: purchase.inventoryId,
        },
      ]);
    } catch (notifyErr) {
      console.error("Failed to create cancellation notifications:", notifyErr);
    }
    await session.commitTransaction();
    return { success: true, purchase };
  } catch (error: any) {
    await session.abortTransaction();
    return { success: false, message: error.message };
  } finally {
    session.endSession();
  }
};

export default null;
