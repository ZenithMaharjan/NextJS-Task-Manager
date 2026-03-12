import { NextResponse } from "next/server";

import { createPurchase, confirmPurchase, cancelPurchase } from "./index";
import InventoryModel from "../../../models/Inventory";
import NotificationModel from "../../../models/Notification";
import { PurchaseModel } from "../../../models/Purchase";

import connectDB from "@/lib/mongodb";
import { extractUserFromHeader, extractUserIdFromHeader, JWTPayload } from "@/utils/jwt";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const { userId, username } =
      extractUserFromHeader(request.headers.get("Authorization")) || ({} as JWTPayload);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inventoryId, quantityPurchased, totalPrice } = body;

    if (!inventoryId || !quantityPurchased || !totalPrice) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const purchaseData = {
      inventoryId,
      userId,
      quantityPurchased,
      customerName: username || userId,
      totalPrice,
      status: "initiated",
    };

    const purchase = await createPurchase(purchaseData);
    return NextResponse.json({ success: true, purchase }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || String(err) },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const userId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 100);
    const view = url.searchParams.get("view") || "buyer";

    const expandInventory = url.searchParams.get("expand") === "inventory";

    const skip = (Math.max(page, 1) - 1) * limit;

    let filter: any;

    if (view === "seller") {
      const ownedInventories = await InventoryModel.find({ userId }, { _id: 1 }).lean();
      const inventoryIds = ownedInventories.map(inv => inv._id);
      filter = { inventoryId: { $in: inventoryIds } };
    } else if (view === "all") {
      const ownedInventories = await InventoryModel.find({ userId }, { _id: 1 }).lean();
      const inventoryIds = ownedInventories.map(inv => inv._id);
      filter = { $or: [{ userId }, { inventoryId: { $in: inventoryIds } }] };
    } else {
      filter = { userId };
    }

    let query = PurchaseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    if (expandInventory) {
      query = query.populate("inventoryId");
    }

    const [items, total] = await Promise.all([query.lean(), PurchaseModel.countDocuments(filter)]);

    return NextResponse.json({
      success: true,
      data: items,
      meta: { total, page, limit, view, expanded: expandInventory },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || String(err) },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const authUserId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!authUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { purchaseId, status } = body;
    if (!purchaseId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing purchaseId or status" },
        { status: 400 },
      );
    }
    // fetch purchase to authorize
    const purchase = await PurchaseModel.findById(purchaseId);
    if (!purchase)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (status === "confirmed") {
      // only inventory owner can confirm
      const inv = await InventoryModel.findById(purchase.inventoryId).lean();
      if (!inv)
        return NextResponse.json(
          { success: false, message: "Inventory not found" },
          { status: 404 },
        );
      if (String(inv.userId) !== String(authUserId))
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

      const res = await confirmPurchase(purchaseId);
      if (!res.success)
        return NextResponse.json({ success: false, message: res.message }, { status: 409 });
      return NextResponse.json({ success: true, data: res.purchase });
    }

    // other transitions (cancelled, delivering, completed) require purchaser identity
    if (String(purchase.userId) !== String(authUserId)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (status === "cancelled") {
      const res = await cancelPurchase(purchaseId);
      if (!res.success)
        return NextResponse.json({ success: false, message: res.message }, { status: 409 });
      return NextResponse.json({ success: true, data: res.purchase });
    }

    // other transitions: delivering, completed - update and notify both parties
    const updated = await PurchaseModel.findByIdAndUpdate(
      purchaseId,
      { status },
      { new: true },
    ).lean();
    if (!updated)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    try {
      // fetch inventory to get owner and display info
      const inv = await InventoryModel.findById(updated.inventoryId).lean();
      const titleBuyer = `Order ${status}: ${inv?.brand || "item"} ${inv?.model || ""}`;
      const msgBuyer = `Your order for ${inv?.brand || "item"} ${inv?.model || ""} is now '${status}'.`;

      const titleOwner = `Order ${status} for ${inv?.brand || "item"}`;
      const msgOwner = `Order by ${updated.customerName || "a customer"} is now '${status}'.`;

      await NotificationModel.create([
        {
          userId: String(updated.userId),
          type: "info",
          title: titleBuyer,
          message: msgBuyer,
          priority: "medium",
          inventoryId: updated.inventoryId,
        },
        {
          userId: String(inv?.userId),
          type: "info",
          title: titleOwner,
          message: msgOwner,
          priority: "medium",
          inventoryId: updated.inventoryId,
        },
      ]);
    } catch (notifyErr) {
      console.error("Failed to create status-change notifications:", notifyErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const authUserId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!authUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    const purchase = await PurchaseModel.findById(id).lean();
    if (!purchase)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (String(purchase.userId) !== String(authUserId)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const deleted = await PurchaseModel.findByIdAndDelete(id).lean();
    if (!deleted)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (deleted.inventoryId && deleted.quantityPurchased) {
      await InventoryModel.findByIdAndUpdate(deleted.inventoryId, {
        $inc: { quantity: deleted.quantityPurchased },
      });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || String(err) },
      { status: 500 },
    );
  }
}

export default null;
