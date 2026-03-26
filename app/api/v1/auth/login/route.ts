import { NextResponse } from "next/server";

import connectDB from "../../../../lib/mongodb";
import UserModel from "../../../../models/User";
import { LoginRequest, AuthResponse, ErrorResponse } from "../../../../types/auth";
import { generateToken } from "../../../../utils/jwt";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Missing required fields",
          details: {
            email: !email ? "Email is required" : "",
            password: !password ? "Password is required" : "",
          },
        },
        { status: 400 },
      );
    }

    // Find user by email and include password field
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    // Return success response
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName ?? null,
          dob: user.dob ?? null,
          address: user.address ?? null,
          isAdmin: user.isAdmin ?? false,
        },
        token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Failed to login",
      },
      { status: 500 },
    );
  }
}
