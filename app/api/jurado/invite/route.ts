import { NextRequest, NextResponse } from "next/server";
import { getStoredUsers, getStoredProductions } from "@/lib/storage";
import { sendJurorInvitationWhatsApp } from "@/features/messaging/services/evolution";
import { sendJurorInvitationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, notifyWhatsApp = true, notifyEmail = true } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID de usuario / jurado requerido." }, { status: 400 });
    }

    const users = getStoredUsers();
    const juror = users.find((u) => u.id === userId);
    if (!juror) {
      return NextResponse.json({ success: false, error: "Jurado no encontrado." }, { status: 404 });
    }

    const productions = getStoredProductions();
    const activeProd = productions.find((p) => p.isAuditionActive) || productions[0];

    const confirmationUrl = `https://prev.dvperformingarts.com/jurado/confirmar?id=${encodeURIComponent(juror.id)}`;
    const disciplineLabels: Record<string, string> = {
      CANTO: "Canto & Técnica Vocal",
      COREOGRAFIA: "Danza, Coreografía & Expresión Corporal",
      ACTUACION: "Actuación & Texto Teatral",
      ALL: "Evaluación Integral (Dirección General)",
    };

    const disciplineName = disciplineLabels[juror.assignedDiscipline || "CANTO"];

    if (notifyWhatsApp && juror.phone) {
      await sendJurorInvitationWhatsApp({
        teacherName: juror.fullName,
        phone: juror.phone,
        productionName: activeProd?.title || "Convocatoria 2026",
        discipline: disciplineName,
        auditionDate: activeProd?.auditionDates || "Próxima sesión de casting",
        venue: activeProd?.venueAddress || "Paseo de los Insurgentes #1506, León, Gto.",
        confirmationUrl,
      });
    }

    if (notifyEmail && juror.username && juror.username.includes("@")) {
      await sendJurorInvitationEmail({
        teacherName: juror.fullName,
        email: juror.username,
        productionName: activeProd?.title || "Convocatoria 2026",
        discipline: disciplineName,
        auditionDate: activeProd?.auditionDates || "Próxima sesión de casting",
        venue: activeProd?.venueAddress || "Paseo de los Insurgentes #1506, León, Gto.",
        confirmationUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: `✓ Invitación enviada con éxito a ${juror.fullName}.`,
      confirmationUrl,
    });
  } catch (error: any) {
    console.error("[JUROR INVITE ERROR]", error);
    return NextResponse.json({ success: false, error: "Error al enviar invitación al jurado." }, { status: 500 });
  }
}
