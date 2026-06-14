import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hc_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session has expired or is invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred retrieving profile" },
      { status: 500 }
    );
  }
}
