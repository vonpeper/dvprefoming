import { NextRequest, NextResponse } from "next/server";
import { getAllAuditionsByFolioOrContact, getStoredProductions } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatAuditionForLookup(audition: any, productions: any[]) {
  const prod = productions.find(
    (p) => p.id === audition.productionId || p.title === audition.productionName
  ) || productions[0];

  const auditionNum = audition.folio ? audition.folio.replace(/\D/g, "").slice(-4) : "585";

  return {
    id: audition.id,
    folio: audition.folio,
    studentFolio: audition.studentFolio,
    auditionNumber: auditionNum,
    fullName: audition.fullName,
    headshotUrl: audition.headshotUrl,
    productionId: audition.productionId,
    productionName: audition.productionName || prod?.title || "Si No Es Ahora (El Musical)",
    programName: audition.programName || "Teatro Musical",
    status: audition.status,
    assignedRole: audition.assignedRole,
    overallScore: audition.overallScore,
    cantoAverage: audition.cantoAverage,
    danceAverage: audition.danceAverage,
    actingAverage: audition.actingAverage,
    preferredSchedule: audition.preferredSchedule || "Turno Vespertino",
    createdAt: audition.createdAt,
    venue: {
      name: prod?.venueName || "DV Performing Arts",
      address: prod?.venueAddress || "Pio XII 335, San Jeronimo II, León, Gto.",
      mapsUrl: prod?.venueMapsUrl || "https://maps.app.goo.gl/swd5UQsA5ALzEh2i6",
    },
    driveMaterialUrl: "https://drive.google.com/drive/folders/1qadnY5yaF1ZXprIXP5NY1cmAJkvQU08C?usp=drive_link",
    tips: [
      "Prepara una canción de teatro musical o contemporánea (1 minuto de duración).",
      "Trae tu pista preparada en tu celular.",
      "Usa ropa cómoda de trabajo escénico (habrá audición de baile tras el canto).",
      "Lleva una botella de agua y mantente hidratado(a).",
      "Acompañantes esperan en el área designada fuera de las instalaciones.",
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folio = searchParams.get("folio") || searchParams.get("q") || searchParams.get("query") || "";

    if (!folio.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresa tu número de folio (ej. DV-xxxx) o tu teléfono de 10 dígitos registrado." },
        { status: 400 }
      );
    }

    const matches = getAllAuditionsByFolioOrContact(folio);

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "No se encontró ningún registro con ese folio o teléfono. Verifica tus 10 dígitos o tu folio DV-xxxx e intenta nuevamente." },
        { status: 404 }
      );
    }

    const productions = getStoredProductions();
    const formattedList = matches.map((a) => formatAuditionForLookup(a, productions));

    return NextResponse.json({
      success: true,
      auditions: formattedList,
      audition: formattedList[0],
      totalFound: formattedList.length,
    });
  } catch (error) {
    console.error("[AUDITION LOOKUP API ERROR]", error);
    return NextResponse.json(
      { error: "Error al consultar la audición." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const folio = body?.folio || body?.query || "";

    if (!folio.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresa tu número de folio (ej. DV-xxxx) o tu teléfono de 10 dígitos registrado." },
        { status: 400 }
      );
    }

    const matches = getAllAuditionsByFolioOrContact(folio);

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "No se encontró ningún registro con ese folio o teléfono. Verifica tus 10 dígitos o tu folio DV-xxxx e intenta nuevamente." },
        { status: 404 }
      );
    }

    const productions = getStoredProductions();
    const formattedList = matches.map((a) => formatAuditionForLookup(a, productions));

    return NextResponse.json({
      success: true,
      auditions: formattedList,
      audition: formattedList[0],
      totalFound: formattedList.length,
    });
  } catch (error) {
    console.error("[AUDITION LOOKUP API ERROR]", error);
    return NextResponse.json(
      { error: "Error al consultar la audición." },
      { status: 500 }
    );
  }
}
