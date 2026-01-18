import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import UserModel from "../../../../models/User";
import { verifyToken, extractTokenFromHeader } from "../../../../utils/jwt";
import { AuthResponse, ErrorResponse } from "../../../../types/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 },
      );
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    // Get user from database
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Return user data
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "User authenticated",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify token error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Failed to verify token",
      },
      { status: 500 },
    );
  }
}
