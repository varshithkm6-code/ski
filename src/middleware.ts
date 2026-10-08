import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  // Public routes
  if (pathname === "/" || pathname.startsWith("/roles")) {
    return NextResponse.next();
  }

  // Login/Register
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }

    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // Counselor-only routes
  if (
    pathname.startsWith("/counselor") &&
    role !== "COUNSELOR" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
