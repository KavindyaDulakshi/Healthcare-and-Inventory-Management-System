import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { comparePassword, signJWT } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter email and password" },
        { status: 400 }
      );
    }

    // Retrieve user profile
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email address or password" },
        { status: 401 }
      );
    }

    // Compare credentials
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email address or password" },
        { status: 401 }
      );
    }

    // Sign session token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    );

    // Set secure cookie
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
      action: "User Login",
      module: "Auth"
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
