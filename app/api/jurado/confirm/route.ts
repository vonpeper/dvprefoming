import { NextRequest, NextResponse } from "next/server";
import { getStoredUsers, updateUser } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID de jurado requerido." }, { status: 400 });
    }

    const users = getStoredUsers();
    const user = users.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario o jurado no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        title: user.title,
        assignedDiscipline: user.assignedDiscipline || "CANTO",
        attendanceStatus: user.attendanceStatus || "PENDING",
        phone: user.phone,
      },
    });
  } catch (err: any) {
    console.error("[JUROR CONFIRM GET ERROR]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de jurado requerido." }, { status: 400 });
    }

    const validStatus = status === "DECLINED" ? "DECLINED" : "CONFIRMED";

    const updated = updateUser(id, {
      attendanceStatus: validStatus,
      attendanceConfirmedAt: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "No se pudo actualizar el jurado." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: validStatus === "CONFIRMED" ? "✓ Asistencia confirmada con éxito." : "Asistencia declinada.",
      user: updated,
    });
  } catch (err: any) {
    console.error("[JUROR CONFIRM POST ERROR]", err);
    return NextResponse.json({ success: false, error: "Error interno al confirmar." }, { status: 500 });
  }
}
