import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

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

// PUT /api/doctors/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingDoctor = await dbService.getDoctorById(id);
    if (!existingDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Parse existing notes to keep unmodified packed fields
    let parsedNotes: any = {};
    try {
      if (existingDoctor.specialization && existingDoctor.specialization.startsWith("{")) {
        parsedNotes = JSON.parse(existingDoctor.specialization);
      }
    } catch (e) {}

    let specialization = parsedNotes.specialization || existingDoctor.specialization || "General Medicine";
    let department = parsedNotes.department || existingDoctor.specialization || "General Medicine";
    let availability = parsedNotes.availability || ["Monday", "Wednesday", "Friday"];
    let avatar = parsedNotes.avatar || "";

    if (body.specialization !== undefined) specialization = body.specialization;
    if (body.department !== undefined) department = body.department;
    if (body.availability !== undefined) availability = body.availability;
    if (body.avatar !== undefined) avatar = body.avatar;

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.email !== undefined) updates.email = body.email;

    // Pack updated details inside specialization column
    updates.specialization = JSON.stringify({
      specialization,
      department,
      availability,
      avatar
    });

    const updatedDoctor = await dbService.updateDoctor(id, updates);
    if (!updatedDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Audit log
    await dbService.createAuditLog({
      action: "Update Doctor Profile",
      module: "Doctors",
      details: `Updated details for Dr. ${updatedDoctor.name} (ID: ${id})`
    });

    return NextResponse.json({
      message: "Doctor updated successfully",
      doctor: formatDoctor(updatedDoctor)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/doctors/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    const success = await dbService.deleteDoctor(id);
    if (!success) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Audit log
    await dbService.createAuditLog({
      action: "Delete Doctor",
      module: "Doctors",
      details: `Deleted doctor ID ${id}`
    });

    return NextResponse.json({ message: "Doctor removed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
