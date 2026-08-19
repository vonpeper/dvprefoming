import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      programId,
      programName,
      amountMxn,
      studentName,
      studentEmail,
      studentPhone,
      type = "SUBSCRIPTION",
    } = body;

    if (!programName || !amountMxn) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios (programName o amountMxn)" },
        { status: 400 }
      );
    }

    const session = await createStripeCheckoutSession({
      programId: programId || "prog_general",
      programName,
      amountMxn: Number(amountMxn),
      studentName,
      studentEmail,
      studentPhone,
      type,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.sessionId,
      isLive: session.isLive,
    });
  } catch (error: any) {
    console.error("[STRIPE CHECKOUT ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Error al generar la sesión de pago con Stripe." },
      { status: 500 }
    );
  }
}
