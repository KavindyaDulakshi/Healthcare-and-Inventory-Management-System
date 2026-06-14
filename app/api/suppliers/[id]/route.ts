import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/suppliers/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: any = {};

    if (body.company_name) updates.company_name = body.company_name;
    if (body.companyName) updates.company_name = body.companyName;
    if (body.name) {
      updates.company_name = body.name;
      updates.name = body.name;
    }
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.address !== undefined) updates.address = body.address;

    const updatedSupplier = await dbService.updateSupplier(id, updates);
    if (!updatedSupplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    // Audit log
    await dbService.createAuditLog({
      action: "Update Supplier",
      module: "Suppliers",
      details: `Updated details for supplier ID ${id}`
    });

    return NextResponse.json({
      message: "Supplier updated successfully",
      supplier: updatedSupplier
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/suppliers/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const success = await dbService.deleteSupplier(id);
    if (!success) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    // Audit log
    await dbService.createAuditLog({
      action: "Delete Supplier",
      module: "Suppliers",
      details: `Deleted supplier ID ${id}`
    });

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
