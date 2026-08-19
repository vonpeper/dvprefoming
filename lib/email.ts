import nodemailer from "nodemailer";
import { getNotificationSettings } from "@/lib/storage";

export interface AuditionEmailData {
  fullName: string;
  email: string;
  phone?: string;
  folio: string;
  auditionNumber?: string | number;
  productionName: string;
  programName?: string;
  preferredSchedule?: string;
  auditionDate?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapsUrl?: string;
  googleDriveUrl?: string;
  assignedRole?: string;
  overallScore?: number;
  notes?: string;
}

/**
 * Creates Nodemailer Transporter using Google Workspace SMTP or environment variables
 */
export function getEmailTransporter() {
  const settings = getNotificationSettings();
  
  const host = settings.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(settings.smtpPort || process.env.SMTP_PORT || 465);
  const secure = port === 465;
  const user = settings.smtpUser || process.env.SMTP_USER || "contacto@dvperformingarts.com";
  const pass = process.env.SMTP_PASSWORD || process.env.GOOGLE_WORKSPACE_APP_PASSWORD || "";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends HTML Email for Audition Registration Confirmation
 */
export async function sendAuditionRegistrationEmail(data: AuditionEmailData): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const settings = getNotificationSettings();

  if (!settings.emailNotificationsEnabled) {
    console.log("[EMAIL SKIPPED] Email notifications are paused in settings.");
    return { success: true, simulated: true };
  }

  const driveLink = data.googleDriveUrl || settings.googleDriveMaterialUrl || "https://drive.google.com/drive/folders/1qadnY5yaF1ZXprIXP5NY1cmAJkvQU08C?usp=drive_link";
  const auditionNum = data.auditionNumber || data.folio.replace(/\D/g, "").slice(-4) || "585";
  const fromAddress = settings.smtpFrom || process.env.SMTP_FROM || '"DV Performing Arts" <contacto@dvperformingarts.com>';

  // Check if SMTP password is provided, otherwise log simulated delivery in development
  const pass = process.env.SMTP_PASSWORD || process.env.GOOGLE_WORKSPACE_APP_PASSWORD;
  if (!pass) {
    console.log(`[EMAIL SIMULATED - NO SMTP_PASSWORD] Sending audition confirmation to: ${data.email}`);
    return { success: true, messageId: `sim_mail_${Date.now()}`, simulated: true };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Audición - DV Performing Arts</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07070A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07070A; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0E0E14; border: 1px solid #262638; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.8);">
          
          <!-- Header Banner with Logo -->
          <tr>
            <td align="center" style="background: linear-gradient(180deg, #181028 0%, #0E0E14 100%); padding: 35px 25px 25px 25px; border-bottom: 1px solid #262638;">
              <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #E11D48; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: 8px;">
                ● CONVOCATORIA DE CASTING OFICIAL
              </span>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #FFFFFF; text-transform: uppercase;">
                DV PERFORMING ARTS
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #A1A1AA;">
                Academia Integral de Teatro Musical • León, Guanajuato
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 35px 25px 35px;">
              
              <!-- Greeting & Hero Message -->
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #FFFFFF;">
                ¡Hola, ${data.fullName.trim()}! 👋
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #E4E4E7;">
                <strong>¡Ya diste el primer paso!</strong> Es hora de preparar la canción y el material que te ayudará a obtener el papel de tus sueños sobre el escenario.
              </p>

              <!-- Audition Number Highlight Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; background: linear-gradient(135deg, #1C0F24 0%, #2A0E1C 100%); border: 2px solid #E11D48; border-radius: 18px; text-align: center;">
                <tr>
                  <td style="padding: 24px 20px;">
                    <span style="font-family: monospace; font-size: 12px; font-weight: bold; color: #F43F5E; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 6px;">
                      Tu número de audición para "${data.productionName}" es:
                    </span>
                    <div style="font-size: 44px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-shadow: 0 4px 20px rgba(225,29,72,0.6);">
                      ${auditionNum}
                    </div>
                    <span style="display: inline-block; margin-top: 8px; font-family: monospace; font-size: 11px; color: #D4D4D8; background-color: rgba(0,0,0,0.5); padding: 4px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);">
                      Folio Oficial: ${data.folio}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Tips & Instructions Section -->
              <h3 style="margin: 28px 0 14px 0; font-size: 15px; font-weight: 800; color: #F43F5E; text-transform: uppercase; letter-spacing: 1px;">
                💡 Consejos & Requisitos para el día de la audición:
              </h3>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #14141E; border: 1px solid #28283C; border-radius: 16px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <ul style="margin: 0; padding-left: 18px; color: #D4D4D8; font-size: 13.5px; line-height: 1.7;">
                      <li style="margin-bottom: 8px;">
                        <strong style="color: #FFFFFF;">Canción:</strong> Prepara una canción de teatro musical o contemporánea (1 minuto de duración).
                      </li>
                      <li style="margin-bottom: 8px;">
                        <strong style="color: #FFFFFF;">Pista musical:</strong> Trae tu pista preparada. Puedes reproducirla directamente desde tu celular.
                      </li>
                      <li style="margin-bottom: 8px;">
                        <strong style="color: #FFFFFF;">Vestimenta:</strong> Usa ropa cómoda. Después del canto habrá audición de baile. <em>NO tienes que preparar ninguna coreografía previa</em>.
                      </li>
                      <li style="margin-bottom: 8px;">
                        <strong style="color: #FFFFFF;">Hidratación:</strong> Lleva una botella de agua y mantente hidratadx con pequeños sorbos.
                      </li>
                      <li style="margin-bottom: 8px;">
                        <strong style="color: #FFFFFF;">Enfoque:</strong> Si estás nerviosx, respira profundo y recuerda que estás haciendo algo que amas.
                      </li>
                      <li>
                        <strong style="color: #FFFFFF;">Acompañantes:</strong> No podrás entrar acompañado al salón de audición, pero podrán esperarte en el área designada fuera de las instalaciones.
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Drive Download Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0 20px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="${driveLink}" target="_blank" style="display: inline-block; background: linear-gradient(90deg, #9333EA 0%, #E11D48 100%); color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 14px; box-shadow: 0 10px 25px rgba(225,29,72,0.4); text-transform: uppercase; letter-spacing: 1px;">
                      📁 Ver Material de Audición en Google Drive ↗
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Online Status Check Link -->
              <p style="text-align: center; margin: 15px 0 30px 0; font-size: 12px; color: #A1A1AA;">
                ¿Deseas consultar o recordar el estado de tu folio? 
                <a href="https://prev.dvperformingarts.com/audiciones/consulta?folio=${data.folio}" target="_blank" style="color: #F43F5E; text-decoration: underline;">
                  Revisa tu audición en línea aquí
                </a>
              </p>

              <!-- Director's Signature -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #262638; padding-top: 25px; margin-top: 25px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #E4E4E7; font-style: italic;">
                      Todo lo mejor,
                    </p>
                    <p style="margin: 0; font-size: 16px; font-weight: 800; color: #FFFFFF;">
                      Diego Vieyra
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #E11D48; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Director General & Artístico
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #A1A1AA;">
                      DV Performing Arts • León, Gto.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td align="center" style="background-color: #07070A; padding: 25px 20px; border-top: 1px solid #1F1F2C; font-size: 11px; color: #71717A; font-family: monospace;">
              <p style="margin: 0 0 8px 0;">
                Sede Oficial: Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.
              </p>
              <p style="margin: 0;">
                WhatsApp de Atención: 
                <a href="https://wa.me/524776558156" style="color: #9333EA; text-decoration: none;">477 655 8156</a> 
                &bull; © 2026 DV Performing Arts.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getEmailTransporter();
    const info = await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: `🎭 Confirmación de Registro a Audición • Folio #${auditionNum} | "${data.productionName}"`,
      html: htmlContent,
    });

    console.log(`[EMAIL SENT] Audition confirmation to ${data.email} messageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (error) {
    console.error("[EMAIL SEND EXCEPTION]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar correo por Google Workspace",
    };
  }
}

/**
 * Sends HTML Email for Audition Approval / Successful Casting News
 */
export async function sendAuditionApprovalEmail(data: AuditionEmailData): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const settings = getNotificationSettings();

  if (!settings.emailNotificationsEnabled) {
    console.log("[EMAIL SKIPPED] Email notifications are paused in settings.");
    return { success: true, simulated: true };
  }

  const auditionNum = data.auditionNumber || data.folio.replace(/\D/g, "").slice(-4) || "585";
  const fromAddress = settings.smtpFrom || process.env.SMTP_FROM || '"DV Performing Arts" <contacto@dvperformingarts.com>';

  const pass = process.env.SMTP_PASSWORD || process.env.GOOGLE_WORKSPACE_APP_PASSWORD;
  if (!pass) {
    console.log(`[EMAIL SIMULATED - NO SMTP_PASSWORD] Sending audition approval to: ${data.email}`);
    return { success: true, messageId: `sim_appr_${Date.now()}`, simulated: true };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Felicidades! Audición Aprobada - DV Performing Arts</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07070A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07070A; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0E0E14; border: 2px solid #10B981; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 60px rgba(16,185,129,0.3);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(180deg, #064E3B 0%, #0E0E14 100%); padding: 35px 25px 25px 25px; border-bottom: 1px solid #1F3A2E;">
              <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #34D399; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: 8px;">
                ★ RESULTADO DE CASTING OFICIAL
              </span>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #FFFFFF; text-transform: uppercase;">
                ¡AUDICIÓN EXITOSA!
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #A7F3D0; font-weight: 600;">
                Has sido seleccionado(a) para formar parte de la producción
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 35px 25px 35px;">
              
              <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">
                ¡Muchas Felicidades, ${data.fullName.trim()}! 🌟
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #E4E4E7;">
                Nos complace informarte que la Dirección Artística de <strong>DV Performing Arts</strong> ha <strong>APROBADO</strong> tu audición (Folio #${auditionNum}) para la obra <strong>"${data.productionName}"</strong>.
              </p>

              <!-- Congratulatory Badge -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; background: #064E3B; border: 1px solid #10B981; border-radius: 16px; text-align: center;">
                <tr>
                  <td style="padding: 20px;">
                    <span style="font-size: 18px; font-weight: 900; color: #FFFFFF; display: block;">
                      ESTATUS: CASTING APROBADO ✅
                    </span>
                    <span style="font-size: 13px; color: #A7F3D0; margin-top: 4px; display: block;">
                      Producción: ${data.productionName} &bull; Folio: ${data.folio}
                    </span>
                    ${
                      data.assignedRole
                        ? `<div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px dashed #34D399; border-radius: 12px;">
                            <span style="font-size: 11px; color: #A7F3D0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block;">
                              ★ PERSONAJE / ROL ASIGNADO:
                            </span>
                            <span style="font-size: 20px; font-weight: 900; color: #FBBF24; display: block; margin-top: 4px;">
                              ${data.assignedRole.trim().toUpperCase()}
                            </span>
                          </div>`
                        : ""
                    }
                    ${
                      data.overallScore !== undefined && data.overallScore > 0
                        ? `<span style="display: inline-block; margin-top: 10px; font-size: 12px; color: #E4E4E7; font-family: monospace; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px;">
                            Puntaje Jurado: <strong>${data.overallScore} / 10 ⭐</strong>
                          </span>`
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- Direct Platform Consultation Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="https://prev.dvperformingarts.com/audiciones/consulta?folio=${encodeURIComponent(data.folio)}" target="_blank" style="display: inline-block; background: linear-gradient(90deg, #9333EA 0%, #E11D48 100%); color: #FFFFFF; font-size: 15px; font-weight: 900; text-decoration: none; padding: 18px 36px; border-radius: 16px; box-shadow: 0 10px 30px rgba(225,29,72,0.5); text-transform: uppercase; letter-spacing: 1px;">
                      🔍 Consultar mi Estatus & Libreto en la Web ↗
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h3 style="margin: 28px 0 14px 0; font-size: 14px; font-weight: 800; color: #34D399; text-transform: uppercase; letter-spacing: 1px;">
                📋 Siguientes Pasos para tu Integración:
              </h3>
              
              <ul style="margin: 0 0 25px 0; padding-left: 18px; color: #D4D4D8; font-size: 13.5px; line-height: 1.7;">
                <li style="margin-bottom: 8px;">
                  <strong>Confirmación de Rol / Horarios:</strong> El equipo de producción se comunicará contigo vía WhatsApp para asignarte el llamado a reunión de elenco y entrega de libreto.
                </li>
                <li style="margin-bottom: 8px;">
                  <strong>Enrolamiento & Ficha Médica:</strong> Completa tu proceso de inscripción en la sede oficial de la academia.
                </li>
                <li>
                  <strong>Inicio de Ensayos:</strong> Consulta el calendario oficial con tu director de área.
                </li>
              </ul>

              <!-- WhatsApp Direct Coordinator Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0 20px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20recib%C3%AD%20mi%20confirmaci%C3%B3n%20de%20audici%C3%B3n%20aprobada%20para%20${encodeURIComponent(data.productionName)}%20(Folio:%20${data.folio})" target="_blank" style="display: inline-block; background: #10B981; color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 14px; box-shadow: 0 10px 25px rgba(16,185,129,0.4); text-transform: uppercase; letter-spacing: 1px;">
                      💬 Contactar Coordinación por WhatsApp ↗
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Director's Signature -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #262638; padding-top: 25px; margin-top: 25px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #E4E4E7; font-style: italic;">
                      ¡Bienvenidx al elenco!,
                    </p>
                    <p style="margin: 0; font-size: 16px; font-weight: 800; color: #FFFFFF;">
                      Diego Vieyra
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #34D399; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Director General & Artístico
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #A1A1AA;">
                      DV Performing Arts • León, Gto.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td align="center" style="background-color: #07070A; padding: 25px 20px; border-top: 1px solid #1F1F2C; font-size: 11px; color: #71717A; font-family: monospace;">
              <p style="margin: 0;">
                DV PERFORMING ARTS &bull; PASIÓN, DISCIPLINA Y ESCENARIO EN LEÓN, GTO.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getEmailTransporter();
    const info = await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: `🎉 ¡Audición Exitosa! Has sido Aprobado(a) para "${data.productionName}" | Folio #${auditionNum}`,
      html: htmlContent,
    });

    console.log(`[EMAIL SENT] Audition approval to ${data.email} messageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (error) {
    console.error("[EMAIL SEND EXCEPTION]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar correo de aprobación",
    };
  }
}
