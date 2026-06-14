import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/categories/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const updatedCategory = await dbService.updateCategory(categoryId, { name });
    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Add audit log
    await dbService.createAuditLog({
      action: "Update Category",
      module: "Inventory",
      details: `Updated category ID ${categoryId} name to '${name}'`
    });

    return NextResponse.json({
      message: "Category updated successfully",
      category: updatedCategory
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/categories/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const success = await dbService.deleteCategory(categoryId);
    if (!success) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Add audit log
    await dbService.createAuditLog({
      action: "Delete Category",
      module: "Inventory",
      details: `Deleted category ID ${categoryId}`
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
