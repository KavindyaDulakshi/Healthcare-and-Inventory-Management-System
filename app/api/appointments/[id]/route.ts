import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/appointments/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: any = {};

    if (body.status !== undefined) {
      // Capitalize status for SQL constraints ('Pending', 'Confirmed', 'Completed', 'Cancelled')
      const st = body.status.toLowerCase();
      const statusMap: Record<string, string> = {
        pending: "Pending",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled"
      };
      updates.status = statusMap[st] || body.status;
    }
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.date !== undefined && body.time !== undefined) {
      const date = body.date;
      const time = body.time;
      let [hourStr, minPart] = time.split(":");
      let minStr = minPart ? minPart.slice(0, 2) : "00";
      let isPm = time.toLowerCase().includes("pm");
      let hour = parseInt(hourStr, 10);
      if (isPm && hour !== 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
      updates.appointment_date = `${date}T${String(hour).padStart(2, "0")}:${minStr}:00`;
    }

    const updatedApp = await dbService.updateAppointment(id, updates);
    if (!updatedApp) {
      return NextResponse.json({ error: "Appointment booking not found" }, { status: 404 });
    }

    // Add audit log record
    await dbService.createAuditLog({
      action: "Update Appointment",
      module: "Appointments",
      details: `Updated appointment status of booking ID ${id} to ${updates.status || 'modified parameters'}`
    });

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment: updatedApp
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/appointments/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const success = await dbService.deleteAppointment(id);
    if (!success) {
      return NextResponse.json({ error: "Appointment booking not found" }, { status: 404 });
    }

    // Add audit log record
    await dbService.createAuditLog({
      action: "Cancel Appointment",
      module: "Appointments",
      details: `Cancelled appointment booking ID ${id}`
    });

    return NextResponse.json({ message: "Appointment booking deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
