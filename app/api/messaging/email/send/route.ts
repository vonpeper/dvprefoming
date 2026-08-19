import { NextRequest, NextResponse } from "next/server";
import { sendAuditionRegistrationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, fullName, productionName, folio } = body;

    if (!to) {
      return NextResponse.json({ error: "El correo destinatario es obligatorio." }, { status: 400 });
    }

    const res = await sendAuditionRegistrationEmail({
      fullName: fullName || "Aspirante de Prueba",
      email: to,
      folio: folio || "AUD-2026-DV-0585",
      auditionNumber: "585",
      productionName: productionName || "Si No Es Ahora (El Musical)",
      programName: "Teatro Musical Integral",
      preferredSchedule: "Turno Vespertino (16:00 - 20:00)",
    });

    if (res.success) {
      return NextResponse.json({
        success: true,
        messageId: res.messageId,
        simulated: res.simulated,
      });
    } else {
      return NextResponse.json({ error: res.error || "Error al enviar correo." }, { status: 500 });
    }
  } catch (error) {
    console.error("[TEST EMAIL API ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar envío de correo." },
      { status: 500 }
    );
  }
}
