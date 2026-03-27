import { NextResponse } from "next/server";

import connectDB from "../../../lib/mongodb";
import JobCardModel from "../../../models/JobCard";
import UserModel from "../../../models/User";

import { extractUserIdFromHeader } from "@/utils/jwt";

export async function GET(request: Request) {
  try {
    await connectDB();

    const userId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await UserModel.findById(userId).lean();
    if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    // Optional filters
    const serviceTypeParam = searchParams.get("serviceType");
    const regdNo = searchParams.get("regdNo");
    const jobCardNo = searchParams.get("jobCardNo");

    const filter: Record<string, any> = { userId };

    if (serviceTypeParam) {
      const types = serviceTypeParam
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
      if (types.length) filter.serviceType = { $in: types };
    }

    if (regdNo) filter["vehicle.regdNo"] = new RegExp(regdNo, "i");
    if (jobCardNo) filter.jobCardNo = new RegExp(jobCardNo, "i");

    const [data, total] = await Promise.all([
      JobCardModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      JobCardModel.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data, meta: { total, page, limit } });
  } catch (error) {
    console.error("Error fetching job cards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job cards" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const userId = extractUserIdFromHeader(request.headers.get("Authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const { date, timeIn, customer, vehicle, serviceType, kmReading } = body;

    if (
      !date ||
      !timeIn ||
      !customer?.name ||
      !customer?.contactNo ||
      !vehicle?.model ||
      !vehicle?.regdNo ||
      !serviceType ||
      kmReading === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: date, timeIn, customer.name, customer.contactNo, vehicle.model, vehicle.regdNo, serviceType, kmReading",
        },
        { status: 400 },
      );
    }

    const jobCard = await JobCardModel.create({ ...body, userId });

    return NextResponse.json({ success: true, data: jobCard }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job card:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Job card number already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create job card" },
      { status: 500 },
    );
  }
}
