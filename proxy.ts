import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/auth-utils";

// List of protected routes that require a valid session
const PROTECTED_ROUTES = [
  "/dashboard",
  "/inventory",
  "/medicines",
  "/categories",
  "/suppliers",
  "/patients",
  "/doctors",
  "/appointments",
  "/billing",
  "/reports",
  "/notifications",
  "/audit-logs",
  "/ai-assistant",
  "/ai",
  "/settings"
];

// List of authentication routes (should redirect to dashboard if already logged in)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Get the session token from the cookies
  const token = request.cookies.get("hc_token")?.value;
  
  // 2. Validate session token if present
  let user = null;
  if (token) {
    user = await verifyJWT(token);
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
  
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // 3. Handle protection logic
  if (isProtectedRoute) {
    if (!user) {
      // Redirect to login page, preserving target path in query parameter if helpful
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthRoute) {
    if (user) {
      // Redirect authenticated users away from login/register back to the dashboard
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Next.js routing match criteria
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/medicines/:path*",
    "/categories/:path*",
    "/suppliers/:path*",
    "/patients/:path*",
    "/doctors/:path*",
    "/appointments/:path*",
    "/billing/:path*",
    "/reports/:path*",
    "/notifications/:path*",
    "/audit-logs/:path*",
    "/ai-assistant/:path*",
    "/ai/:path*",
    "/settings/:path*",
    "/login",
    "/register"
  ]
};
