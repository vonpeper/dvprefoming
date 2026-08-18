import { NextRequest, NextResponse } from "next/server";
import { updateAuditionStatus, getStoredAuditions } from "@/lib/storage";
import { sendAuditionReminder, sendAuditionConfirmation } from "@/features/messaging/services/evolution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, action } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de registro requerido." }, { status: 400 });
    }

    const auditions = getStoredAuditions();
    const existing = auditions.find((a) => a.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Aspirante no encontrado." }, { status: 404 });
    }

    let whatsappResult = null;

    // Optional manual action to send reminder or resend confirmation
    if (action === "SEND_REMINDER") {
      whatsappResult = await sendAuditionReminder({
        fullName: existing.fullName,
        folio: existing.folio,
        programName: existing.programName || "Teatro Musical",
        phone: existing.phone,
        auditionTime: existing.preferredSchedule,
      });
    } else if (action === "RESEND_CONFIRMATION") {
      whatsappResult = await sendAuditionConfirmation({
        fullName: existing.fullName,
        folio: existing.folio,
        programName: existing.programName || "Teatro Musical",
        phone: existing.phone,
        auditionTime: existing.preferredSchedule,
      });
    }

    const updated = updateAuditionStatus(
      id,
      status || existing.status,
      notes,
      whatsappResult?.success ? true : existing.whatsappNotified
    );

    return NextResponse.json({
      success: true,
      audition: updated,
      whatsappResult,
    });
  } catch (error) {
    console.error("[AUDITION UPDATE STATUS ERROR]", error);
    return NextResponse.json(
      { error: "Error al actualizar estado del aspirante." },
      { status: 500 }
    );
  }
}
