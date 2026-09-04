import { NextRequest, NextResponse } from "next/server";
import { getStudentAuditionsHistory } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const results = getStudentAuditionsHistory(q);

    return NextResponse.json({
      success: true,
      students: results,
      totalStudents: results.length,
    });
  } catch (error: any) {
    console.error("[STUDENT HISTORY API ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar historial de aspirantes." },
      { status: 500 }
    );
  }
}
