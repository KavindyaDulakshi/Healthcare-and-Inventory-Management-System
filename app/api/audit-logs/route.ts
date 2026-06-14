import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/audit-logs
export async function GET() {
  try {
    const logs = await dbService.getAuditLogs();
    const users = await dbService.getUsers();

    // Map logs to return user name matching legacy structure
    const formatted = logs.map((log: any) => {
      const u = users.find((user: any) => user.id === log.user_id);
      return {
        id: log.id,
        user: log.user || (u ? u.full_name : "System"),
        action: log.action,
        module: log.module,
        date: log.created_at,
        details: log.details || `${log.action} performed in ${log.module}`
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
