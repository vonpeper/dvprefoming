import { NextRequest, NextResponse } from "next/server";
import { getStoredUsers, createUser, updateUser, deleteUser } from "@/lib/storage";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("dv_admin_session")?.value;
    if (sessionCookie) {
      const auth = verifySessionToken(sessionCookie);
      if (!auth.valid) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
      }
    }

    const users = getStoredUsers();
    // Return sanitized users list
    const sanitized = users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      title: u.title || "",
      phone: u.phone || "",
      assignedDiscipline: u.assignedDiscipline || "ALL",
      attendanceStatus: u.attendanceStatus || "PENDING",
      attendanceConfirmedAt: u.attendanceConfirmedAt,
      status: u.status,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      hasPassword: Boolean(u.password),
    }));

    return NextResponse.json({ success: true, users: sanitized });
  } catch (error: any) {
    console.error("[GET USERS ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, fullName, role, password, title, status, phone, assignedDiscipline } = body;

    if (!username || !fullName || !password) {
      return NextResponse.json(
        { success: false, error: "Nombre completo, usuario/correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const newUser = createUser({
      username,
      fullName,
      role: role || "DOCENTE_JUEZ",
      password,
      title: title || "",
      status: status || "ACTIVE",
      phone: phone || "",
      assignedDiscipline: assignedDiscipline || "ALL",
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${newUser.fullName} creado exitosamente.`,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        title: newUser.title,
        phone: newUser.phone,
        assignedDiscipline: newUser.assignedDiscipline,
        attendanceStatus: newUser.attendanceStatus,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[POST USER ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear el usuario." },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, username, fullName, role, password, title, status, phone, assignedDiscipline } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El ID del usuario es obligatorio." },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (fullName !== undefined) updates.fullName = fullName;
    if (role !== undefined) updates.role = role;
    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status;
    if (phone !== undefined) updates.phone = phone;
    if (assignedDiscipline !== undefined) updates.assignedDiscipline = assignedDiscipline;
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." },
          { status: 400 }
        );
      }
      updates.password = password;
    }

    const updated = updateUser(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${updated.fullName} actualizado exitosamente.`,
      user: {
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        role: updated.role,
        title: updated.title,
        phone: updated.phone,
        assignedDiscipline: updated.assignedDiscipline,
        attendanceStatus: updated.attendanceStatus,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("[PUT USER ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar usuario." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de usuario no proporcionado." },
        { status: 400 }
      );
    }

    const ok = deleteUser(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado o no se pudo eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente del sistema.",
    });
  } catch (error: any) {
    console.error("[DELETE USER ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar usuario." },
      { status: 400 }
    );
  }
}
