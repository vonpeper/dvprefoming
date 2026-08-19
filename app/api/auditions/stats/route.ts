import { NextRequest, NextResponse } from "next/server";
import { getAuditionStats } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productionId = searchParams.get("productionId") || undefined;

    const stats = getAuditionStats(productionId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("[AUDITION STATS ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error al calcular estadísticas de audiciones." },
      { status: 500 }
    );
  }
}
