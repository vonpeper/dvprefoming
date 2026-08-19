import { MessagePayload, SendMessageResult, AuditionNotificationData, EvolutionInstanceStatus } from "../types";

/**
 * Format phone number to international E.164 without leading plus
 * For Mexico (10 digits starting with e.g. 477), formats to 52477XXXXXXX
 */
export function formatMexicanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  
  // If 10 digits (Mexican local number), prepend 52
  if (cleaned.length === 10) {
    cleaned = `52${cleaned}`;
  }
  // If 12 digits starting with 521, remove the 1 for modern WhatsApp API (52XXXXXXXXXX)
  else if (cleaned.length === 13 && cleaned.startsWith("521")) {
    cleaned = `52${cleaned.substring(3)}`;
  }
  
  return cleaned;
}

/**
 * Sends a WhatsApp text message via Evolution API (or simulated in development)
 */
export async function sendWhatsAppMessage(payload: MessagePayload): Promise<SendMessageResult> {
  const apiUrl = process.env.EVOLUTION_API_URL?.trim();
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  const instance = process.env.EVOLUTION_INSTANCE?.trim() || "dv_instance";

  const formattedNumber = formatMexicanPhoneNumber(payload.to);
  const now = new Date().toISOString();

  // If credentials are not configured or are placeholder, perform clean simulated response
  if (!apiUrl || apiUrl.includes("example.com") || !apiKey || apiKey.includes("apikey_")) {
    console.log(`[EVOLUTION API SIMULATED] Message sent to ${formattedNumber}:`);
    console.log(payload.body);
    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      simulated: true,
      timestamp: now,
    };
  }

  try {
    const cleanUrl = apiUrl.replace(/\/$/, "");
    const endpoint = `${cleanUrl}/message/sendText/${instance}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
      },
      body: JSON.stringify({
        number: formattedNumber,
        text: payload.body,
        options: {
          delay: 1200,
          presence: "composing",
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[EVOLUTION API ERROR] ${res.status}: ${errorText}`);
      return {
        success: false,
        error: `Evolution API HTTP ${res.status}: ${errorText}`,
        timestamp: now,
      };
    }

    const data = await res.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.id || `msg_${Date.now()}`,
      simulated: false,
      timestamp: now,
    };
  } catch (error) {
    console.error("[EVOLUTION API EXCEPTION]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de conexión con Evolution API",
      timestamp: now,
    };
  }
}

/**
 * Builds and sends the official Audition Confirmation WhatsApp message
 */
export async function sendAuditionConfirmation(data: AuditionNotificationData): Promise<SendMessageResult> {
  const messageBody = `🎭 *¡REGISTRO CONFIRMADO A AUDICIONES DV PERFORMING ARTS!* 🎭

¡Hola *${data.fullName.trim()}*! Hemos recibido con éxito tu postulación para audicionar en DV Performing Arts.

📋 *Folio Único de Aspirante:* \`${data.folio}\`
🎬 *Obra / Montaje:* ${data.productionName || "Si No Es Ahora (El Musical)"}
🎭 *Disciplina / Taller:* ${data.programName}
📍 *Sede:* Paseo de los Insurgentes #1506, Col. Jardines del Moral, CP 37160, León, Gto.
⏰ *Turno / Horario:* ${data.auditionTime || "Horario de clases (L-V 16:00 - 20:00 / Sáb 10:00 - 15:00)"}

✨ *Recomendaciones esenciales para el día de tu audición:*
1. 🕒 *Puntualidad:* Llegar 15 minutos antes de tu cita programada.
2. 👕 *Vestuario:* Ropa cómoda de trabajo escénico (color negro de preferencia).
3. 🎵 *Canto / Teatro:* Traer pista musical descargada en tu dispositivo o memorizada.
4. 👟 *Danza:* Calzado adecuado según disciplina (tenis limpios o zapatillas) y botella de agua.
5. 📄 *Acceso:* Presenta tu Folio de aspirante (\`${data.folio}\`) al llegar a recepción.

Si requieres reagendar o tienes alguna duda, responde directamente a este WhatsApp o comunícate al 477 655 8156.

_DV Performing Arts &bull; Disciplina, Compromiso y Pasión._`;

  return sendWhatsAppMessage({
    to: data.phone,
    body: messageBody,
  });
}

/**
 * Builds and sends the Audition Reminder WhatsApp message (prior to audition day)
 */
export async function sendAuditionReminder(data: AuditionNotificationData): Promise<SendMessageResult> {
  const messageBody = `🔔 *RECORDATORIO DE AUDICIÓN &bull; DV PERFORMING ARTS*

Estimado/a *${data.fullName.trim()}*, te recordamos que tu audición para la obra *${data.productionName || "Si No Es Ahora"}* (${data.programName}) está programada:

📋 *Folio de Acceso:* \`${data.folio}\`
🎬 *Obra:* ${data.productionName || "Si No Es Ahora"}
📅 *Fecha:* ${data.auditionDate || "Próxima sesión de audiciones"}
⏰ *Horario:* ${data.auditionTime || "16:00 hrs"}
📍 *Ubicación:* Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.

Recuerda presentarte con ropa cómoda de trabajo escénico e hidratación. ¡Te esperamos para darlo todo en el escenario! 🌟`;

  return sendWhatsAppMessage({
    to: data.phone,
    body: messageBody,
  });
}

/**
 * Checks connectivity and state of Evolution API instance
 */
export async function checkEvolutionInstance(): Promise<EvolutionInstanceStatus> {
  const apiUrl = process.env.EVOLUTION_API_URL?.trim();
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  const instance = process.env.EVOLUTION_INSTANCE?.trim() || "dv_instance";

  if (!apiUrl || apiUrl.includes("example.com") || !apiKey || apiKey.includes("apikey_")) {
    return {
      connected: true,
      instanceName: instance,
      state: "open",
      profileName: "DV Performing Arts (Simulación Local)",
    };
  }

  try {
    const cleanUrl = apiUrl.replace(/\/$/, "");
    const res = await fetch(`${cleanUrl}/instance/connectionState/${instance}`, {
      method: "GET",
      headers: {
        "apikey": apiKey,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const state = data?.instance?.state || data?.state || "close";
      return {
        connected: state === "open",
        instanceName: instance,
        state: state === "open" ? "open" : state === "connecting" ? "connecting" : "close",
        profileName: "DV Performing Arts",
      };
    }
  } catch (err) {
    console.error("[EVOLUTION CHECK ERROR]", err);
  }

  return {
    connected: false,
    instanceName: instance,
    state: "close",
  };
}

/**
 * Fetches or generates the WhatsApp Connection QR code from Evolution API
 */
export async function getEvolutionQRCode(instanceName?: string): Promise<{
  success: boolean;
  pairingCode?: string;
  code?: string;
  base64?: string;
  error?: string;
}> {
  const apiUrl = process.env.EVOLUTION_API_URL?.trim();
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  const instance = instanceName || process.env.EVOLUTION_INSTANCE?.trim() || "dv_instance";

  if (!apiUrl || apiUrl.includes("example.com") || !apiKey || apiKey.includes("apikey_")) {
    // Return a mock base64 QR SVG for development preview
    return {
      success: true,
      pairingCode: "DVPA-2026",
      code: "2@demo_evolution_whatsapp_qr_code_dv_performing_arts",
      base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><rect width='240' height='240' fill='%23101017'/><rect x='20' y='20' width='60' height='60' fill='%2322C55E'/><rect x='30' y='30' width='40' height='40' fill='%23101017'/><rect x='40' y='40' width='20' height='20' fill='%2322C55E'/><rect x='160' y='20' width='60' height='60' fill='%2322C55E'/><rect x='170' y='30' width='40' height='40' fill='%23101017'/><rect x='180' y='40' width='20' height='20' fill='%2322C55E'/><rect x='20' y='160' width='60' height='60' fill='%2322C55E'/><rect x='30' y='170' width='40' height='40' fill='%23101017'/><rect x='40' y='180' width='20' height='20' fill='%2322C55E'/><circle cx='120' cy='120' r='18' fill='%23A855F7'/><text x='120' y='225' font-family='monospace' font-size='11' fill='%23FFFFFF' text-anchor='middle'>ESCANEAR CON WHATSAPP</text></svg>",
    };
  }

  try {
    const cleanUrl = apiUrl.replace(/\/$/, "");
    const res = await fetch(`${cleanUrl}/instance/connect/${instance}`, {
      method: "GET",
      headers: {
        "apikey": apiKey,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        pairingCode: data?.pairingCode,
        code: data?.code,
        base64: data?.base64,
      };
    } else {
      const errorText = await res.text();
      return {
        success: false,
        error: `HTTP ${res.status}: ${errorText}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Error al conectar con Evolution API para generar QR.",
    };
  }
}
