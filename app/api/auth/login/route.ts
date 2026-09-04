import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetLoginAttempts,
  verifyCredentials,
  createSessionToken,
  verifyTurnstileToken,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Check rate limit
    const limitCheck = checkRateLimit(ip);
    if (limitCheck.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: `Demasiados intentos fallidos. Tu acceso ha sido bloqueado temporalmente por seguridad. Intenta de nuevo en ${limitCheck.remainingLockMinutes} minutos.`,
          isLocked: true,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password, turnstileToken } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Usuario y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    // 2. Verify Cloudflare Turnstile Captcha
    const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: turnstileResult.error || "Validación de Cloudflare Turnstile fallida.",
        },
        { status: 403 }
      );
    }

    // 3. Verify credentials
    const { authenticateStoredUser } = await import("@/lib/storage");
    const authResult = authenticateStoredUser(username, password);

    if (!authResult.success || !authResult.user) {
      const record = recordFailedAttempt(ip);
      if (record.isLocked) {
        return NextResponse.json(
          {
            success: false,
            error: `Demasiados intentos fallidos (5 de 5). Acceso bloqueado por 15 minutos por prevención de fuerza bruta.`,
            isLocked: true,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Credenciales incorrectas o usuario inactivo. Te quedan ${record.remainingAttempts} intento(s) antes del bloqueo de seguridad.`,
          remainingAttempts: record.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 4. Reset rate limiter on success
    resetLoginAttempts(ip);

    // 5. Generate signed session token with user payload
    const token = createSessionToken(authResult.user);

    const response = NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso.",
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        fullName: authResult.user.fullName,
        role: authResult.user.role,
        isJuror: Boolean(authResult.user.isJuror),
        assignedDiscipline: authResult.user.assignedDiscipline,
        title: authResult.user.title,
      },
    });

    // Set secure HTTP-only session cookie
    response.cookies.set("dv_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("[LOGIN API ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error interno en el servidor de autenticación." },
      { status: 500 }
    );
  }
}
