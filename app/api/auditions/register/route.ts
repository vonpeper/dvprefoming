import { NextRequest, NextResponse } from "next/server";
import { createAudition, updateAuditionStatus } from "@/lib/storage";
import { sendAuditionConfirmation } from "@/features/messaging/services/evolution";
import { sendAuditionRegistrationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      birthDate,
      age,
      productionId,
      productionName,
      programId,
      programName,
      experienceNotes,
      preferredSchedule,
    } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Nombre completo y teléfono/WhatsApp son obligatorios." },
        { status: 400 }
      );
    }

    // 1. Create audition in storage with atomic folio
    const audition = createAudition({
      fullName: String(fullName).trim(),
      email: String(email || "").trim(),
      phone: String(phone).trim(),
      birthDate: birthDate ? String(birthDate) : undefined,
      age: age || undefined,
      productionId: productionId || "prod_si_no_es_ahora",
      productionName: productionName || "Si No Es Ahora (El Musical)",
      programId: programId || "prog_teatro_musical",
      programName: programName || "Teatro Musical Integral",
      preferredSchedule: preferredSchedule || "Turno Vespertino (16:00 - 20:00)",
      experienceNotes: experienceNotes ? String(experienceNotes).trim() : "Sin experiencia previa indicada.",
      status: "PENDING_REVIEW",
    });

    let whatsappSent = false;
    let emailSent = false;

    // 2. Dispatch WhatsApp confirmation via Evolution API
    try {
      const whatsappResult = await sendAuditionConfirmation({
        fullName: audition.fullName,
        folio: audition.folio,
        productionName: audition.productionName || "Si No Es Ahora (El Musical)",
        programName: audition.programName || "Teatro Musical",
        phone: audition.phone,
        auditionTime: audition.preferredSchedule,
      });
      whatsappSent = Boolean(whatsappResult?.success);
    } catch (msgErr) {
      console.error("[WHATSAPP NOTIFICATION ERROR]", msgErr);
    }

    // 3. Dispatch Email confirmation via Google Workspace SMTP
    if (audition.email) {
      try {
        const emailResult = await sendAuditionRegistrationEmail({
          fullName: audition.fullName,
          email: audition.email,
          phone: audition.phone,
          folio: audition.folio,
          productionName: audition.productionName || "Si No Es Ahora (El Musical)",
          programName: audition.programName,
          preferredSchedule: audition.preferredSchedule,
        });
        emailSent = Boolean(emailResult?.success);
      } catch (mailErr) {
        console.error("[EMAIL NOTIFICATION ERROR]", mailErr);
      }
    }

    // Update notification flags
    updateAuditionStatus(audition.id, audition.status, undefined, whatsappSent, emailSent);

    return NextResponse.json({
      success: true,
      audition: {
        ...audition,
        whatsappNotified: whatsappSent,
        emailNotified: emailSent,
      },
      notifications: {
        whatsapp: whatsappSent,
        email: emailSent,
      },
    });
  } catch (error) {
    console.error("[AUDITION REGISTRATION API ERROR]", error);
    return NextResponse.json(
      { error: "Error al procesar el registro de audición." },
      { status: 500 }
    );
  }
}
