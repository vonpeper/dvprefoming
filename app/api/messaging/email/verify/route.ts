import { NextRequest, NextResponse } from "next/server";
import { verifySmtpConnection } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await verifySmtpConnection({
      host: body?.smtpHost,
      port: body?.smtpPort ? Number(body.smtpPort) : undefined,
      user: body?.smtpUser,
      pass: body?.smtpPassword,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[SMTP VERIFY API ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error inesperado al verificar SMTP.",
        message: "No se pudo completar la verificación del servidor de correo.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await verifySmtpConnection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error",
      },
      { status: 500 }
    );
  }
}
