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
 * Verify credentials
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
export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    user: username,
    role: "admin",
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
export function verifySessionToken(token: string): { valid: boolean; user?: string } {
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
    return { valid: true, user: payload.user };
  } catch {
    return { valid: false };
  }
}
