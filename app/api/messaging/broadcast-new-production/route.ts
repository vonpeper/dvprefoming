import { NextRequest, NextResponse } from "next/server";
import { getStoredAuditions, getStoredProductions } from "@/lib/storage";
import { sendNewProductionBroadcastWhatsApp } from "@/features/messaging/services/evolution";
import { sendNewProductionBroadcastEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productionId, notifyWhatsApp = true, notifyEmail = true } = body;

    if (!productionId) {
      return NextResponse.json({ success: false, error: "ID de producción requerido." }, { status: 400 });
    }

    const productions = getStoredProductions();
    const prod = productions.find((p) => p.id === productionId);
    if (!prod) {
      return NextResponse.json({ success: false, error: "Producción no encontrada." }, { status: 404 });
    }

    const auditions = getStoredAuditions();

    // Deduplicate candidates by phone (or email)
    const uniqueCandidatesMap: Record<string, { fullName: string; phone: string; email: string }> = {};

    auditions.forEach((a) => {
      const key = a.phone.replace(/\D/g, "").slice(-10) || a.email.toLowerCase();
      if (key && !uniqueCandidatesMap[key]) {
        uniqueCandidatesMap[key] = {
          fullName: a.fullName,
          phone: a.phone,
          email: a.email,
        };
      }
    });

    const candidateList = Object.values(uniqueCandidatesMap);
    if (candidateList.length === 0) {
      return NextResponse.json({ success: false, error: "No hay aspirantes en la base de datos histórica." }, { status: 400 });
    }

    const registrationUrl = "https://prev.dvperformingarts.com/#audiciones";
    let sentCount = 0;

    for (const cand of candidateList) {
      if (notifyWhatsApp && cand.phone) {
        await sendNewProductionBroadcastWhatsApp({
          candidateName: cand.fullName,
          phone: cand.phone,
          productionTitle: prod.title,
          synopsis: prod.synopsis,
          auditionDates: prod.auditionDates,
          registrationUrl,
        }).catch((err) => console.error(`[BROADCAST WA ERROR] ${cand.fullName}:`, err));
      }

      if (notifyEmail && cand.email) {
        await sendNewProductionBroadcastEmail({
          candidateName: cand.fullName,
          email: cand.email,
          productionTitle: prod.title,
          synopsis: prod.synopsis,
          auditionDates: prod.auditionDates,
          registrationUrl,
          imageUrl: prod.imageUrl,
        }).catch((err) => console.error(`[BROADCAST EMAIL ERROR] ${cand.fullName}:`, err));
      }

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      message: `✓ Convocatoria de "${prod.title}" difundida con éxito a ${sentCount} aspirante(s) históricos.`,
      sentCount,
    });
  } catch (error: any) {
    console.error("[BROADCAST NEW PRODUCTION ERROR]", error);
    return NextResponse.json({ success: false, error: "Error interno al difundir convocatoria." }, { status: 500 });
  }
}
