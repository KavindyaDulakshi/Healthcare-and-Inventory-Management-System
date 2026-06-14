import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/suppliers
export async function GET() {
  try {
    const suppliers = await dbService.getSuppliers();
    return NextResponse.json(suppliers);
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
      name: companyName, // compatibility for frontend key mapping
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
      { message: "Supplier created successfully", supplier },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
