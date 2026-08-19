import { NextResponse } from "next/server";
import { assignRoleToApplicant, getStoredWebsiteContent, getNotificationSettings } from "@/lib/storage";
import { sendAuditionApprovalWhatsApp } from "@/features/messaging/services/evolution";
import { sendAuditionApprovalEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auditionId, assignedRole, notes, notifyWhatsApp = true, notifyEmail = true } = body;

    if (!auditionId || !assignedRole?.trim()) {
      return NextResponse.json(
        { success: false, error: "El ID del aspirante y el personaje asignado son obligatorios." },
        { status: 400 }
      );
    }

    const updated = assignRoleToApplicant(auditionId, assignedRole, notes);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Aspirante no encontrado." }, { status: 404 });
    }

    const content = getStoredWebsiteContent();
    const settings = getNotificationSettings();
    const driveLink = "https://drive.google.com/drive/folders/1qadnY5yaF1ZXprIXP5NY1cmAJkvQU08C?usp=drive_link";

    let whatsappResult = null;
    let emailResult = null;

    // 1. Send WhatsApp Notification with Assigned Role
    if (notifyWhatsApp && settings.whatsappNotificationsEnabled && updated.phone) {
      try {
        whatsappResult = await sendAuditionApprovalWhatsApp({
          fullName: updated.fullName,
          folio: updated.folio,
          programName: updated.programName || "Teatro Musical",
          productionName: updated.productionName || "Si No Es Ahora (El Musical)",
          phone: updated.phone,
          assignedRole: updated.assignedRole,
          overallScore: updated.overallScore,
          notes: updated.notes,
        });
      } catch (err) {
        console.error("[WHATSAPP ROLE NOTIFY ERROR]", err);
      }
    }

    // 2. Send Email Notification with Assigned Role
    if (notifyEmail && settings.emailNotificationsEnabled && updated.email) {
      try {
        emailResult = await sendAuditionApprovalEmail({
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          folio: updated.folio,
          auditionNumber: updated.auditionNumber,
          productionName: updated.productionName || "Si No Es Ahora (El Musical)",
          programName: updated.programName,
          assignedRole: updated.assignedRole,
          overallScore: updated.overallScore,
          googleDriveUrl: driveLink,
          notes: updated.notes,
        });
      } catch (err) {
        console.error("[EMAIL ROLE NOTIFY ERROR]", err);
      }
    }

    return NextResponse.json({
      success: true,
      audition: updated,
      whatsappResult,
      emailResult,
      message: `Personaje "${assignedRole.trim()}" asignado con éxito a ${updated.fullName}. Notificación enviada.`,
    });
  } catch (error) {
    console.error("[ASSIGN ROLE API ERROR]", error);
    return NextResponse.json({ success: false, error: "Error al asignar personaje" }, { status: 500 });
  }
}
