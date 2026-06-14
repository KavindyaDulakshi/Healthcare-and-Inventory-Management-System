import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const medicines = await dbService.getMedicines();
    const patients = await dbService.getPatients();
    const appointments = await dbService.getAppointments();
    const bills = await dbService.getBills();

    const todayStr = "2026-06-09"; // System base reference date
    const todayAppointmentsCount = appointments.filter((a: any) => 
      a.appointment_date.startsWith(todayStr)
    ).length;

    const lowStockCount = medicines.filter((m: any) => 
      m.quantity > 0 && m.quantity < 50
    ).length;

    const today = new Date(todayStr);
    const expiredCount = medicines.filter((m: any) => 
      m.quantity <= 0 || new Date(m.expiry_date) <= today
    ).length;

    const totalRevenue = bills
      .filter((b: any) => b.payment_status.toLowerCase() === "paid")
      .reduce((sum: number, b: any) => sum + Number(b.total), 0);

    return NextResponse.json({
      totalMedicines: medicines.filter((m: any) => m.quantity > 0).length,
      lowStock: lowStockCount,
      expiredMedicines: expiredCount,
      totalPatients: patients.length,
      appointmentsToday: todayAppointmentsCount,
      revenue: totalRevenue
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
