import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const isPrevHost = host.toLowerCase().includes("prev.");
  const sessionCookie = req.cookies.get("dv_admin_session")?.value;

  // 1. Robots.txt block for preproduction host
  if (isPrevHost && pathname === "/robots.txt") {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  }

  // 2. Private Preproduction Protection (Basic Auth for prev. host)
  if (isPrevHost) {
    let hasValidSession = false;
    if (sessionCookie) {
      const { valid } = verifySessionToken(sessionCookie);
      if (valid) hasValidSession = true;
    }

    if (!hasValidSession) {
      const authHeader = req.headers.get("authorization");
      let isAuthenticated = false;

      if (authHeader && authHeader.startsWith("Basic ")) {
        try {
          const credentials = Buffer.from(authHeader.substring(6), "base64").toString("utf-8");
          const [username, password] = credentials.split(":");
          const validPassword = process.env.ADMIN_PASSWORD || "DVPerforming@2026!Admin";
          const validUsers = ["admin", "dvp", "admin@dvperformingarts.com", "diego", "preproduccion"];

          if (validUsers.includes(username?.toLowerCase()?.trim()) && password === validPassword) {
            isAuthenticated = true;
          }
        } catch {
          isAuthenticated = false;
        }
      }

      if (!isAuthenticated) {
        return new NextResponse("🔒 Entorno de Preproducción DV Performing Arts - Acceso Privado Requerido.", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="DV Performing Arts Preproduccion"',
            "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
          },
        });
      }
    }
  }

  // 3. Alias /login and /dashboard/login -> /admin
  if (pathname === "/login" || pathname === "/dashboard/login") {
    const redirectParam = req.nextUrl.searchParams.get("redirect");
    const adminUrl = new URL("/admin", req.url);
    if (redirectParam) adminUrl.searchParams.set("redirect", redirectParam);
    return NextResponse.redirect(adminUrl);
  }

  // 4. Admin Login page (/admin)
  if (pathname === "/admin") {
    if (sessionCookie) {
      const { valid, role, isJuror } = verifySessionToken(sessionCookie);
      if (valid) {
        if (role === "MAESTRO" || role === "DOCENTE_JUEZ") {
          return NextResponse.redirect(new URL("/jurado", req.url));
        }
        if (role === "ALUMNO") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        const redirectParam = req.nextUrl.searchParams.get("redirect");
        const destination = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";
        return NextResponse.redirect(new URL(destination, req.url));
      }
    }
    const res = NextResponse.next();
    applySecurityHeaders(res, isPrevHost);
    return res;
  }

  // 5. Check Dashboard Protected Routes (Strictly for ADMIN)
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/admin", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { valid, role, isJuror } = verifySessionToken(sessionCookie);
    if (!valid) {
      const loginUrl = new URL("/admin", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("dv_admin_session");
      return res;
    }

    // Role-based restrictions:
    // Teachers / Jurados ONLY have access to /jurado and are blocked from all /dashboard admin options.
    if (role !== "ADMIN") {
      if (role === "MAESTRO" || role === "DOCENTE_JUEZ") {
        return NextResponse.redirect(new URL("/jurado", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 6. Pass request and apply Security Headers
  const response = NextResponse.next();
  applySecurityHeaders(response, isPrevHost);
  return response;
}

function applySecurityHeaders(res: NextResponse, isPrevHost = false) {
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

  if (isPrevHost) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }
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
