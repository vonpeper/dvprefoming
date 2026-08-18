import { NextRequest, NextResponse } from "next/server";
import { getStoredWebsiteContent, saveStoredWebsiteContent } from "@/lib/storage";

export async function GET() {
  try {
    const content = getStoredWebsiteContent();
    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("[PAGES CONTENT GET ERROR]", error);
    return NextResponse.json({ error: "Error al obtener contenido de páginas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    saveStoredWebsiteContent(body);
    return NextResponse.json({
      success: true,
      content: body,
    });
  } catch (error) {
    console.error("[PAGES CONTENT POST ERROR]", error);
    return NextResponse.json({ error: "Error al guardar contenido de páginas." }, { status: 500 });
  }
}
