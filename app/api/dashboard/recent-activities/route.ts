import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const auditLogs = await dbService.getAuditLogs();
    const medicines = await dbService.getMedicines();
    
    // Format recent operations details
    const recentActivities = auditLogs.slice(0, 5).map((log: any) => ({
      id: log.id,
      user: log.user || "Staff User",
      action: log.action,
      module: log.module,
      date: log.created_at,
      details: log.details || `${log.action} performed in ${log.module}`
    }));

    // Generate alerts for critical low stock
    const criticalAlerts = medicines
      .filter((m: any) => m.quantity <= 0 || (m.quantity > 0 && m.quantity < 50))
      .slice(0, 3)
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        quantity: m.quantity,
        status: m.quantity <= 0 ? "out-of-stock" : "low-stock"
      }));

    return NextResponse.json({
      activities: recentActivities,
      alerts: criticalAlerts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
