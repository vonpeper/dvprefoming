import { NextRequest, NextResponse } from "next/server";
import { getEvolutionQRCode } from "@/features/messaging/services/evolution";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const instance = searchParams.get("instance") || undefined;
    const qrData = await getEvolutionQRCode(instance);

    return NextResponse.json(qrData);
  } catch (error: any) {
    console.error("[EVOLUTION QR API ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al solicitar código QR a Evolution API." },
      { status: 500 }
    );
  }
}
