import { NextRequest, NextResponse } from "next/server";
import { getNotificationSettings, saveNotificationSettings, NotificationSettings } from "@/lib/storage";

export async function GET() {
  try {
    const settings = getNotificationSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[MESSAGING SETTINGS GET ERROR]", error);
    return NextResponse.json(
      { error: "Error al obtener configuración de mensajería." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NotificationSettings;
    saveNotificationSettings(body);
    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    console.error("[MESSAGING SETTINGS POST ERROR]", error);
    return NextResponse.json(
      { error: "Error al guardar configuración de mensajería." },
      { status: 500 }
    );
  }
}
