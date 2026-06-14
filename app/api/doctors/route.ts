import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/doctors
export async function GET() {
  try {
    const doctors = await dbService.getDoctors();
    return NextResponse.json(doctors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/doctors
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name;
    const specialization = body.specialization || body.department || "";
    const email = body.email || "";
    const phone = body.phone || "";
    
    // Legacy support fields
    const department = body.department || specialization;
    const availability = body.availability || ["Monday", "Wednesday", "Friday"];
    const avatar = body.avatar || name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    if (!name) {
      return NextResponse.json(
        { error: "Doctor name is required" },
        { status: 400 }
      );
    }

    const doctor = await dbService.createDoctor({
      name,
      specialization,
      phone,
      email,
      department,
      availability,
      avatar
    });

    // Audit log
    await dbService.createAuditLog({
      action: "Add Doctor",
      module: "Doctors",
      details: `Added doctor Dr. ${name}`
    });

    return NextResponse.json(
      { message: "Doctor added successfully", doctor },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
