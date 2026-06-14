import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/users/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: any = {};

    if (body.name) updates.full_name = body.name;
    if (body.email) updates.email = body.email;
    if (body.role) updates.role = body.role;
    if (body.password) {
      updates.password_hash = await hashPassword(body.password);
    }

    const updatedUser = await dbService.updateUser(id, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/users/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const success = await dbService.deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
