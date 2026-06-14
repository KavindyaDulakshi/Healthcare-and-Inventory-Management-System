import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/medicines
export async function GET() {
  try {
    const medicines = await dbService.getMedicines();
    return NextResponse.json(medicines);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/medicines
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Normalize camelCase and snake_case properties
    const name = body.name;
    const genericName = body.generic_name || body.genericName || "";
    const categoryId = body.category_id || body.categoryId || null;
    const category = body.category || "";
    const supplierId = body.supplier_id || body.supplierId || null;
    const supplier = body.supplier || "";
    const batchNumber = body.batch_number || body.batchNumber;
    const quantity = Number(body.quantity !== undefined ? body.quantity : 0);
    const unitPrice = Number(body.unit_price !== undefined ? body.unit_price : body.unitPrice || 0);
    const sellingPrice = Number(body.selling_price !== undefined ? body.selling_price : body.sellingPrice || (unitPrice * 1.3));
    const expiryDate = body.expiry_date || body.expiryDate;
    const imageUrl = body.image_url || body.imageUrl || body.image || null;
    const barcode = body.barcode || body.sku || "";

    if (!name || !batchNumber || !expiryDate) {
      return NextResponse.json(
        { error: "Medicine name, batch number, and expiry date are required" },
        { status: 400 }
      );
    }

    // Create record mapping
    const newMedRecord = {
      name,
      generic_name: genericName,
      category_id: categoryId,
      category, // Keep compatibility for frontend context
      supplier_id: supplierId,
      supplier, // Keep compatibility for frontend context
      batch_number: batchNumber,
      quantity,
      unit_price: unitPrice,
      selling_price: sellingPrice,
      expiry_date: expiryDate,
      image_url: imageUrl,
      barcode,
      // For context compatibility
      barcode_sku: barcode,
      status: quantity <= 0 ? "out-of-stock" : quantity < 50 ? "low-stock" : "in-stock"
    };

    const createdMed = await dbService.createMedicine(newMedRecord);

    // Create audit log and transaction log
    await dbService.createAuditLog({
      action: "Add Medicine",
      module: "Inventory",
      details: `Added ${name} (${quantity} units) to batch ${batchNumber}`
    });

    return NextResponse.json(
      {
        message: "Medicine added successfully",
        medicine: createdMed
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
