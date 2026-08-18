import { NextRequest, NextResponse } from "next/server";
import { processAndSaveImage } from "@/lib/media-storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo de imagen." }, { status: 400 });
    }

    const uploadedItems = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue;
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const item = await processAndSaveImage(buffer, file.name);
      uploadedItems.push(item);
    }

    if (uploadedItems.length === 0) {
      return NextResponse.json({ error: "El archivo no es una imagen válida." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      files: uploadedItems,
      file: uploadedItems[0], // Single upload convenience
    });
  } catch (error) {
    console.error("[MEDIA UPLOAD API ERROR]", error);
    return NextResponse.json(
      { error: "Error al procesar y optimizar la imagen." },
      { status: 500 }
    );
  }
}
