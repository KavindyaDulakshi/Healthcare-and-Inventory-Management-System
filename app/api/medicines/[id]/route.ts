import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// Helper function to format database medicine record to camelCase frontend model
function formatMedicine(med: any, categories: any[], suppliers: any[]) {
  if (!med) return null;

  // Resolve category name from category_id
  let categoryName = med.category || "";
  if (!categoryName && med.category_id !== undefined && med.category_id !== null) {
    const cat = categories.find(c => String(c.id) === String(med.category_id));
    if (cat) {
      categoryName = cat.name;
    }
  }

  // Resolve supplier name from supplier_id
  let supplierName = med.supplier || "";
  if (!supplierName && med.supplier_id !== undefined && med.supplier_id !== null) {
    const sup = suppliers.find(s => String(s.id) === String(med.supplier_id));
    if (sup) {
      supplierName = sup.company_name || sup.name || "";
    }
  }

  // Calculate status defensively based on quantity and expiry
  const qty = Number(med.quantity !== undefined ? med.quantity : 0);
  const expDateStr = med.expiry_date || med.expiryDate || "";
  let status = med.status || "";
  if (!status && expDateStr) {
    const today = new Date("2026-06-09"); // Hardcoded local date context
    const expiry = new Date(expDateStr);
    if (expiry <= today) {
      status = "expired";
    } else if (qty <= 0) {
      status = "out-of-stock";
    } else if (qty < 50) {
      status = "low-stock";
    } else {
      status = "in-stock";
    }
  }
  if (!status) {
    status = qty <= 0 ? "out-of-stock" : qty < 50 ? "low-stock" : "in-stock";
  }

  return {
    id: String(med.id),
    name: med.name,
    genericName: med.generic_name || med.genericName || "",
    category: categoryName,
    batchNumber: med.batch_number || med.batchNumber || "",
    quantity: qty,
    unitPrice: Number(med.unit_price !== undefined ? med.unit_price : med.unitPrice || 0),
    expiryDate: expDateStr ? (typeof expDateStr === 'string' ? expDateStr.split('T')[0] : new Date(expDateStr).toISOString().split('T')[0]) : "",
    supplier: supplierName,
    status: status,
    barcode: med.barcode || med.barcode_sku || "",
    image: med.image_url || med.imageUrl || med.image || null
  };
}

// GET /api/medicines/:id
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const medicine = await dbService.getMedicineById(id);
    if (!medicine) {
      return NextResponse.json({ error: "Medicine batch not found" }, { status: 404 });
    }
    const [categories, suppliers] = await Promise.all([
      dbService.getCategories(),
      dbService.getSuppliers()
    ]);
    return NextResponse.json(formatMedicine(medicine, categories, suppliers));
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

    // Map body inputs to updates (only containing database columns to be safe)
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.generic_name !== undefined) updates.generic_name = body.generic_name;
    if (body.genericName !== undefined) updates.generic_name = body.genericName;
    if (body.category_id !== undefined) updates.category_id = body.category_id;
    if (body.categoryId !== undefined) updates.category_id = body.categoryId;
    if (body.supplier_id !== undefined) updates.supplier_id = body.supplier_id;
    if (body.supplierId !== undefined) updates.supplier_id = body.supplierId;
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

    const updatedMed = await dbService.updateMedicine(id, updates);

    // Audit Log logging
    await dbService.createAuditLog({
      action: "Update Medicine",
      module: "Inventory",
      details: `Updated details for medicine ${existingMed.name} (ID: ${id})`
    });

    const [categories, suppliers] = await Promise.all([
      dbService.getCategories(),
      dbService.getSuppliers()
    ]);

    return NextResponse.json({
      message: "Medicine updated successfully",
      medicine: formatMedicine(updatedMed, categories, suppliers)
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

