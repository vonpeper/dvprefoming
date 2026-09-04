import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("dv_admin_session")?.value;

  // 1. Alias /login and /dashboard/login -> /admin
  if (pathname === "/login" || pathname === "/dashboard/login") {
    const redirectParam = req.nextUrl.searchParams.get("redirect");
    const adminUrl = new URL("/admin", req.url);
    if (redirectParam) adminUrl.searchParams.set("redirect", redirectParam);
    return NextResponse.redirect(adminUrl);
  }

  // 2. Admin Login page (/admin)
  if (pathname === "/admin") {
    if (sessionCookie) {
      const { valid, role } = verifySessionToken(sessionCookie);
      if (valid) {
        if (role === "DOCENTE_JUEZ") {
          return NextResponse.redirect(new URL("/jueces", req.url));
        }
        const redirectParam = req.nextUrl.searchParams.get("redirect");
        const destination = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";
        return NextResponse.redirect(new URL(destination, req.url));
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

    const { valid, role } = verifySessionToken(sessionCookie);
    if (!valid) {
      const loginUrl = new URL("/admin", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("dv_admin_session");
      return res;
    }

    // Role-based restrictions:
    // Teachers (DOCENTE_JUEZ) only have access to /jueces and casting leaderboard /dashboard/audiciones.
    // If they attempt to access other admin dashboard pages, redirect them to /jueces.
    if (role === "DOCENTE_JUEZ") {
      if (pathname !== "/dashboard/audiciones") {
        return NextResponse.redirect(new URL("/jueces", req.url));
      }
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
