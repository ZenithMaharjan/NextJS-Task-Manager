import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import InventoryModel from "../../../../models/Inventory";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 });
    }

    const inventory = await InventoryModel.findById(id);

    if (!inventory) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    return NextResponse.json(inventory, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return NextResponse.json({ error: "Failed to fetch inventory item" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 });
    }

    const body = await request.json();

    const inventory = await InventoryModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    return NextResponse.json(inventory, { status: 200 });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 });
    }

    const body = await request.json();

    const inventory = await InventoryModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    return NextResponse.json(inventory, { status: 200 });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 });
    }

    const inventory = await InventoryModel.findByIdAndDelete(id);

    if (!inventory) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Inventory item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 });
  }
}

