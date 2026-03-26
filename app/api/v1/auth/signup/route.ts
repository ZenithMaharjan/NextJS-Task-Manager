import { NextResponse } from "next/server";

import connectDB from "../../../../lib/mongodb";
import UserModel from "../../../../models/User";
import { SignupRequest, AuthResponse, ErrorResponse } from "../../../../types/auth";
import { generateToken } from "../../../../utils/jwt";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body: SignupRequest = await request.json();
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Missing required fields",
          details: {
            username: !username ? "Username is required" : "",
            email: !email ? "Email is required" : "",
            password: !password ? "Password is required" : "",
          },
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "Email" : "Username";
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: `${field} already exists`,
        },
        { status: 409 },
      );
    }

    // Create new user
    const user = await UserModel.create({
      username,
      email: email.toLowerCase(),
      password,
    });

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
        message: "User created successfully",
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
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);

    // Handle validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ValidationError") {
      const validationError = error as unknown as { errors: Record<string, { message: string }> };

      // Suggested: Extract the first error message safely
      const firstError = Object.values(validationError.errors)[0]?.message || "Validation failed";

      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 },
    );
  }
}
