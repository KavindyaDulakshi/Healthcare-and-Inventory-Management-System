import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/appointments
export async function GET() {
  try {
    const appointments = await dbService.getAppointments();
    
    // Map patientName and doctorName for compatibility with the client context structure
    const patients = await dbService.getPatients();
    const doctors = await dbService.getDoctors();
    
    const formatted = appointments.map((a: any) => {
      const p = patients.find((pat: any) => pat.id === a.patient_id);
      const d = doctors.find((doc: any) => doc.id === a.doctor_id);
      
      const dateParts = a.appointment_date.split("T");
      const date = dateParts[0];
      const timeRaw = dateParts[1] || "09:00:00";
      
      // Convert time raw to 12-hour AM/PM for layout compatibility
      const hour = parseInt(timeRaw.split(":")[0], 10);
      const min = timeRaw.split(":")[1] || "00";
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      const time = `${String(hour12).padStart(2, "0")}:${min} ${ampm}`;

      return {
        ...a,
        patientName: a.patientName || (p ? `${p.first_name} ${p.last_name}` : "Patient"),
        doctorName: a.doctorName || (d ? d.name : "Doctor"),
        date,
        time,
        notes: a.notes || "No notes",
        status: a.status.toLowerCase() // client expects lowercase status
      };
    });
    
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patientId = body.patientId || body.patient_id;
    const doctorId = body.doctorId || body.doctor_id;
    
    const date = body.date || body.appointmentDate || body.appointment_date || new Date().toISOString().split("T")[0];
    const time = body.time || "09:00 AM"; // e.g. 10:00 AM
    
    // Convert 12h time to ISO timestamp addition
    let [hourStr, minPart] = time.split(":");
    let minStr = minPart ? minPart.slice(0, 2) : "00";
    let isPm = time.toLowerCase().includes("pm");
    let hour = parseInt(hourStr, 10);
    if (isPm && hour !== 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    
    const appointmentDate = `${date}T${String(hour).padStart(2, "0")}:${minStr}:00`;
    const notes = body.notes || "";

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: "Patient and Doctor selections are required" },
        { status: 400 }
      );
    }

    const app = await dbService.createAppointment({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_date: appointmentDate,
      status: "Pending", // Match enum checked constraint 'Pending', 'Confirmed' etc
      notes
    });

    // Create an audit log record
    await dbService.createAuditLog({
      action: "Schedule Appointment",
      module: "Appointments",
      details: `Scheduled appointment on ${date} at ${time}`
    });

    return NextResponse.json(
      { message: "Appointment booked successfully", appointment: app },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
