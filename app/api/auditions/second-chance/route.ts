import { NextRequest, NextResponse } from "next/server";
import { getStoredAuditions, bulkUpdateAuditionStatus } from "@/lib/storage";
import { sendSecondChanceVideoWhatsApp } from "@/features/messaging/services/evolution";
import { sendSecondChanceVideoEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      auditionIds,
      customMessage,
      secondChanceDate = "Próximo Sábado",
      secondChanceTime = "11:00 AM",
      sendWhatsApp = true,
      sendEmail = true,
    } = body;

    if (!Array.isArray(auditionIds) || auditionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debes seleccionar al menos un aspirante para enviar la 2da oportunidad." },
        { status: 400 }
      );
    }

    const allAuditions = getStoredAuditions();
    const targetAuditions = allAuditions.filter(
      (a) => auditionIds.includes(a.id) || auditionIds.includes(a.folio)
    );

    if (targetAuditions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se encontraron los aspirantes especificados." },
        { status: 404 }
      );
    }

    let whatsappSentCount = 0;
    let emailSentCount = 0;

    // Send notifications in parallel/sequence
    for (const applicant of targetAuditions) {
      const prodName = applicant.productionName || "Si No Es Ahora (El Musical)";

      // 1. WhatsApp Dispatch
      if (sendWhatsApp && applicant.phone) {
        try {
          const res = await sendSecondChanceVideoWhatsApp(
            {
              fullName: applicant.fullName,
              phone: applicant.phone,
              folio: applicant.folio,
              programName: applicant.programName || "Teatro Musical Integral",
              productionName: prodName,
              email: applicant.email,
              googleDriveUrl: applicant.googleDriveUrl,
            },
            {
              deadlineDate: secondChanceDate,
              deadlineTime: secondChanceTime,
            }
          );
          if (res.success) whatsappSentCount++;
        } catch (e) {
          console.error(`[2ND CHANCE WA ERROR ${applicant.folio}]`, e);
        }
      }

      // 2. Email Dispatch
      if (sendEmail && applicant.email) {
        try {
          const res = await sendSecondChanceVideoEmail(
            {
              fullName: applicant.fullName,
              phone: applicant.phone,
              folio: applicant.folio,
              programName: applicant.programName || "Teatro Musical Integral",
              productionName: prodName,
              email: applicant.email,
              googleDriveUrl: applicant.googleDriveUrl,
            },
            {
              deadlineDate: secondChanceDate,
              deadlineTime: secondChanceTime,
            }
          );
          if (res.success) emailSentCount++;
        } catch (e) {
          console.error(`[2ND CHANCE EMAIL ERROR ${applicant.folio}]`, e);
        }
      }
    }

    // Update applicants status to SECOND_CHANCE
    bulkUpdateAuditionStatus(auditionIds, "SECOND_CHANCE", {
      secondChanceDate,
      secondChanceTime,
    });

    return NextResponse.json({
      success: true,
      updatedCount: targetAuditions.length,
      whatsappSentCount,
      emailSentCount,
      message: `2ª Oportunidad enviada a ${targetAuditions.length} aspirante(s) (WhatsApp: ${whatsappSentCount}, Email: ${emailSentCount}). Estatus actualizado a 'SEGUNDA_OPORTUNIDAD'.`,
    });
  } catch (error: any) {
    console.error("[SECOND CHANCE API ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al procesar el envío de 2da oportunidad." },
      { status: 500 }
    );
  }
}
