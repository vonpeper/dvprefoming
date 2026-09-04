import { NextRequest, NextResponse } from "next/server";
import {
  getStoredAuditions,
  updateAuditionTechnicalDossier,
  deleteAudition,
  deleteStudentAuditions,
} from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const folio = searchParams.get("folio");

    if (!id && !folio) {
      return NextResponse.json({ error: "Parámetro 'id' o 'folio' requerido." }, { status: 400 });
    }

    const auditions = getStoredAuditions();
    const audition = auditions.find(
      (a) => (id && a.id === id) || (folio && a.folio.toLowerCase() === folio.toLowerCase())
    );

    if (!audition) {
      return NextResponse.json({ error: "Cédula técnica de aspirante no encontrada." }, { status: 404 });
    }

    // Also find all other auditions for this student (using studentFolio or phone)
    const studentHistory = auditions.filter(
      (a) =>
        (audition.studentFolio && a.studentFolio === audition.studentFolio) ||
        (audition.phone && a.phone.replace(/\D/g, "").slice(-10) === audition.phone.replace(/\D/g, "").slice(-10))
    );

    return NextResponse.json({
      success: true,
      audition,
      studentHistory,
    });
  } catch (error) {
    console.error("[GET AUDITION DOSSIER ERROR]", error);
    return NextResponse.json({ error: "Error al consultar la cédula técnica del aspirante." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de registro de audición requerido." }, { status: 400 });
    }

    const updated = updateAuditionTechnicalDossier(id, dataToUpdate);

    if (!updated) {
      return NextResponse.json({ error: "Aspirante no encontrado para actualizar." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      audition: updated,
      message: "Cédula técnica y datos del aspirante actualizados correctamente.",
    });
  } catch (error) {
    console.error("[POST AUDITION DOSSIER ERROR]", error);
    return NextResponse.json({ error: "Error al actualizar la cédula técnica." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let studentFolio = searchParams.get("studentFolio");
    let phone = searchParams.get("phone");

    // Also check body if not in query params
    if (!id && !studentFolio && !phone) {
      try {
        const body = await req.json();
        if (body.id) id = body.id;
        if (body.studentFolio) studentFolio = body.studentFolio;
        if (body.phone) phone = body.phone;
      } catch {
        // Body was empty
      }
    }

    // 1. Delete by full student expediente
    if (studentFolio || phone) {
      const target = studentFolio || phone || "";
      const result = deleteStudentAuditions(target);
      return NextResponse.json({
        success: true,
        message: `Se eliminaron ${result.deletedCount} registro(s) del expediente del estudiante.`,
        deletedCount: result.deletedCount,
      });
    }

    // 2. Delete single audition record
    if (id) {
      const ok = deleteAudition(id);
      if (!ok) {
        return NextResponse.json({ error: "Registro de audición no encontrado para eliminar." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Registro de audición eliminado correctamente.",
      });
    }

    return NextResponse.json(
      { error: "Se requiere parámetro 'id' o 'studentFolio' para eliminar." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[DELETE AUDITION DOSSIER ERROR]", error);
    return NextResponse.json({ error: "Error al eliminar registro de audición." }, { status: 500 });
  }
}
