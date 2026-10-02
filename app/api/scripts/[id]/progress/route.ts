import { NextRequest, NextResponse } from "next/server";
import {
  getStudentScriptProgress,
  saveStudentScriptProgress,
  getStoredScriptProgressList,
  getScriptById,
} from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scriptId } = await params;
    const { searchParams } = new URL(req.url);
    const studentFolio = searchParams.get("studentFolio");

    if (studentFolio) {
      const studentProgress = getStudentScriptProgress(scriptId, studentFolio);
      return NextResponse.json({
        success: true,
        progress: studentProgress,
      });
    }

    const allScriptProgress = getStoredScriptProgressList(scriptId);
    return NextResponse.json({
      success: true,
      progressList: allScriptProgress,
    });
  } catch (error: any) {
    console.error("[GET /api/scripts/[id]/progress ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener el progreso." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scriptId } = await params;
    const script = getScriptById(scriptId);

    if (!script) {
      return NextResponse.json(
        { success: false, error: "Guion no encontrado." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      studentFolio,
      studentName,
      characterName,
      linesLearned,
      accuracyRate,
      practiceTimeMinutes,
      lineFeedback,
    } = body;

    if (!studentFolio || !studentFolio.trim()) {
      return NextResponse.json(
        { success: false, error: "El folio o identificador de alumno es obligatorio." },
        { status: 400 }
      );
    }

    // Calcular total de líneas del personaje en la obra
    const characterInfo = script.characters.find(
      (c) =>
        c.name.trim().toLowerCase() === (characterName || "").trim().toLowerCase() ||
        c.normalizedName === (characterName || "").trim().toUpperCase()
    );
    const totalLinesForChar = characterInfo
      ? characterInfo.totalLinesCount
      : script.lines.filter(
          (l) =>
            l.characterName.trim().toLowerCase() ===
            (characterName || "").trim().toLowerCase()
        ).length;

    const savedProgress = saveStudentScriptProgress({
      scriptId,
      studentFolio: studentFolio.trim(),
      studentName: studentName || "Alumno DV",
      characterName: characterName || "",
      linesLearned: linesLearned || [],
      totalLines: totalLinesForChar || 1,
      accuracyRate: typeof accuracyRate === "number" ? accuracyRate : 100,
      practiceTimeMinutes: practiceTimeMinutes || 1,
      totalSessions: 1,
      lineFeedback: lineFeedback || {},
    });

    return NextResponse.json({
      success: true,
      progress: savedProgress,
      message: "Progreso de estudio registrado correctamente.",
    });
  } catch (error: any) {
    console.error("[POST /api/scripts/[id]/progress ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al registrar el progreso." },
      { status: 500 }
    );
  }
}
