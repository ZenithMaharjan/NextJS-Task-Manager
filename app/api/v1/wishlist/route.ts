import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import UserModel from "../../../models/User";
import InventoryModel from "../../../models/Inventory";
import { verifyToken, extractTokenFromHeader } from "../../../utils/jwt";

/**
 * GET - Get user's wishlist
 */
export async function GET(request: Request) {
  try {
    await connectDB();

    // Extract and verify token
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    // Get user with populated wishlists
    const user = await UserModel.findById(payload.userId).populate("wishlists");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: user.wishlists.length,
        wishlists: user.wishlists,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch wishlist",
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Add item to wishlist
 */
export async function POST(request: Request) {
  try {
    await connectDB();

    // Extract and verify token
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    const { inventoryId } = await request.json();

    if (!inventoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Inventory ID is required",
        },
        { status: 400 },
      );
    }

    // Check if inventory item exists
    const inventory = await InventoryModel.findById(inventoryId);

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          error: "Inventory item not found",
        },
        { status: 404 },
      );
    }

    // Add to wishlist (using $addToSet to prevent duplicates)
    const user = await UserModel.findByIdAndUpdate(
      payload.userId,
      { $addToSet: { wishlists: inventoryId } },
      { new: true },
    ).populate("wishlists");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Item added to wishlist",
        count: user.wishlists.length,
        wishlists: user.wishlists,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add item to wishlist",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Remove item from wishlist
 */
export async function DELETE(request: Request) {
  try {
    await connectDB();

    // Extract and verify token
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get("inventoryId");

    if (!inventoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Inventory ID is required",
        },
        { status: 400 },
      );
    }

    // Remove from wishlist
    const user = await UserModel.findByIdAndUpdate(
      payload.userId,
      { $pull: { wishlists: inventoryId } },
      { new: true },
    ).populate("wishlists");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from wishlist",
        count: user.wishlists.length,
        wishlists: user.wishlists,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove item from wishlist",
      },
      { status: 500 },
    );
  }
}
