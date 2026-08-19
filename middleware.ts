import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("dv_admin_session")?.value;

  // 1. Alias /login -> /admin
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 2. Admin Login routes (/admin and /dashboard/login)
  if (pathname === "/admin" || pathname === "/dashboard/login") {
    if (sessionCookie) {
      const { valid } = verifySessionToken(sessionCookie);
      if (valid) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  // 3. Check Dashboard Protected Routes
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/admin", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { valid } = verifySessionToken(sessionCookie);
    if (!valid) {
      const loginUrl = new URL("/admin", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("dv_admin_session");
      return res;
    }
  }

  // 4. Pass request and apply Security Headers
  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(res: NextResponse) {
  // Prevent clickjacking
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Prevent MIME-type sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Restrict sensitive device APIs
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // XSS filter
  res.headers.set("X-XSS-Protection", "1; mode=block");
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images, favicon.ico, etc.
     */
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
