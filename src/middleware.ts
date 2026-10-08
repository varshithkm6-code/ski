import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages
  if (
    pathname === "/" ||
    pathname.startsWith("/roles") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  // Let protected pages/API routes handle authentication themselves.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
