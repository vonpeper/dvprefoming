import { NextRequest, NextResponse } from "next/server";
import { getStoredScripts, saveScript, getStoredProductions } from "@/lib/storage";
import { parseScriptText, parseScriptWithAI } from "@/lib/script-parser";
import { Script } from "@/types/script";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productionId = searchParams.get("productionId");

    let scripts = getStoredScripts();
    if (productionId) {
      scripts = scripts.filter((s) => s.productionId === productionId);
    }

    return NextResponse.json({
      success: true,
      scripts,
    });
  } catch (error: any) {
    console.error("[GET /api/scripts ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al listar guiones." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      productionId,
      productionTitle,
      description,
      rawText,
      useAI,
      characters: customCharacters,
      lines: customLines,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "El título del guion es obligatorio." },
        { status: 400 }
      );
    }

    let finalCharacters = customCharacters || [];
    let finalLines = customLines || [];

    // Si viene texto plano para parsear automáticamente
    if ((!finalLines || finalLines.length === 0) && rawText && rawText.trim()) {
      const parsed = useAI
        ? await parseScriptWithAI(rawText)
        : parseScriptText(rawText);

      finalCharacters = parsed.characters;
      finalLines = parsed.lines;
    }

    // Resolver título de producción si no vino en el body
    let resolvedProdTitle = productionTitle;
    if (!resolvedProdTitle && productionId) {
      const prods = getStoredProductions();
      const matched = prods.find((p) => p.id === productionId);
      if (matched) resolvedProdTitle = matched.title;
    }

    const scriptToSave: Partial<Script> = {
      title: title.trim(),
      productionId: productionId || "",
      productionTitle: resolvedProdTitle || "Producción DV",
      description: description || "",
      characters: finalCharacters,
      lines: finalLines,
      totalLines: finalLines.length,
      status: "PUBLISHED",
    };

    const saved = saveScript(scriptToSave);

    return NextResponse.json({
      success: true,
      script: saved,
      message: `Guion "${saved.title}" guardado exitosamente con ${saved.characters.length} personajes y ${saved.totalLines} líneas.`,
    });
  } catch (error: any) {
    console.error("[POST /api/scripts ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al guardar el guion." },
      { status: 500 }
    );
  }
}
