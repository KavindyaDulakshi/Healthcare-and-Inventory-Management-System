import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/patients
export async function GET() {
  try {
    const patients = await dbService.getPatients();
    
    // Map to include legacy/context keys like 'name' and 'medicalHistory'
    const formatted = patients.map((p: any) => {
      let medicalHistory = [];
      try {
        if (p.medical_notes) {
          medicalHistory = JSON.parse(p.medical_notes);
        }
      } catch (e) {}
      
      return {
        ...p,
        name: p.name || `${p.first_name} ${p.last_name}`.trim(),
        age: p.age || 35, // default
        medicalHistory
      };
    });
    
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
    const dob = body.dob || "1990-01-01";
    const address = body.address || "";
    const medicalNotes = body.medical_notes || JSON.stringify(body.medicalHistory || []);
    
    // Legacy context fields
    const age = Number(body.age || 35);
    const gender = body.gender || "Male";
    const bloodGroup = body.bloodGroup || body.blood_group || "O+";

    const patient = await dbService.createPatient({
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`.trim(), // cache mapped name
      email,
      phone,
      dob,
      address,
      medical_notes: medicalNotes,
      age,
      gender,
      bloodGroup
    });

    // Audit log
    await dbService.createAuditLog({
      action: "Create Patient",
      module: "Patients",
      details: `Registered patient ${firstName} ${lastName}`
    });

    return NextResponse.json(
      { message: "Patient registered successfully", patient },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
