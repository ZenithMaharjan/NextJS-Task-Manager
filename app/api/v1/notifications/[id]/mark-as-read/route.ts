import mongoose from "mongoose";
import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/mongodb";
import NotificationModel from "../../../../../models/Notification";
import { verifyToken, extractTokenFromHeader } from "../../../../../utils/jwt";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification ID" },
        { status: 400 },
      );
    }

    const notification = await NotificationModel.findById(id);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.userId.toString() !== payload.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    notification.isRead = true;
    await notification.save();

    return NextResponse.json(
      {
        success: true,
        message: "Notification marked as read",
        notification,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
