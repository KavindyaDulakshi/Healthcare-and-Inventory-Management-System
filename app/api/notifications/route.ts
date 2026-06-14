import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

// GET /api/notifications
export async function GET() {
  try {
    const notifications = await dbService.getNotifications();
    
    // Map properties to match what the client-side state expects ('read', 'priority')
    const formatted = notifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.is_read !== undefined ? n.is_read : false,
      priority: n.priority || "medium",
      date: n.created_at
    }));
    
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
