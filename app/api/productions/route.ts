import { NextRequest, NextResponse } from "next/server";
import { getStoredProductions, saveProduction, deleteProduction, setActiveAuditionProduction } from "@/lib/storage";

export async function GET() {
  try {
    const productions = getStoredProductions();
    const activeAudition = productions.find((p) => p.isAuditionActive) || productions[0] || null;

    return NextResponse.json({
      success: true,
      productions,
      activeAudition,
    });
  } catch (error) {
    console.error("[PRODUCTIONS GET ERROR]", error);
    return NextResponse.json({ error: "Error al obtener producciones." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id } = body;

    if (action === "SET_ACTIVE_AUDITION" && id) {
      const active = setActiveAuditionProduction(id);
      return NextResponse.json({
        success: true,
        activeAudition: active,
      });
    }

    if (!body.title) {
      return NextResponse.json({ error: "El título de la obra es obligatorio." }, { status: 400 });
    }

    const saved = saveProduction(body);
    return NextResponse.json({
      success: true,
      production: saved,
    });
  } catch (error) {
    console.error("[PRODUCTIONS POST ERROR]", error);
    return NextResponse.json({ error: "Error al guardar la producción." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de producción requerido." }, { status: 400 });
    }

    const success = deleteProduction(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("[PRODUCTIONS DELETE ERROR]", error);
    return NextResponse.json({ error: "Error al eliminar la producción." }, { status: 500 });
  }
}
