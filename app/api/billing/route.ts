import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/billing
export async function GET() {
  try {
    const bills = await dbService.getBills();
    const patients = await dbService.getPatients();

    const formatted = bills.map((b: any) => {
      const p = patients.find((pat: any) => pat.id === b.patient_id);
      const invoiceNumber = b.invoiceNumber || `INV-2026-${b.id.slice(0, 4).toUpperCase()}`;

      // Reconstruct mock items array for frontend compatibility
      const items = b.items || [
        { name: "Consultation Charge", quantity: 1, price: Number(b.total) }
      ];

      return {
        ...b,
        invoiceNumber,
        patientName: b.patientName || (p ? `${p.first_name} ${p.last_name}` : "Patient"),
        date: b.created_at.split("T")[0],
        dueDate: b.due_date || new Date(new Date(b.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        amount: Number(b.total),
        status: b.payment_status.toLowerCase(), // paid, unpaid, overdue
        items
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/billing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patientId = body.patientId || body.patient_id;
    const amount = Number(body.amount || body.total || 0);
    const items = body.items || [];
    
    // Capitalize payment status mapping for database constraints ('Paid', 'Unpaid', 'Overdue')
    const ps = body.status ? body.status.toLowerCase() : "unpaid";
    const paymentStatus = ps === "paid" ? "Paid" : ps === "overdue" ? "Overdue" : "Unpaid";

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const bill = await dbService.createBill({
      patient_id: patientId,
      total: amount,
      payment_status: paymentStatus,
      items,
      due_date: body.dueDate || body.due_date
    });

    // Audit log
    await dbService.createAuditLog({
      action: "Generate Invoice",
      module: "Billing",
      details: `Generated invoice for patient ${patientId} ($${amount})`
    });

    return NextResponse.json(
      { message: "Bill generated successfully", bill },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
