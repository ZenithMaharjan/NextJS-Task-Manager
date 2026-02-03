import { NextResponse } from "next/server";

import connectDB from "../../../lib/mongodb";
import InventoryModel from "../../../models/Inventory";
import WishlistModel from "../../../models/Wishlist";
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

    // Get user's wishlist items
    const wishlistItems = await WishlistModel.find({ userId: payload.userId }).populate(
      "inventoryId",
    );

    // Transform to match expected frontend format if necessary
    // Frontend expects an array of inventory items
    const formattedWishlist = wishlistItems
      .filter(item => item.inventoryId) // Filter out items where inventory might have been deleted
      .map(item => item.inventoryId);

    return NextResponse.json(
      {
        success: true,
        count: formattedWishlist.length,
        wishlists: formattedWishlist,
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

    // Add to wishlist (using updateOne with upsert to prevent duplicates for same user)
    await WishlistModel.updateOne(
      { userId: payload.userId, inventoryId },
      { $set: { userId: payload.userId, inventoryId } },
      { upsert: true },
    );

    // Get updated wishlist
    const wishlistItems = await WishlistModel.find({ userId: payload.userId }).populate(
      "inventoryId",
    );
    const formattedWishlist = wishlistItems
      .filter(item => item.inventoryId)
      .map(item => item.inventoryId);

    return NextResponse.json(
      {
        success: true,
        message: "Item added to wishlist",
        count: formattedWishlist.length,
        wishlists: formattedWishlist,
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

    // Remove from wishlist (scoped to user)
    await WishlistModel.findOneAndDelete({
      userId: payload.userId,
      inventoryId,
    });

    // Get updated wishlist
    const wishlistItems = await WishlistModel.find({ userId: payload.userId }).populate(
      "inventoryId",
    );
    const formattedWishlist = wishlistItems
      .filter(item => item.inventoryId)
      .map(item => item.inventoryId);

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from wishlist",
        count: formattedWishlist.length,
        wishlists: formattedWishlist,
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
