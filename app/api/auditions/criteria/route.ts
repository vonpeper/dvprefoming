import { NextResponse } from "next/server";
import { getStoredCriteria, saveCriteria, deleteCriteria } from "@/lib/storage";
import { EvaluationDiscipline } from "@/types/mock";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const criteria = getStoredCriteria();
    return NextResponse.json({ success: true, criteria });
  } catch (error) {
    console.error("[CRITERIA API ERROR]", error);
    return NextResponse.json({ success: false, error: "Error al obtener criterios de evaluación" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, discipline, description, maxScore, order } = body;

    if (!name?.trim() || !discipline) {
      return NextResponse.json({ success: false, error: "El nombre y la disciplina son obligatorios." }, { status: 400 });
    }

    const saved = saveCriteria({
      id,
      name: name.trim(),
      discipline: discipline as EvaluationDiscipline,
      description: description || "",
      maxScore: Number(maxScore) || 10,
      order: order ? Number(order) : undefined,
    });

    return NextResponse.json({ success: true, criteria: saved });
  } catch (error) {
    console.error("[CRITERIA SAVE ERROR]", error);
    return NextResponse.json({ success: false, error: "Error al guardar criterio" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de criterio no proporcionado" }, { status: 400 });
    }

    const success = deleteCriteria(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("[CRITERIA DELETE ERROR]", error);
    return NextResponse.json({ success: false, error: "Error al eliminar criterio" }, { status: 500 });
  }
}
