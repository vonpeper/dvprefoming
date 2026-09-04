import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("dv_admin_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { valid, user, role, fullName, isJuror, assignedDiscipline } = verifySessionToken(sessionCookie);

  if (!valid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: user,
      role: role || "ADMIN",
      fullName: fullName || user,
      isJuror: Boolean(isJuror),
      assignedDiscipline: assignedDiscipline,
    },
  });
}
