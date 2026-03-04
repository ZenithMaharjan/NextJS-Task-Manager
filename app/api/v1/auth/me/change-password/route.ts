import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/mongodb";
import UserModel from "../../../../../models/User";
import { ErrorResponse } from "../../../../../types/auth";
import { verifyToken, extractTokenFromHeader } from "../../../../../utils/jwt";

export async function POST(request: Request) {
  try {
    const token = extractTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: "No token provided." },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: "Invalid or expired token." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "currentPassword, newPassword, and confirmPassword are all required.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: "New password must be at least 6 characters." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: "New password and confirm password do not match." },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: "New password must be different from the current password." },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await UserModel.findById(payload.userId).select("+password");

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: "User not found." },
        { status: 404 },
      );
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password changed successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json<ErrorResponse>(
      { success: false, error: "Failed to change password." },
      { status: 500 },
    );
  }
}
