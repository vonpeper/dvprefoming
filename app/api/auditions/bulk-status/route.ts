import { NextRequest, NextResponse } from "next/server";
import { bulkUpdateAuditionStatus, markNoShowsForProduction, bulkDeleteAuditions } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, status, productionId, reason, secondChanceDate, secondChanceTime } = body;

    // 1. Automatic detection of No-Shows (alumnos con 0 calificaciones)
    if (action === "DETECT_NO_SHOWS") {
      const result = markNoShowsForProduction(productionId);
      return NextResponse.json({
        success: true,
        action: "DETECT_NO_SHOWS",
        markedCount: result.markedCount,
        message: `Se han detectado y marcado ${result.markedCount} aspirante(s) como 'No Asistió'.`,
      });
    }

    // 2. Bulk Deletion of Auditions
    if (action === "DELETE") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { success: false, error: "Debes seleccionar al menos un aspirante para eliminar." },
          { status: 400 }
        );
      }
      const result = bulkDeleteAuditions(ids);
      return NextResponse.json({
        success: true,
        action: "DELETE",
        deletedCount: result.deletedCount,
        message: `Se eliminaron ${result.deletedCount} registro(s) de aspirante(s) correctamente.`,
      });
    }

    // 3. Bulk status update for list of IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debes seleccionar al menos un aspirante." },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Debes especificar el nuevo estatus." },
        { status: 400 }
      );
    }

    const result = bulkUpdateAuditionStatus(ids, status, {
      reason,
      secondChanceDate,
      secondChanceTime,
    });

    return NextResponse.json({
      success: true,
      successCount: result.successCount,
      status,
      message: `${result.successCount} aspirante(s) actualizados a '${status}'.`,
    });
  } catch (error: any) {
    console.error("[BULK STATUS ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al actualizar estatus masivo." },
      { status: 500 }
    );
  }
}
