import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/notifications/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updates: any = {};
    if (body.read !== undefined) updates.is_read = body.read;
    if (body.is_read !== undefined) updates.is_read = body.is_read;

    const updatedNotif = await dbService.updateNotification(id, updates);
    if (!updatedNotif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Notification updated successfully",
      notification: updatedNotif
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
