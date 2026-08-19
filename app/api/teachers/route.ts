import { NextRequest, NextResponse } from "next/server";
import { getStoredTeachers, saveStoredTeachers, inferTeacherDiscipline } from "@/lib/storage";
import { Teacher } from "@/types/mock";

export async function GET() {
  try {
    const teachers = getStoredTeachers();
    const formatted = teachers.map((t) => ({
      ...t,
      defaultDiscipline: inferTeacherDiscipline(t),
    }));

    return NextResponse.json({
      success: true,
      teachers: formatted,
    });
  } catch (error) {
    console.error("[TEACHERS GET ERROR]", error);
    return NextResponse.json({ error: "Error al obtener planta docente." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const teachers: Teacher[] = Array.isArray(body) ? body : body.teachers;

    if (!teachers || !Array.isArray(teachers)) {
      return NextResponse.json(
        { error: "Arreglo de maestros inválido." },
        { status: 400 }
      );
    }

    saveStoredTeachers(teachers);

    return NextResponse.json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error("[TEACHERS POST ERROR]", error);
    return NextResponse.json({ error: "Error al guardar maestros." }, { status: 500 });
  }
}
