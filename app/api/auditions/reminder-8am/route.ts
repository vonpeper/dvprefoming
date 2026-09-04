import { NextRequest, NextResponse } from "next/server";
import { getStoredAuditions, getStoredProductions, saveStoredAuditions } from "@/lib/storage";
import { sendAuditionMorningReminderWhatsApp } from "@/features/messaging/services/evolution";
import { sendAuditionMorningReminderEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditionId, auditionIds, productionId, notifyWhatsApp = true, notifyEmail = true } = body;

    const auditions = getStoredAuditions();
    const productions = getStoredProductions();

    // Determine target auditions
    let targetAuditions = auditions;
    if (auditionId) {
      targetAuditions = auditions.filter((a) => a.id === auditionId);
    } else if (Array.isArray(auditionIds) && auditionIds.length > 0) {
      targetAuditions = auditions.filter((a) => auditionIds.includes(a.id));
    } else if (productionId && productionId !== "ALL") {
      targetAuditions = auditions.filter((a) => a.productionId === productionId);
    }

    if (targetAuditions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se encontraron aspirantes para enviar recordatorio." },
        { status: 400 }
      );
    }

    let sentCount = 0;
    const now = new Date().toISOString();

    for (const aud of targetAuditions) {
      const matchedProd = productions.find(
        (p) => p.id === aud.productionId || p.title === aud.productionName || p.isAuditionActive
      ) || productions[0];

      const notificationData = {
        fullName: aud.fullName,
        folio: aud.folio,
        programName: aud.programName || "Teatro Musical Integral",
        productionName: aud.productionName || matchedProd?.title || "DV Performing Arts",
        googleDriveUrl: aud.googleDriveUrl || matchedProd?.driveFolderUrl || "",
        phone: aud.phone,
        email: aud.email,
        auditionDate: aud.preferredSchedule || "Hoy en el horario asignado",
        auditionTime: aud.preferredSchedule || "16:00 hrs",
        venueName: matchedProd?.venueName || "Auditorio DV Performing Arts",
        venueAddress: matchedProd?.venueAddress || "Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.",
        venueMapsUrl: matchedProd?.venueMapsUrl || "https://maps.app.goo.gl/yQ3q4o1N1XnF4qL99",
      };

      if (notifyWhatsApp && aud.phone) {
        await sendAuditionMorningReminderWhatsApp(notificationData).catch((err) =>
          console.error(`[REMINDER WA ERROR] ${aud.fullName}:`, err)
        );
      }

      if (notifyEmail && aud.email) {
        await sendAuditionMorningReminderEmail(notificationData).catch((err) =>
          console.error(`[REMINDER EMAIL ERROR] ${aud.fullName}:`, err)
        );
      }

      // Mark notified
      const idx = auditions.findIndex((a) => a.id === aud.id);
      if (idx !== -1) {
        auditions[idx].reminder8amNotifiedAt = now;
      }
      sentCount++;
    }

    saveStoredAuditions(auditions);

    return NextResponse.json({
      success: true,
      message: `✓ Recordatorio matutino enviado a ${sentCount} aspirante(s).`,
      sentCount,
    });
  } catch (error: any) {
    console.error("[REMINDER 8AM API ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar recordatorios matutinos." },
      { status: 500 }
    );
  }
}
