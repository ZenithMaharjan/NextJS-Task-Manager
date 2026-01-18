import { NextResponse } from "next/server";

export async function POST() {
  try {
    // In a JWT-based auth system, logout is typically handled client-side
    // by removing the token from storage. This endpoint can be used for
    // logging purposes or to invalidate refresh tokens if implemented.

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to logout",
      },
      { status: 500 },
    );
  }
}
