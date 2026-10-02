import { NextRequest, NextResponse } from "next/server";
import { getScriptById, saveScript, deleteScript } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const script = getScriptById(id);

    if (!script) {
      return NextResponse.json(
        { success: false, error: "Guion no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      script,
    });
  } catch (error: any) {
    console.error("[GET /api/scripts/[id] ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener el guion." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getScriptById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Guion no encontrado." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updated = saveScript({
      ...existing,
      ...body,
      id, // garantizar que no cambie el id
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      script: updated,
      message: "Guion actualizado exitosamente.",
    });
  } catch (error: any) {
    console.error("[PUT /api/scripts/[id] ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar el guion." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteScript(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "No se encontró el guion para eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Guion eliminado correctamente.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/scripts/[id] ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar el guion." },
      { status: 500 }
    );
  }
}
