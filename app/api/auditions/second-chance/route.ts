import { NextRequest, NextResponse } from "next/server";
import { getStoredAuditions, bulkUpdateAuditionStatus, getNotificationSettings } from "@/lib/storage";
import { sendWhatsAppMessage } from "@/features/messaging/services/evolution";
import { getEmailTransporter } from "@/lib/email";

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

    const settings = getNotificationSettings();
    const fromAddress = settings.smtpFrom || process.env.SMTP_FROM || '"DV Performing Arts" <contacto@dvperformingarts.com>';
    const transporter = getEmailTransporter();

    let whatsappSentCount = 0;
    let emailSentCount = 0;

    // Send notifications in parallel/sequence
    for (const applicant of targetAuditions) {
      const prodName = applicant.productionName || "Si No Es Ahora (El Musical)";

      // 1. WhatsApp Dispatch
      if (sendWhatsApp && applicant.phone) {
        const wpText = customMessage
          ? customMessage
              .replace(/{nombre}/gi, applicant.fullName)
              .replace(/{folio}/gi, applicant.folio)
              .replace(/{obra}/gi, prodName)
              .replace(/{fecha}/gi, secondChanceDate)
              .replace(/{hora}/gi, secondChanceTime)
          : `🎭 *DV PERFORMING ARTS • 2ª OPORTUNIDAD DE AUDICIÓN* 🎭\n\n` +
            `Hola *${applicant.fullName}* 👋,\n\n` +
            `Notamos que no pudiste presentarte a tu audición para la obra *"${prodName}"* (Folio: \`${applicant.folio}\`).\n\n` +
            `En DV Performing Arts sabemos que surgen imprevistos y queremos darte una *Segunda Oportunidad* para que muestres tu talento ante el jurado:\n\n` +
            `📅 *Nueva Fecha:* ${secondChanceDate}\n` +
            `⏰ *Horario:* ${secondChanceTime}\n` +
            `📍 *Sede:* Auditorio Principal DV Performing Arts\n\n` +
            `💡 *¿Qué necesitas preparar?*\n` +
            `• 1 canción de 1 minuto con pista en tu celular.\n` +
            `• Ropa cómoda para evaluación coreográfica.\n\n` +
            `📲 *Por favor responde a este mensaje confirmando tu asistencia* con la palabra *CONFIRMAR* o *DECLINAR* si no podrás participar.\n\n` +
            `¡Mucho éxito, te esperamos en el escenario!\n` +
            `_Dirección General • DV Performing Arts_`;

        try {
          const res = await sendWhatsAppMessage({
            to: applicant.phone,
            body: wpText,
          });
          if (res.success) whatsappSentCount++;
        } catch (e) {
          console.error(`[2ND CHANCE WA ERROR ${applicant.folio}]`, e);
        }
      }

      // 2. Email Dispatch
      if (sendEmail && applicant.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0E0E14; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #242436;">
            <div style="background: linear-gradient(135deg, #7C3AED, #E11D48); padding: 30px 20px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; text-transform: uppercase;">2ª Oportunidad de Audición</h1>
              <p style="color: #FEE2E2; margin: 5px 0 0 0; font-size: 14px;">${prodName}</p>
            </div>
            <div style="padding: 30px 25px; line-height: 1.6; font-size: 14px; color: #D1D5DB;">
              <p>Hola <strong style="color: #FFFFFF;">${applicant.fullName}</strong>,</p>
              <p>Notamos que no pudiste presentarte a tu audición con Folio <strong style="color: #F43F5E;">${applicant.folio}</strong>.</p>
              <p>Queremos abrirte una <strong>Segunda Oportunidad</strong> para que presentes tu prueba ante el jurado calificador:</p>
              <div style="background: #181824; border: 1px solid #3B3B54; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;">📅 <strong>Fecha:</strong> ${secondChanceDate}</p>
                <p style="margin: 0 0 8px 0;">⏰ <strong>Horario:</strong> ${secondChanceTime}</p>
                <p style="margin: 0;">📍 <strong>Lugar:</strong> Auditorio DV Performing Arts</p>
              </div>
              <p>Por favor confirma tu asistencia respondiendo a nuestro WhatsApp oficial o a este correo.</p>
              <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF;">DV Performing Arts • Academia y Compañía de Teatro Musical</p>
            </div>
          </div>
        `;

        try {
          await transporter.sendMail({
            from: fromAddress,
            to: applicant.email,
            subject: `🎭 2ª Oportunidad de Audición: ${prodName} (Folio: ${applicant.folio})`,
            html: emailHtml,
            text: `Hola ${applicant.fullName}, te ofrecemos una segunda oportunidad de audición para ${prodName} el día ${secondChanceDate} a las ${secondChanceTime}. Folio: ${applicant.folio}`,
          });
          emailSentCount++;
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
