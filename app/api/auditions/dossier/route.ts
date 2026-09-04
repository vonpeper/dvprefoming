import { NextRequest, NextResponse } from "next/server";
import { getStoredAuditions, updateAuditionTechnicalDossier } from "@/lib/storage";

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
      message: "Cédula técnica y ficha médica actualizada correctamente.",
    });
  } catch (error) {
    console.error("[POST AUDITION DOSSIER ERROR]", error);
    return NextResponse.json({ error: "Error al actualizar la cédula técnica." }, { status: 500 });
  }
}
