import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/medicines/:id
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const medicine = await dbService.getMedicineById(id);
    if (!medicine) {
      return NextResponse.json({ error: "Medicine batch not found" }, { status: 404 });
    }
    return NextResponse.json(medicine);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/medicines/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if medicine exists
    const existingMed = await dbService.getMedicineById(id);
    if (!existingMed) {
      return NextResponse.json({ error: "Medicine batch not found" }, { status: 404 });
    }

    // Map body inputs to updates
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.generic_name !== undefined) updates.generic_name = body.generic_name;
    if (body.genericName !== undefined) updates.generic_name = body.genericName;
    if (body.category_id !== undefined) updates.category_id = body.category_id;
    if (body.categoryId !== undefined) updates.category_id = body.categoryId;
    if (body.category !== undefined) updates.category = body.category;
    if (body.supplier_id !== undefined) updates.supplier_id = body.supplier_id;
    if (body.supplierId !== undefined) updates.supplier_id = body.supplierId;
    if (body.supplier !== undefined) updates.supplier = body.supplier;
    if (body.batch_number !== undefined) updates.batch_number = body.batch_number;
    if (body.batchNumber !== undefined) updates.batch_number = body.batchNumber;
    if (body.quantity !== undefined) updates.quantity = Number(body.quantity);
    if (body.unit_price !== undefined) updates.unit_price = Number(body.unit_price);
    if (body.unitPrice !== undefined) updates.unit_price = Number(body.unitPrice);
    if (body.selling_price !== undefined) updates.selling_price = Number(body.selling_price);
    if (body.sellingPrice !== undefined) updates.selling_price = Number(body.sellingPrice);
    if (body.expiry_date !== undefined) updates.expiry_date = body.expiry_date;
    if (body.expiryDate !== undefined) updates.expiry_date = body.expiryDate;
    if (body.image_url !== undefined) updates.image_url = body.image_url;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.image !== undefined) updates.image_url = body.image;
    if (body.barcode !== undefined) updates.barcode = body.barcode;

    // Recalculate status based on quantity
    if (updates.quantity !== undefined) {
      const q = updates.quantity;
      updates.status = q <= 0 ? "out-of-stock" : q < 50 ? "low-stock" : "in-stock";
    }

    const updatedMed = await dbService.updateMedicine(id, updates);

    // Audit Log logging
    await dbService.createAuditLog({
      action: "Update Medicine",
      module: "Inventory",
      details: `Updated details for medicine ${existingMed.name} (ID: ${id})`
    });

    return NextResponse.json({
      message: "Medicine updated successfully",
      medicine: updatedMed
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/medicines/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existingMed = await dbService.getMedicineById(id);
    if (!existingMed) {
      return NextResponse.json({ error: "Medicine batch not found" }, { status: 404 });
    }

    await dbService.deleteMedicine(id);

    // Audit Logging
    await dbService.createAuditLog({
      action: "Delete Medicine",
      module: "Inventory",
      details: `Deleted medicine record ${existingMed.name} (ID: ${id})`
    });

    return NextResponse.json({ message: "Medicine deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
