import { NextRequest, NextResponse } from "next/server";
import { parseScriptText, parseScriptWithAI } from "@/lib/script-parser";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawText = "";
    let useAI = false;
    let fileName = "";
    let inferredTitle = "";
    let totalPages = 1;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      useAI = formData.get("useAI") === "true";
      const customTitle = formData.get("title") as string | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No se proporcionó ningún archivo de guion." },
          { status: 400 }
        );
      }

      fileName = file.name;
      inferredTitle = customTitle || fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();

      const isPdf = file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        const buffer = await file.arrayBuffer();
        const extracted = await extractText(new Uint8Array(buffer), { mergePages: true });
        totalPages = extracted.totalPages || 1;
        rawText =
          typeof extracted.text === "string"
            ? extracted.text
            : Array.isArray(extracted.text)
            ? (extracted.text as string[]).join("\n\n")
            : "";
      } else {
        rawText = await file.text();
      }
    } else {
      const body = await req.json();
      rawText = body.rawText || "";
      useAI = Boolean(body.useAI);
      inferredTitle = body.title || "";
    }

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return NextResponse.json(
        { success: false, error: "El archivo o texto no contiene líneas legibles. Asegúrate de que el PDF contenga texto seleccionable." },
        { status: 400 }
      );
    }

    const parsedResult = useAI
      ? await parseScriptWithAI(rawText)
      : parseScriptText(rawText);

    return NextResponse.json({
      success: true,
      data: parsedResult,
      rawText,
      inferredTitle,
      fileName,
      totalPages,
    });
  } catch (error: any) {
    console.error("[POST /api/scripts/parse ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar el guion." },
      { status: 500 }
    );
  }
}
