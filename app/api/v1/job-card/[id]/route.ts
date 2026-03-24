import { NextResponse } from "next/server";

import connectDB from "../../../../lib/mongodb";
import JobCardModel from "../../../../models/JobCard";

import { extractUserIdFromHeader } from "@/utils/jwt";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();

    const userId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const jobCard = await JobCardModel.findById(id).lean();
    if (!jobCard) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    if (String(jobCard.userId) !== String(userId)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: jobCard });
  } catch (error) {
    console.error("Error fetching job card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job card" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();

    const userId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const jobCard = await JobCardModel.findById(id);
    if (!jobCard) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    if (String(jobCard.userId) !== String(userId)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await JobCardModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating job card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job card" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();

    const userId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const jobCard = await JobCardModel.findById(id).lean();
    if (!jobCard) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    if (String(jobCard.userId) !== String(userId)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await JobCardModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true, data: jobCard });
  } catch (error) {
    console.error("Error deleting job card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete job card" },
      { status: 500 },
    );
  }
}
