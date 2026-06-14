import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

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

// GET /api/patients
export async function GET() {
  try {
    const patients = await dbService.getPatients();
    const formatted = patients.map(formatPatient);
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/patients
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Deconstruct fields with fallbacks
    const name = body.name || "";
    const firstName = body.first_name || name.split(" ")[0] || "Unnamed";
    const lastName = body.last_name || name.split(" ").slice(1).join(" ") || "Patient";
    const email = body.email || "";
    const phone = body.phone || "";
    const age = Number(body.age || 35);
    const dob = body.dob || new Date(new Date().getFullYear() - age, 0, 1).toISOString().split('T')[0];
    const address = body.address || "";
    
    // Legacy context fields packed into JSON notes field to stay RLS and schema-safe
    const medicalNotes = JSON.stringify({
      gender: body.gender || "Male",
      bloodGroup: body.bloodGroup || "O+",
      medicalHistory: body.medicalHistory || []
    });

    const patient = await dbService.createPatient({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      dob,
      address,
      medical_notes: medicalNotes
    });

    // Audit log
    await dbService.createAuditLog({
      action: "Create Patient",
      module: "Patients",
      details: `Registered patient ${firstName} ${lastName}`
    });

    return NextResponse.json(
      { message: "Patient registered successfully", patient: formatPatient(patient) },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
