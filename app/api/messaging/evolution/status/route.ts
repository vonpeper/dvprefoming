import { NextResponse } from "next/server";
import { checkEvolutionInstance } from "@/features/messaging/services/evolution";

export async function GET() {
  try {
    const status = await checkEvolutionInstance();
    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("[EVOLUTION STATUS API ERROR]", error);
    return NextResponse.json(
      { error: "Error al consultar estado de Evolution API." },
      { status: 500 }
    );
  }
}
