// Secret for session token signing
const SESSION_SECRET = process.env.SESSION_SECRET || "dv_performing_arts_super_secret_auth_key_2026";
const ADMIN_USER = process.env.ADMIN_USER || "admin@dvperformingarts.com";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "DVPerforming@2026!Admin";

// Rate limiting in-memory store
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_TIME_MS = 15 * 60 * 1000; // 15 minutes attempt window

/**
 * Check if IP is currently locked out from brute-force attempts
 */
export function checkRateLimit(ip: string): { isLocked: boolean; remainingLockMinutes?: number; remainingAttempts?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingMin = Math.ceil((record.lockedUntil - now) / 60000);
    return { isLocked: true, remainingLockMinutes: remainingMin, remainingAttempts: 0 };
  }

  // If window expired, reset attempts
  if (now - record.lastAttempt > WINDOW_TIME_MS) {
    loginAttempts.delete(ip);
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return { isLocked: false, remainingAttempts: remaining };
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(ip: string): { isLocked: boolean; remainingAttempts: number; remainingLockMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lastAttempt: now };

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_TIME_MS;
    loginAttempts.set(ip, record);
    return { isLocked: true, remainingAttempts: 0, remainingLockMinutes: 15 };
  }

  loginAttempts.set(ip, record);
  return { isLocked: false, remainingAttempts: MAX_ATTEMPTS - record.count };
}

/**
 * Reset failed attempts on successful login
 */
export function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

/**
 * Verify credentials against master admin (Edge-compatible)
 */
export function verifyCredentials(user: string, pass: string): boolean {
  const inputUser = user.trim().toLowerCase();
  const targetUser = ADMIN_USER.toLowerCase();
  const altUser = "admin";

  const userMatches = inputUser === targetUser || inputUser === altUser;
  if (!userMatches) return false;

  return pass === ADMIN_PASS;
}

/**
 * Edge-compatible simple signature generator
 */
function simpleSign(payloadStr: string): string {
  let hash = 0;
  const combined = payloadStr + ":" + SESSION_SECRET;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create a session token (Edge-compatible)
 */
export function createSessionToken(
  userData: {
    username: string;
    role?: string;
    fullName?: string;
    id?: string;
    isJuror?: boolean;
    assignedDiscipline?: string;
  } | string
): string {
  const username = typeof userData === "string" ? userData : userData.username;
  const role = typeof userData === "string" ? "ADMIN" : userData.role || "ADMIN";
  const fullName = typeof userData === "string" ? "Administrador" : userData.fullName || username;
  const isJuror = typeof userData === "object" ? Boolean(userData.isJuror) : false;
  const assignedDiscipline = typeof userData === "object" ? userData.assignedDiscipline : undefined;

  const payload = JSON.stringify({
    user: username,
    role,
    fullName,
    isJuror,
    assignedDiscipline,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = simpleSign(base64Payload);

  return `${base64Payload}.${signature}`;
}

/**
 * Validate a session token (Edge-compatible)
 */
export function verifySessionToken(token: string): {
  valid: boolean;
  user?: string;
  role?: string;
  fullName?: string;
  isJuror?: boolean;
  assignedDiscipline?: string;
} {
  if (!token || !token.includes(".")) return { valid: false };

  const [base64Payload, signature] = token.split(".");
  if (!base64Payload || !signature) return { valid: false };

  const expectedSignature = simpleSign(base64Payload);
  if (signature !== expectedSignature) {
    return { valid: false };
  }

  try {
    const jsonStr = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr);
    if (payload.exp && payload.exp < Date.now()) {
      return { valid: false }; // Expired
    }
    return {
      valid: true,
      user: payload.user,
      role: payload.role,
      fullName: payload.fullName,
      isJuror: Boolean(payload.isJuror),
      assignedDiscipline: payload.assignedDiscipline,
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Verify Cloudflare Turnstile token on the server
 */
export async function verifyTurnstileToken(
  token?: string,
  remoteip?: string
): Promise<{ success: boolean; error?: string }> {
  // If no token provided
  if (!token) {
    // If no secret key configured and in development, allow bypass
    if (!process.env.TURNSTILE_SECRET_KEY && process.env.NODE_ENV === "development") {
      return { success: true };
    }
    return {
      success: false,
      error: "Por favor completa la verificación de seguridad (Cloudflare Turnstile).",
    };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (remoteip) {
      formData.append("remoteip", remoteip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await res.json();

    if (data.success) {
      return { success: true };
    } else {
      console.warn("[TURNSTILE VERIFY FAILED]", data);
      return {
        success: false,
        error: "Verificación de seguridad fallida o expirada. Intenta de nuevo.",
      };
    }
  } catch (err) {
    console.error("[TURNSTILE VERIFY ERROR]", err);
    // Cloudflare network error fallback
    return { success: true };
  }
}

