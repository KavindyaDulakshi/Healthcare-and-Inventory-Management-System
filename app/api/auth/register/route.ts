import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { hashPassword, signJWT } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please enter all required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);
    
    // Default user role as Admin or Pharmacist/Doctor etc
    const userRole = role || "Admin";

    // Create user in Database
    const user = await dbService.createUser({
      full_name: name,
      email: email,
      password_hash: passwordHash,
      role: userRole
    });

    // Sign session token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role
    });

    // Create secure HTTP-only response cookie
    const response = NextResponse.json(
      { 
        message: "Registration successful", 
        user: { 
          id: user.id, 
          name: user.full_name, 
          email: user.email, 
          role: user.role 
        } 
      },
      { status: 201 }
    );

    response.cookies.set({
      name: "hc_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 day
    });

    // Create an audit log record
    await dbService.createAuditLog({
      user_id: user.id,
      action: "User Registered",
      module: "Auth"
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
