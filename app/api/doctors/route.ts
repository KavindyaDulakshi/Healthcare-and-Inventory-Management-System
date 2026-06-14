import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

function formatDoctor(d: any) {
  if (!d) return null;
  let department = "General Medicine";
  let availability = ["Monday", "Wednesday", "Friday"];
  let avatar = d.name ? d.name.split(" ").filter((n: string) => !n.includes("Dr.")).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "DR";
  let specialization = d.specialization || "General Practitioner";

  try {
    if (d.specialization && d.specialization.startsWith("{")) {
      const parsed = JSON.parse(d.specialization);
      specialization = parsed.specialization || "General Practitioner";
      department = parsed.department || specialization;
      availability = parsed.availability || ["Monday", "Wednesday", "Friday"];
      avatar = parsed.avatar || avatar;
    }
  } catch (e) {}

  if (!d.specialization?.startsWith("{")) {
    department = d.specialization || "General Medicine";
  }

  return {
    id: d.id,
    name: d.name,
    email: d.email || "",
    phone: d.phone || "",
    specialization,
    department,
    availability,
    avatar,
    created_at: d.created_at
  };
}

// GET /api/doctors
export async function GET() {
  try {
    const doctors = await dbService.getDoctors();
    const formatted = doctors.map(formatDoctor);
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/doctors
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name;
    const rawSpecialization = body.specialization || body.department || "General Medicine";
    const email = body.email || "";
    const phone = body.phone || "";
    
    // Legacy support fields
    const department = body.department || rawSpecialization;
    const availability = body.availability || ["Monday", "Wednesday", "Friday"];
    const avatar = body.avatar || name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    if (!name) {
      return NextResponse.json(
        { error: "Doctor name is required" },
        { status: 400 }
      );
    }

    // Pack metadata inside specialization column
    const packedSpecialization = JSON.stringify({
      specialization: rawSpecialization,
      department,
      availability,
      avatar
    });

    const doctor = await dbService.createDoctor({
      name,
      specialization: packedSpecialization,
      phone,
      email
    });

    // Audit log
    await dbService.createAuditLog({
      action: "Add Doctor",
      module: "Doctors",
      details: `Added doctor Dr. ${name}`
    });

    return NextResponse.json(
      { message: "Doctor added successfully", doctor: formatDoctor(doctor) },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
