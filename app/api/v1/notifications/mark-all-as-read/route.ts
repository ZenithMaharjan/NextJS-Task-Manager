import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import NotificationModel from "../../../../models/Notification";
import { verifyToken, extractTokenFromHeader } from "../../../../utils/jwt";

export async function POST(request: Request) {
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

    const result = await NotificationModel.updateMany(
      { userId: payload.userId, isRead: false },
      { $set: { isRead: true } },
    );

    return NextResponse.json(
      {
        success: true,
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark all notifications as read",
      },
      { status: 500 },
    );
  }
}
