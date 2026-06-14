import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/doctors/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingDoctor = dbService.getDoctors(); // just fetching count or check
    
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.specialization !== undefined) updates.specialization = body.specialization;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.email !== undefined) updates.email = body.email;
    if (body.department !== undefined) {
      updates.department = body.department;
      if (body.specialization === undefined) {
        updates.specialization = body.department;
      }
    }
    if (body.availability !== undefined) updates.availability = body.availability;
    if (body.avatar !== undefined) updates.avatar = body.avatar;

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
      doctor: updatedDoctor
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/doctors/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    // We can do a dummy retrieve to check
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
