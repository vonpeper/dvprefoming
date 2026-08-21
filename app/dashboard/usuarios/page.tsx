"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserRole } from "@/types/mock";

interface UserItem {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  title?: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  hasPassword?: boolean;
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserItem | null>(null);

  // Form State for Create / Edit User
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    role: "DOCENTE_JUEZ" as UserRole,
    title: "",
    password: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  // Form State for Password Change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI Feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data?.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        showToast("error", data?.error || "Error al cargar la lista de usuarios.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error de conexión al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      fullName: "",
      role: "DOCENTE_JUEZ",
      title: "",
      password: "",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      title: user.title || "",
      password: "", // Leave blank unless changing
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const openPasswordModal = (user: UserItem) => {
    setSelectedUserForPassword(user);
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim()) {
      showToast("error", "Nombre y correo/usuario son obligatorios.");
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      showToast("error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        // Update user
        const payload: any = {
          id: editingUser.id,
          username: formData.username,
          fullName: formData.fullName,
          role: formData.role,
          title: formData.title,
          status: formData.status,
        };
        if (formData.password && formData.password.trim().length >= 6) {
          payload.password = formData.password.trim();
        }

        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data?.success) {
          showToast("success", data.message || "Usuario actualizado.");
          setIsModalOpen(false);
          fetchUsers();
        } else {
          showToast("error", data?.error || "Error al actualizar usuario.");
        }
      } else {
        // Create user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data?.success) {
          showToast("success", data.message || "Usuario creado exitosamente.");
          setIsModalOpen(false);
          fetchUsers();
        } else {
          showToast("error", data?.error || "Error al crear usuario.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error de red al guardar el usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    if (newPassword.length < 6) {
      showToast("error", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUserForPassword.id,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        showToast("success", `Contraseña de ${selectedUserForPassword.fullName} actualizada correctamente.`);
        setIsPasswordModalOpen(false);
      } else {
        showToast("error", data?.error || "Error al cambiar contraseña.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error al procesar el cambio de contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        showToast("success", `Usuario ${user.fullName} ahora está ${newStatus === "ACTIVE" ? "Activo" : "Inactivo"}.`);
        fetchUsers();
      } else {
        showToast("error", data?.error || "Error al modificar estado.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error de red al cambiar estado.");
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar permanentemente al usuario "${user.fullName}" (${user.username})?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        showToast("success", data.message || "Usuario eliminado.");
        fetchUsers();
      } else {
        showToast("error", data?.error || "Error al eliminar usuario.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error de red al eliminar usuario.");
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.title && u.title.toLowerCase().includes(term));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // KPI Metrics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const judgeCount = users.filter((u) => u.role === "DOCENTE_JUEZ").length;
  const editorCount = users.filter((u) => u.role === "EDITOR").length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-500/50 text-emerald-200"
              : "bg-red-950 border-red-500/50 text-red-200"
          }`}
        >
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#30363D]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              Ajustes de Usuarios & Control de Acceso
            </h1>
            <span className="bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              {users.length} Registrados
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Administra los accesos al CMS, credenciales de Jurados y Maestros para la Mesa de Jueces, y Editores de Contenido.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 border border-[#30363D] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>🏠</span>
            <span>Dashboard Principal</span>
          </Link>

          <Link
            href="/jueces"
            className="px-3.5 py-2 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>⚖️</span>
            <span>Mesa de Jueces</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-950/50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>➕</span>
            <span>Dar de Alta Usuario</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Total Users */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Usuarios</span>
            <span>👥</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalUsers}</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">({activeCount} Activos)</span>
          </div>
        </div>

        {/* Administrators */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-purple-400 text-xs font-mono">
            <span>Administradores</span>
            <span>👑</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">{adminCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">Control Total</span>
          </div>
        </div>

        {/* Docentes / Jueces */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono">
            <span>Docentes / Jurado</span>
            <span>⚖️</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">{judgeCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">Evaluación en Vivo</span>
          </div>
        </div>

        {/* Editores */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-mono">
            <span>Editores</span>
            <span>✍️</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">{editorCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">CMS & Noticias</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Search */}
        <div className="flex-1 min-w-[240px] max-w-md relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Roles</option>
            <option value="ADMIN">👑 Administrador</option>
            <option value="DOCENTE_JUEZ">⚖️ Docente / Jurado</option>
            <option value="EDITOR">✍️ Editor de Prensa</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">● Activos</option>
            <option value="INACTIVE">● Inactivos</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 border border-[#30363D] rounded-xl text-xs transition-colors cursor-pointer"
            title="Recargar usuarios"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D1117] text-slate-400 font-mono text-[11px] uppercase border-b border-[#30363D]">
                <th className="py-3.5 px-4">Usuario & Nombre</th>
                <th className="py-3.5 px-4">Correo / Login</th>
                <th className="py-3.5 px-4 text-center">Rol de Acceso</th>
                <th className="py-3.5 px-4 text-center">Estatus</th>
                <th className="py-3.5 px-4 text-center">Último Acceso</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span>Cargando usuarios del sistema...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No se encontraron usuarios con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadges: Record<UserRole, { label: string; style: string }> = {
                    ADMIN: {
                      label: "👑 Administrador",
                      style: "bg-purple-950/80 text-purple-300 border-purple-500/40",
                    },
                    DOCENTE_JUEZ: {
                      label: "⚖️ Docente / Jurado",
                      style: "bg-amber-950/80 text-amber-300 border-amber-500/40",
                    },
                    EDITOR: {
                      label: "✍️ Editor Prensa",
                      style: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40",
                    },
                  };

                  const badge = roleBadges[user.role] || roleBadges.DOCENTE_JUEZ;

                  return (
                    <tr key={user.id} className="hover:bg-[#21262D]/50 transition-colors">
                      
                      {/* Name & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#21262D] border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-sm">{user.fullName}</span>
                            <span className="text-[11px] text-slate-400">{user.title || "Usuario del Sistema"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Login / Email */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded">
                          {user.username}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${badge.style}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          title="Clic para cambiar estado"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                          <span>{user.status === "ACTIVE" ? "Activo" : "Inactivo"}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                        {user.lastLogin ? (
                          new Date(user.lastLogin).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        ) : (
                          <span className="text-slate-600 italic">Sin actividad</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Change Password */}
                          <button
                            type="button"
                            onClick={() => openPasswordModal(user)}
                            className="p-1.5 bg-[#21262D] hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-[#30363D] hover:border-purple-500/50 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Cambiar contraseña"
                          >
                            🔑
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-1.5 bg-[#21262D] hover:bg-[#30363D] text-slate-300 hover:text-white border border-[#30363D] rounded-lg text-xs transition-colors cursor-pointer"
                            title="Editar usuario"
                          >
                            ✏️
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-500/30 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: CREATE / EDIT USER ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border-2 border-[#30363D] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 animate-fade-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{editingUser ? "✏️" : "➕"}</span>
                <h3 className="text-base font-bold text-white">
                  {editingUser ? `Editar Usuario: ${editingUser.fullName}` : "Dar de Alta Nuevo Usuario"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4 text-xs">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej. Fanny Monroy"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                  required
                />
              </div>

              {/* Username / Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Correo o Usuario de Inicio de Sesión *</label>
                <input
                  type="text"
                  placeholder="Ej. fanny@dvperformingarts.com o fanny"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-purple-300 font-mono font-bold focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500">
                  Este es el identificador con el que el usuario iniciará sesión en el sistema.
                </span>
              </div>

              {/* Title / Position */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Título / Especialidad Teatral</label>
                <input
                  type="text"
                  placeholder="Ej. Maestra de Canto & Técnica Vocal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Rol de Acceso en la Plataforma *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ADMIN", label: "👑 Admin", desc: "Control Total" },
                    { id: "DOCENTE_JUEZ", label: "⚖️ Jurado", desc: "Mesa de Calificación" },
                    { id: "EDITOR", label: "✍️ Editor", desc: "CMS & Noticias" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id as UserRole })}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        formData.role === r.id
                          ? "bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-950/50"
                          : "bg-[#0D1117] border-[#30363D] text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <span>{r.label}</span>
                      <span className="text-[9px] font-mono text-slate-400">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password (Required for new, optional for edit) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">
                  {editingUser ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña Inicial *"}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? "••••••••••••" : "Mínimo 6 caracteres"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required={!editingUser}
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 pt-1">
                <label className="font-semibold text-slate-300">Estado de la Cuenta:</label>
                <div className="flex items-center gap-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "ACTIVE" })}
                    className={`px-3 py-1 rounded-lg border font-bold text-xs transition-colors cursor-pointer ${
                      formData.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                        : "bg-[#0D1117] text-slate-400 border-[#30363D]"
                    }`}
                  >
                    ● Activo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "INACTIVE" })}
                    className={`px-3 py-1 rounded-lg border font-bold text-xs transition-colors cursor-pointer ${
                      formData.status === "INACTIVE"
                        ? "bg-red-950 text-red-300 border-red-500"
                        : "bg-[#0D1117] text-slate-400 border-[#30363D]"
                    }`}
                  >
                    ● Inactivo
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#30363D]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingUser ? "Guardar Cambios" : "Crear Usuario"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHANGE PASSWORD ================= */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border-2 border-[#30363D] rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 animate-fade-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h3 className="text-base font-bold text-white">
                  Cambiar Contraseña: {selectedUserForPassword.fullName}
                </h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 text-xs">
              <p className="text-slate-400">
                Ingresa la nueva contraseña para el usuario <strong className="text-purple-300 font-mono">{selectedUserForPassword.username}</strong>:
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Nueva Contraseña (mínimo 6 caracteres) *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#30363D]">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Actualizar Contraseña</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
