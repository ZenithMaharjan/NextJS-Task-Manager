import { NextResponse } from "next/server";

import connectDB from "../../../../lib/mongodb";
import UserModel from "../../../../models/User";
import { AuthResponse, ErrorResponse } from "../../../../types/auth";
import { verifyToken, extractTokenFromHeader } from "../../../../utils/jwt";

async function resolveUser(request: Request) {
  const token = extractTokenFromHeader(request.headers.get("authorization"));
  if (!token) {
    return {
      error: NextResponse.json<ErrorResponse>(
        { success: false, error: "No token provided" },
        { status: 401 },
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      error: NextResponse.json<ErrorResponse>(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }

  await connectDB();
  const user = await UserModel.findById(payload.userId);
  if (!user) {
    return {
      error: NextResponse.json<ErrorResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      ),
    };
  }

  return { user };
}

export async function GET(request: Request) {
  try {
    const result = await resolveUser(request);
    if (result.error) return result.error;
    const { user } = result;

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "User authenticated",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName ?? null,
          dob: user.dob ?? null,
          address: user.address ?? null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify token error:", error);

    return NextResponse.json<ErrorResponse>(
      { success: false, error: "Failed to verify token" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await resolveUser(request);
    if (result.error) return result.error;
    const { user } = result;

    const body = await request.json().catch(() => ({}));

    if ("email" in body || "password" in body) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error:
            "email and password cannot be updated here. Use the change-password endpoint for passwords.",
        },
        { status: 400 },
      );
    }

    const { username, fullName, dob, address } = body as {
      username?: string;
      fullName?: string | null;
      dob?: string | null;
      address?: string | null;
    };

    const hasUpdate =
      username !== undefined ||
      fullName !== undefined ||
      dob !== undefined ||
      address !== undefined;

    if (!hasUpdate) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Provide at least one field to update (username, fullName, dob, address).",
        },
        { status: 400 },
      );
    }

    if (username !== undefined) {
      if (
        typeof username !== "string" ||
        username.trim().length < 3 ||
        username.trim().length > 30
      ) {
        return NextResponse.json<ErrorResponse>(
          { success: false, error: "Username must be between 3 and 30 characters." },
          { status: 400 },
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: "Username can only contain letters, numbers, and underscores.",
          },
          { status: 400 },
        );
      }

      if (username.trim() !== user.username) {
        const taken = await UserModel.findOne({ username: username.trim() });
        if (taken) {
          return NextResponse.json<ErrorResponse>(
            { success: false, error: "Username is already taken." },
            { status: 409 },
          );
        }
        user.username = username.trim();
      }
    }

    if (fullName !== undefined) {
      if (fullName !== null) {
        if (typeof fullName !== "string" || fullName.trim().length > 100) {
          return NextResponse.json<ErrorResponse>(
            { success: false, error: "Full name cannot exceed 100 characters." },
            { status: 400 },
          );
        }
        user.fullName = fullName.trim() || null;
      } else {
        user.fullName = null;
      }
    }

    if (dob !== undefined) {
      if (dob !== null) {
        const parsed = new Date(dob);
        if (isNaN(parsed.getTime()) || parsed >= new Date()) {
          return NextResponse.json<ErrorResponse>(
            { success: false, error: "dob must be a valid date in the past (ISO 8601)." },
            { status: 400 },
          );
        }
        user.dob = parsed;
      } else {
        user.dob = null;
      }
    }

    if (address !== undefined) {
      if (address !== null) {
        if (typeof address !== "string" || address.trim().length > 300) {
          return NextResponse.json<ErrorResponse>(
            { success: false, error: "Address cannot exceed 300 characters." },
            { status: 400 },
          );
        }
        user.address = address.trim() || null;
      } else {
        user.address = null;
      }
    }

    await user.save();

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Profile updated successfully.",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName ?? null,
          dob: user.dob ?? null,
          address: user.address ?? null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json<ErrorResponse>(
      { success: false, error: "Failed to update profile." },
      { status: 500 },
    );
  }
}
