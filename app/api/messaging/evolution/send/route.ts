import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/features/messaging/services/evolution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Destinatario (número) y mensaje son requeridos." },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({
      to: String(to).trim(),
      body: String(message).trim(),
    });

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (error) {
    console.error("[EVOLUTION SEND API ERROR]", error);
    return NextResponse.json(
      { error: "Error al enviar mensaje vía Evolution API." },
      { status: 500 }
    );
  }
}
