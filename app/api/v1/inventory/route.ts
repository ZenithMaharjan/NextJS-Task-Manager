import { NextResponse } from "next/server";

import connectDB from "../../../lib/mongodb";
import InventoryModel from "../../../models/Inventory";

import { extractUserIdFromHeader } from "@/utils/jwt";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const brand = searchParams.get("brand");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStockOnly = searchParams.get("inStockOnly");
    const condition = searchParams.get("condition");

    // Build query filter
    const filter: Record<string, unknown> = {};

    if (brand) {
      filter.brand = new RegExp(brand, "i"); // Case-insensitive search
    }

    if (type) {
      filter.type = type;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        (filter.price as Record<string, number>).$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (filter.price as Record<string, number>).$lte = parseFloat(maxPrice);
      }
    }

    if (inStockOnly === "true") {
      filter.inStock = true;
    }

    if (condition) {
      filter.condition = condition;
    }

    const inventories = await InventoryModel.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        count: inventories.length,
        results: inventories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching bike inventories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bike inventories",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const userId = extractUserIdFromHeader(request.headers.get("Authorization"));

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventoryBody = {
      ...body,
      userId,
    };

    const inventory = await InventoryModel.create(inventoryBody);

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();

    // Add safety confirmation
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get("confirm");

    if (confirm !== "yes") {
      return NextResponse.json(
        {
          success: false,
          error: "Confirmation required. Add ?confirm=yes to the URL to proceed.",
        },
        { status: 400 },
      );
    }

    // Delete all inventories
    const result = await InventoryModel.deleteMany({});

    return NextResponse.json(
      {
        success: true,
        message: "All inventory items removed successfully",
        deletedCount: result.deletedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing inventory items:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove inventory items",
      },
      { status: 500 },
    );
  }
}
