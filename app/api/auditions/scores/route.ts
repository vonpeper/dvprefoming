import { NextResponse } from "next/server";
import { getStoredAuditions, getStoredUsers, saveAuditionScore } from "@/lib/storage";
import { EvaluationDiscipline } from "@/types/mock";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const auditionId = searchParams.get("auditionId");

    const auditions = getStoredAuditions();

    if (auditionId) {
      const found = auditions.find((a) => a.id === auditionId || a.folio === auditionId);
      if (!found) {
        return NextResponse.json({ success: false, error: "Aspirante no encontrado" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        audition: found,
        scores: found.scores || [],
        cantoAverage: found.cantoAverage,
        danceAverage: found.danceAverage,
        actingAverage: found.actingAverage,
        overallScore: found.overallScore,
      });
    }

    return NextResponse.json({ success: true, auditions });
  } catch (error) {
    console.error("[SCORES GET ERROR]", error);
    return NextResponse.json({ success: false, error: "Error al consultar calificaciones" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auditionId, judgeName, judgeTitle, discipline, scores, judgeNotes } = body;

    if (!auditionId || !judgeName?.trim() || !discipline || !scores) {
      return NextResponse.json(
        { success: false, error: "Faltan datos obligatorios para registrar la calificación." },
        { status: 400 }
      );
    }

    // Validate juror authorization
    const users = getStoredUsers();
    const cleanJudgeName = judgeName.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.fullName.toLowerCase() === cleanJudgeName || u.username.toLowerCase() === cleanJudgeName
    );

    if (matchedUser) {
      if (matchedUser.role === "ALUMNO") {
        return NextResponse.json(
          { success: false, error: "Los alumnos no pueden emitir calificaciones de jurado." },
          { status: 403 }
        );
      }
      if (matchedUser.role === "MAESTRO" && !matchedUser.isJuror) {
        return NextResponse.json(
          { success: false, error: "Esta cuenta de maestro no cuenta con la etiqueta de Jurado Calificador activa." },
          { status: 403 }
        );
      }
    }

    const saved = saveAuditionScore({
      auditionId,
      judgeName: judgeName.trim(),
      judgeTitle: judgeTitle || "Juez Evaluador",
      discipline: discipline as EvaluationDiscipline,
      scores,
      judgeNotes,
    });

    if (!saved) {
      return NextResponse.json({ success: false, error: "Aspirante no encontrado para calificar." }, { status: 404 });
    }

    // Return updated audition
    const auditions = getStoredAuditions();
    const updatedAudition = auditions.find((a) => a.id === auditionId || a.folio === auditionId);

    return NextResponse.json({
      success: true,
      score: saved,
      audition: updatedAudition,
    });
  } catch (error) {
    console.error("[SCORES POST ERROR]", error);
    return NextResponse.json({ success: false, error: "Error al guardar calificación del juez" }, { status: 500 });
  }
}
