import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

function formatPatient(p: any) {
  if (!p) return null;
  let gender = "Other";
  let bloodGroup = "O+";
  let medicalHistory: any[] = [];

  try {
    if (p.medical_notes) {
      const parsed = JSON.parse(p.medical_notes);
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed)) {
          medicalHistory = parsed;
        } else {
          gender = parsed.gender || "Other";
          bloodGroup = parsed.bloodGroup || "O+";
          medicalHistory = parsed.medicalHistory || [];
        }
      }
    }
  } catch (e) {}

  let age = 35;
  if (p.dob) {
    const birthDate = new Date(p.dob);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  return {
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    name: `${p.first_name} ${p.last_name}`.trim(),
    email: p.email,
    phone: p.phone,
    dob: p.dob,
    address: p.address,
    age,
    gender,
    bloodGroup,
    medicalHistory,
    created_at: p.created_at
  };
}

// GET /api/patients/:id
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const patient = await dbService.getPatientById(id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    
    return NextResponse.json(formatPatient(patient));
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

    // Parse existing notes to keep unmodified packed fields
    let parsedNotes: any = {};
    try {
      if (existingPatient.medical_notes) {
        parsedNotes = JSON.parse(existingPatient.medical_notes);
      }
    } catch (e) {}

    let gender = parsedNotes.gender || "Male";
    let bloodGroup = parsedNotes.bloodGroup || "O+";
    let medicalHistory = parsedNotes.medicalHistory || [];
    if (Array.isArray(parsedNotes)) {
      medicalHistory = parsedNotes;
    }

    // Check updates
    if (body.gender !== undefined) gender = body.gender;
    if (body.bloodGroup !== undefined) bloodGroup = body.bloodGroup;
    if (body.blood_group !== undefined) bloodGroup = body.blood_group;
    if (body.medicalHistory !== undefined) medicalHistory = body.medicalHistory;

    const updates: any = {};
    if (body.first_name !== undefined) updates.first_name = body.first_name;
    if (body.last_name !== undefined) updates.last_name = body.last_name;
    if (body.name !== undefined) {
      const names = body.name.split(" ");
      updates.first_name = names[0];
      updates.last_name = names.slice(1).join(" ") || "";
    }
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.dob !== undefined) updates.dob = body.dob;
    if (body.address !== undefined) updates.address = body.address;

    // Pack updated notes
    updates.medical_notes = JSON.stringify({
      gender,
      bloodGroup,
      medicalHistory
    });

    const updatedPatient = await dbService.updatePatient(id, updates);

    // Audit log
    await dbService.createAuditLog({
      action: "Update Patient Profile",
      module: "Patients",
      details: `Updated details for patient ${existingPatient.first_name} ${existingPatient.last_name} (ID: ${id})`
    });

    return NextResponse.json({
      message: "Patient updated successfully",
      patient: formatPatient(updatedPatient)
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
