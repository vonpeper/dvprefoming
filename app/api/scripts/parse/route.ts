import { NextRequest, NextResponse } from "next/server";
import { parseScriptText, parseScriptWithAI } from "@/lib/script-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText, useAI } = body;

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return NextResponse.json(
        { success: false, error: "El texto del guion no puede estar vacío." },
        { status: 400 }
      );
    }

    const parsedResult = useAI
      ? await parseScriptWithAI(rawText)
      : parseScriptText(rawText);

    return NextResponse.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error("[POST /api/scripts/parse ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar el guion." },
      { status: 500 }
    );
  }
}
