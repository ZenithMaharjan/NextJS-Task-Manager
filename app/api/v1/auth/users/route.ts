import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import UserModel from "../../../../models/User";

/**
 * DELETE - Remove all users from the database
 * WARNING: This is a destructive operation!
 */
export async function DELETE(request: Request) {
  try {
    await connectDB();

    // Optional: Add a confirmation token or admin check for extra security
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get("confirm");

    if (confirm !== "yes") {
      return NextResponse.json(
        {
          success: false,
          error: "Confirmation required. Add ?confirm=yes to the URL to proceed.",
        },
        { status: 400 },
      );
    }

    // Delete all users
    const result = await UserModel.deleteMany({});

    return NextResponse.json(
      {
        success: true,
        message: "All users removed successfully",
        deletedCount: result.deletedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing users:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove users",
      },
      { status: 500 },
    );
  }
}

/**
 * GET - Get all users (for admin/testing purposes)
 */
export async function GET() {
  try {
    await connectDB();

    const users = await UserModel.find({}).select("-password");

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        users,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}
