import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/categories
export async function GET() {
  try {
    const categories = await dbService.getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await dbService.createCategory({ name });
    
    // Add audit log
    await dbService.createAuditLog({
      action: "Create Category",
      module: "Inventory",
      details: `Created new category '${name}'`
    });

    return NextResponse.json(
      { message: "Category created successfully", category },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
