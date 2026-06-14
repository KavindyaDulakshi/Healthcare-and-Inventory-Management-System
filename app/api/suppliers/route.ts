import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// Helper function to format database supplier record to frontend Supplier model
function formatSupplier(sup: any) {
  if (!sup) return null;
  return {
    id: String(sup.id),
    name: sup.company_name || sup.name || "",
    contactPerson: sup.contact_person || sup.contactPerson || "Representative",
    email: sup.email || "",
    phone: sup.phone || "",
    address: sup.address || "",
    rating: Number(sup.rating !== undefined ? sup.rating : 5),
    balance: Number(sup.balance !== undefined ? sup.balance : 0),
    purchaseHistoryCount: Number(sup.purchase_history_count !== undefined ? sup.purchase_history_count : sup.purchaseHistoryCount || 0)
  };
}

// GET /api/suppliers
export async function GET() {
  try {
    const suppliers = await dbService.getSuppliers();
    const formatted = suppliers.map(formatSupplier);
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/suppliers
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyName = body.company_name || body.companyName || body.name;
    const email = body.email || "";
    const phone = body.phone || "";
    const address = body.address || "";

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const supplier = await dbService.createSupplier({
      company_name: companyName,
      email,
      phone,
      address
    });

    // Audit logging
    await dbService.createAuditLog({
      action: "Create Supplier",
      module: "Suppliers",
      details: `Added new supplier '${companyName}'`
    });

    return NextResponse.json(
      { message: "Supplier created successfully", supplier: formatSupplier(supplier) },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

