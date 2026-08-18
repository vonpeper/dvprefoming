import { NextRequest, NextResponse } from "next/server";
import { getStoredArticles, saveArticle, deleteArticle } from "@/lib/storage";

export async function GET() {
  try {
    const articles = getStoredArticles();
    return NextResponse.json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error("[ARTICLES GET ERROR]", error);
    return NextResponse.json({ error: "Error al obtener artículos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: "El título del artículo es obligatorio." }, { status: 400 });
    }

    const saved = saveArticle(body);
    return NextResponse.json({
      success: true,
      article: saved,
    });
  } catch (error) {
    console.error("[ARTICLES POST ERROR]", error);
    return NextResponse.json({ error: "Error al guardar artículo." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID de artículo requerido." }, { status: 400 });
    }

    const success = deleteArticle(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("[ARTICLES DELETE ERROR]", error);
    return NextResponse.json({ error: "Error al eliminar artículo." }, { status: 500 });
  }
}
