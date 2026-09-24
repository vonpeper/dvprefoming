import { NextRequest, NextResponse } from "next/server";
import { getStoredAuditions, getStoredProductions } from "@/lib/storage";
import { AuditionRegistration } from "@/types/mock";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pendiente de Audición",
  ATTENDED: "Evaluado por Jurado",
  APPROVED: "Aprobado (Elenco Oficial)",
  SECOND_CHANCE: "Segunda Oportunidad (Video)",
  NO_SHOW: "No Asistió",
  REJECTED: "No Seleccionado",
  BLACKLIST: "Lista Negra / Vetado",
  CONFIRMED: "Confirmado",
  DRAFT: "Borrador",
};

const CATEGORY_LABELS: Record<string, string> = {
  PROTAGONICO: "Protagónico",
  CO_PROTAGONICO: "Co-Protagónico",
  CUADRO_PRINCIPAL: "Cuadro Principal",
  ENSAMBLE: "Ensamble",
  SWING_COVER: "Swing / Cover",
  TALLER_FORMACION: "Taller de Formación",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productionId = searchParams.get("productionId") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    let auditions = getStoredAuditions();
    const productions = getStoredProductions();

    // Production Name lookup helper
    const getProdTitle = (a: AuditionRegistration) => {
      if (a.productionName) return a.productionName;
      const matched = productions.find((p) => p.id === a.productionId);
      return matched?.title || "Convocatoria DV";
    };

    // Filter by production
    if (productionId !== "ALL") {
      auditions = auditions.filter(
        (a) => a.productionId === productionId || a.productionName === productionId
      );
    }

    // Filter by status
    if (status !== "ALL") {
      auditions = auditions.filter((a) => a.status === status);
    }

    // Filter by search query
    if (q) {
      auditions = auditions.filter((a) => {
        const name = (a.fullName || "").toLowerCase();
        const phone = (a.phone || "").toLowerCase();
        const email = (a.email || "").toLowerCase();
        const folio = (a.folio || "").toLowerCase();
        return name.includes(q) || phone.includes(q) || email.includes(q) || folio.includes(q);
      });
    }

    // Column Headers
    const headers = [
      "Folio",
      "Número de Audición",
      "Obra / Convocatoria",
      "Nombre Completo",
      "Teléfono / WhatsApp",
      "Correo Electrónico",
      "Edad",
      "Fecha de Nacimiento",
      "Horario Preferido",
      "Estatus de Audición",
      "Calificación General (0-10)",
      "Calificación Canto (0-10)",
      "Calificación Danza / Coreografía (0-10)",
      "Calificación Actuación (0-10)",
      "Papel Asignado",
      "Categoría de Reparto",
      "Papel Deseado",
      "Rango Vocal",
      "Estilos de Danza",
      "Contacto de Emergencia",
      "Teléfono de Emergencia",
      "Parentesco",
      "Tipo de Sangre",
      "Condiciones Médicas / Alergias",
      "Notas de Experiencia",
      "Carpeta Google Drive Material",
      "Notificado WhatsApp",
      "Notificado Correo",
      "Fecha de Registro",
    ];

    // Build CSV Rows
    const rows = auditions.map((a) => {
      const regDate = a.createdAt
        ? new Date(a.createdAt).toLocaleString("es-MX", {
            timeZone: "America/Mexico_City",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      const birth = a.birthDate
        ? new Date(a.birthDate).toLocaleDateString("es-MX", {
            timeZone: "America/Mexico_City",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "";

      return [
        escapeCsv(a.folio || `DV-${a.auditionNumber || ""}`),
        escapeCsv(a.auditionNumber || ""),
        escapeCsv(getProdTitle(a)),
        escapeCsv(a.fullName || ""),
        escapeCsv(a.phone || ""),
        escapeCsv(a.email || ""),
        escapeCsv(a.age ?? ""),
        escapeCsv(birth),
        escapeCsv(a.preferredSchedule || ""),
        escapeCsv(STATUS_LABELS[a.status] || a.status),
        escapeCsv(a.overallScore !== undefined ? a.overallScore : ""),
        escapeCsv(a.cantoAverage !== undefined ? a.cantoAverage : ""),
        escapeCsv(a.danceAverage !== undefined ? a.danceAverage : ""),
        escapeCsv(a.actingAverage !== undefined ? a.actingAverage : ""),
        escapeCsv(a.assignedRole || ""),
        escapeCsv(a.castingCategory ? (CATEGORY_LABELS[a.castingCategory] || a.castingCategory) : ""),
        escapeCsv(a.desiredRole || ""),
        escapeCsv(a.vocalRange || ""),
        escapeCsv(Array.isArray(a.danceStyles) ? a.danceStyles.join(", ") : ""),
        escapeCsv(a.emergencyContactName || ""),
        escapeCsv(a.emergencyContactPhone || ""),
        escapeCsv(a.emergencyContactRelation || ""),
        escapeCsv(a.bloodType || ""),
        escapeCsv(a.medicalNotes || ""),
        escapeCsv(a.experienceNotes || ""),
        escapeCsv(a.googleDriveUrl || ""),
        escapeCsv(a.whatsappNotified ? "Sí" : "No"),
        escapeCsv(a.emailNotified ? "Sí" : "No"),
        escapeCsv(regDate),
      ].join(",");
    });

    // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows & Mac immediately recognizes Spanish characters
    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");

    const nowStr = new Date().toISOString().slice(0, 10);
    const filename = `audiciones_dv_performing_arts_${nowStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[AUDITIONS EXPORT ERROR]", error);
    return NextResponse.json({ error: "Error al exportar base de datos a Excel." }, { status: 500 });
  }
}
