import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";

// GET /api/users
export async function GET() {
  try {
    const users = await dbService.getUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users
export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required fields" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    // Hash user password
    const passwordHash = await hashPassword(password);

    const user = await dbService.createUser({
      full_name: name,
      email,
      password_hash: passwordHash,
      role
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
