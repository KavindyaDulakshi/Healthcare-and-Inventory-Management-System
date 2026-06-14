import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

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

// GET /api/medicines
export async function GET() {
  try {
    const [medicines, categories, suppliers] = await Promise.all([
      dbService.getMedicines(),
      dbService.getCategories(),
      dbService.getSuppliers()
    ]);
    const formatted = medicines.map((med: any) => formatMedicine(med, categories, suppliers));
    return NextResponse.json(formatted);
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

    // Create record mapping (only containing database columns to be safe)
    const newMedRecord = {
      name,
      generic_name: genericName,
      category_id: categoryId,
      supplier_id: supplierId,
      batch_number: batchNumber,
      quantity,
      unit_price: unitPrice,
      selling_price: sellingPrice,
      expiry_date: expiryDate,
      image_url: imageUrl,
      barcode
    };

    const createdMed = await dbService.createMedicine(newMedRecord);

    // Create audit log and transaction log
    await dbService.createAuditLog({
      action: "Add Medicine",
      module: "Inventory",
      details: `Added ${name} (${quantity} units) to batch ${batchNumber}`
    });

    const [categories, suppliers] = await Promise.all([
      dbService.getCategories(),
      dbService.getSuppliers()
    ]);

    return NextResponse.json(
      {
        message: "Medicine added successfully",
        medicine: formatMedicine(createdMed, categories, suppliers)
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

