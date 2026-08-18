import { NextRequest, NextResponse } from "next/server";
import { getStoredMediaItems, deleteMediaItem } from "@/lib/media-storage";

export async function GET() {
  try {
    const items = getStoredMediaItems();
    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("[MEDIA GET ERROR]", error);
    return NextResponse.json({ error: "Error al obtener la biblioteca multimedia." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de imagen requerido." }, { status: 400 });
    }

    const success = deleteMediaItem(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("[MEDIA DELETE ERROR]", error);
    return NextResponse.json({ error: "Error al eliminar la imagen." }, { status: 500 });
  }
}
