import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import NotificationModel from "../../../models/Notification";
import { verifyToken, extractTokenFromHeader } from "../../../utils/jwt";

/**
 * GET - Get user's notifications
 * Query params:
 * - isRead: filter by read/unread status (true/false)
 * - type: filter by notification type
 * - limit: number of notifications to return (default: 50)
 * - skip: number of notifications to skip (default: 0)
 * - priority: filter by priority level
 */
export async function GET(request: Request) {
  try {
    await connectDB();

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
    const isReadParam = searchParams.get("isRead");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");
    const priority = searchParams.get("priority");

    const filter: Record<string, unknown> = {
      userId: payload.userId,
    };

    if (isReadParam !== null) {
      filter.isRead = isReadParam === "true";
    }

    if (type) {
      filter.type = type;
    }

    if (priority) {
      filter.priority = priority;
    }

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("inventoryId");

    const unreadCount = await NotificationModel.countDocuments({
      userId: payload.userId,
      isRead: false,
    });

    const totalCount = await NotificationModel.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        count: totalCount,
        unreadCount,
        results: notifications,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
      },
      { status: 500 },
    );
  }
}
