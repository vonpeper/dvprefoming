import { NextRequest, NextResponse } from "next/server";
import { getRehearsalBetaSettings, updateRehearsalBetaSettings } from "@/lib/storage";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    const settings = getRehearsalBetaSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("[GET /api/scripts/settings ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener la configuración de ensayo." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("dv_admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const auth = verifySessionToken(sessionCookie);
    if (!auth.valid || auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Solo los administradores pueden modificar los ajustes de la beta." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = updateRehearsalBetaSettings(body);

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Configuración de la beta de ensayo actualizada.",
    });
  } catch (error: any) {
    console.error("[PUT /api/scripts/settings ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la configuración." },
      { status: 500 }
    );
  }
}
