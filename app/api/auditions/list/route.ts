import { NextResponse } from "next/server";
import { getStoredAuditions } from "@/lib/storage";

export async function GET() {
  try {
    const auditions = getStoredAuditions();
    return NextResponse.json({
      success: true,
      auditions,
      count: auditions.length,
    });
  } catch (error) {
    console.error("[AUDITION LIST ERROR]", error);
    return NextResponse.json(
      { error: "Error al obtener lista de audiciones." },
      { status: 500 }
    );
  }
}
