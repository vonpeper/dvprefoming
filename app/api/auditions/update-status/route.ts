import { NextRequest, NextResponse } from "next/server";
import { updateAuditionStatus, getStoredAuditions } from "@/lib/storage";
import {
  sendAuditionReminder,
  sendAuditionConfirmation,
  sendAuditionApprovalWhatsApp,
} from "@/features/messaging/services/evolution";
import { sendAuditionApprovalEmail, sendAuditionRegistrationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, action, notifyCandidate } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de registro requerido." }, { status: 400 });
    }

    const auditions = getStoredAuditions();
    const existing = auditions.find((a) => a.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Aspirante no encontrado." }, { status: 404 });
    }

    let whatsappSent = existing.whatsappNotified || false;
    let emailSent = existing.emailNotified || false;

    const newStatus = status || existing.status;
    const shouldNotifyApproval =
      (newStatus === "APPROVED" && existing.status !== "APPROVED") ||
      action === "APPROVE_AND_NOTIFY" ||
      notifyCandidate;

    // 1. If approving candidate, dispatch approval email & WhatsApp
    if (shouldNotifyApproval) {
      // WhatsApp
      try {
        const wpRes = await sendAuditionApprovalWhatsApp({
          fullName: existing.fullName,
          folio: existing.folio,
          productionName: existing.productionName || "Si No Es Ahora (El Musical)",
          programName: existing.programName || "Teatro Musical",
          phone: existing.phone,
          auditionTime: existing.preferredSchedule,
        });
        if (wpRes.success) whatsappSent = true;
      } catch (err) {
        console.error("[WHATSAPP APPROVAL ERROR]", err);
      }

      // Email
      if (existing.email) {
        try {
          const mailRes = await sendAuditionApprovalEmail({
            fullName: existing.fullName,
            email: existing.email,
            phone: existing.phone,
            folio: existing.folio,
            productionName: existing.productionName || "Si No Es Ahora (El Musical)",
            programName: existing.programName,
          });
          if (mailRes.success) emailSent = true;
        } catch (err) {
          console.error("[EMAIL APPROVAL ERROR]", err);
        }
      }
    } else if (action === "SEND_REMINDER") {
      try {
        const wpRes = await sendAuditionReminder({
          fullName: existing.fullName,
          folio: existing.folio,
          productionName: existing.productionName || "Si No Es Ahora",
          programName: existing.programName || "Teatro Musical",
          phone: existing.phone,
          auditionTime: existing.preferredSchedule,
        });
        if (wpRes.success) whatsappSent = true;
      } catch (err) {
        console.error("[WHATSAPP REMINDER ERROR]", err);
      }
    } else if (action === "RESEND_CONFIRMATION") {
      try {
        const wpRes = await sendAuditionConfirmation({
          fullName: existing.fullName,
          folio: existing.folio,
          productionName: existing.productionName || "Si No Es Ahora",
          programName: existing.programName || "Teatro Musical",
          phone: existing.phone,
          auditionTime: existing.preferredSchedule,
        });
        if (wpRes.success) whatsappSent = true;
      } catch (err) {
        console.error("[WHATSAPP RESEND ERROR]", err);
      }

      if (existing.email) {
        try {
          const mailRes = await sendAuditionRegistrationEmail({
            fullName: existing.fullName,
            email: existing.email,
            phone: existing.phone,
            folio: existing.folio,
            productionName: existing.productionName || "Si No Es Ahora (El Musical)",
          });
          if (mailRes.success) emailSent = true;
        } catch (err) {
          console.error("[EMAIL RESEND ERROR]", err);
        }
      }
    }

    const updated = updateAuditionStatus(
      id,
      newStatus,
      notes,
      whatsappSent,
      emailSent
    );

    return NextResponse.json({
      success: true,
      audition: updated,
      notifications: {
        whatsapp: whatsappSent,
        email: emailSent,
      },
    });
  } catch (error) {
    console.error("[AUDITION UPDATE STATUS ERROR]", error);
    return NextResponse.json(
      { error: "Error al actualizar estado del aspirante." },
      { status: 500 }
    );
  }
}
