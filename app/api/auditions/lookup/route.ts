import { NextRequest, NextResponse } from "next/server";
import { getAuditionByFolioOrContact, getStoredProductions } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folio = searchParams.get("folio") || searchParams.get("q") || "";

    if (!folio.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresa tu número de folio o teléfono registrado." },
        { status: 400 }
      );
    }

    const audition = getAuditionByFolioOrContact(folio);

    if (!audition) {
      return NextResponse.json(
        { error: "No se encontró ningún registro con ese folio o datos. Verifica tu número e intenta nuevamente." },
        { status: 404 }
      );
    }

    // Attach production venue details
    const productions = getStoredProductions();
    const prod = productions.find(
      (p) => p.id === audition.productionId || p.title === audition.productionName
    ) || productions[0];

    const auditionNum = audition.folio.replace(/\D/g, "").slice(-4) || "585";

    return NextResponse.json({
      success: true,
      audition: {
        folio: audition.folio,
        auditionNumber: auditionNum,
        fullName: audition.fullName,
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
          name: prod?.venueName || "Auditorio Principal DV Performing Arts",
          address: prod?.venueAddress || "Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.",
          mapsUrl: prod?.venueMapsUrl || "https://maps.google.com/?q=Paseo+de+los+Insurgentes+1506+Leon+Guanajuato",
        },
        driveMaterialUrl: "https://drive.google.com/drive/folders/1qadnY5yaF1ZXprIXP5NY1cmAJkvQU08C?usp=drive_link",
        tips: [
          "Prepara una canción de teatro musical o contemporánea (1 minuto de duración).",
          "Trae tu pista preparada en tu celular.",
          "Usa ropa cómoda de trabajo escénico (habrá audición de baile tras el canto).",
          "Lleva una botella de agua y mantente hidratado(a).",
          "Acompañantes esperan en el área designada fuera de las instalaciones.",
        ],
      },
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
        { error: "Por favor ingresa tu número de folio o teléfono registrado." },
        { status: 400 }
      );
    }

    const audition = getAuditionByFolioOrContact(folio);

    if (!audition) {
      return NextResponse.json(
        { error: "No se encontró ningún registro con ese folio o datos. Verifica tu número e intenta nuevamente." },
        { status: 404 }
      );
    }

    const productions = getStoredProductions();
    const prod = productions.find(
      (p) => p.id === audition.productionId || p.title === audition.productionName
    ) || productions[0];

    const auditionNum = audition.folio.replace(/\D/g, "").slice(-4) || "585";

    return NextResponse.json({
      success: true,
      audition: {
        folio: audition.folio,
        auditionNumber: auditionNum,
        fullName: audition.fullName,
        productionName: audition.productionName || prod?.title || "Si No Es Ahora (El Musical)",
        programName: audition.programName || "Teatro Musical",
        status: audition.status,
        preferredSchedule: audition.preferredSchedule || "Turno Vespertino",
        createdAt: audition.createdAt,
        venue: {
          name: prod?.venueName || "Auditorio Principal DV Performing Arts",
          address: prod?.venueAddress || "Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.",
          mapsUrl: prod?.venueMapsUrl || "https://maps.google.com/?q=Paseo+de+los+Insurgentes+1506+Leon+Guanajuato",
        },
        driveMaterialUrl: "https://drive.google.com/drive/folders/1qadnY5yaF1ZXprIXP5NY1cmAJkvQU08C?usp=drive_link",
        tips: [
          "Prepara una canción de teatro musical o contemporánea (1 minuto de duración).",
          "Trae tu pista preparada en tu celular.",
          "Usa ropa cómoda de trabajo escénico (habrá audición de baile tras el canto).",
          "Lleva una botella de agua y mantente hidratado(a).",
          "Acompañantes esperan en el área designada fuera de las instalaciones.",
        ],
      },
    });
  } catch (error) {
    console.error("[AUDITION LOOKUP API ERROR]", error);
    return NextResponse.json(
      { error: "Error al consultar la audición." },
      { status: 500 }
    );
  }
}
