import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/patients/:id
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const patient = await dbService.getPatientById(id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    
    let medicalHistory = [];
    try {
      if (patient.medical_notes) {
        medicalHistory = JSON.parse(patient.medical_notes);
      }
    } catch (e) {}

    return NextResponse.json({
      ...patient,
      name: patient.name || `${patient.first_name} ${patient.last_name}`.trim(),
      medicalHistory
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/patients/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingPatient = await dbService.getPatientById(id);
    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const updates: any = {};
    if (body.first_name !== undefined) updates.first_name = body.first_name;
    if (body.last_name !== undefined) updates.last_name = body.last_name;
    if (body.name !== undefined) {
      updates.name = body.name;
      const names = body.name.split(" ");
      updates.first_name = names[0];
      updates.last_name = names.slice(1).join(" ") || "";
    }
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.dob !== undefined) updates.dob = body.dob;
    if (body.address !== undefined) updates.address = body.address;
    
    // Support medicalHistory array update
    if (body.medicalHistory !== undefined) {
      updates.medical_notes = JSON.stringify(body.medicalHistory);
    } else if (body.medical_notes !== undefined) {
      updates.medical_notes = body.medical_notes;
    }
    
    if (body.age !== undefined) updates.age = Number(body.age);
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.bloodGroup !== undefined) updates.bloodGroup = body.bloodGroup;
    if (body.blood_group !== undefined) updates.bloodGroup = body.blood_group;

    const updatedPatient = await dbService.updatePatient(id, updates);

    // Audit log
    await dbService.createAuditLog({
      action: "Update Patient Profile",
      module: "Patients",
      details: `Updated details for patient ${existingPatient.first_name} ${existingPatient.last_name} (ID: ${id})`
    });

    return NextResponse.json({
      message: "Patient updated successfully",
      patient: updatedPatient
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/patients/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existingPatient = await dbService.getPatientById(id);
    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await dbService.deletePatient(id);

    // Audit log
    await dbService.createAuditLog({
      action: "Delete Patient",
      module: "Patients",
      details: `Deleted patient file ${existingPatient.first_name} ${existingPatient.last_name} (ID: ${id})`
    });

    return NextResponse.json({ message: "Patient profile deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
