"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Script } from "@/types/script";
import { RehearsalBetaSettings } from "@/lib/storage";

interface AuthUser {
  username: string;
  fullName: string;
  role: string;
  studentFolio?: string;
  subscriptionStatus?: string;
  hasPaidSubscription?: boolean;
  betaAccess?: boolean;
}

export default function EstudiantesGuionesCatalogPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [betaSettings, setBetaSettings] = useState<RehearsalBetaSettings | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Scripts catalog state
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(true);

  // Check current session
  const verifySession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    verifySession();

    // Fetch scripts and beta settings
    Promise.all([fetch("/api/scripts"), fetch("/api/scripts/settings")])
      .then(async ([resScripts, resSettings]) => {
        const dataScripts = await resScripts.json();
        const dataSettings = await resSettings.json();
        if (dataScripts.success) setScripts(dataScripts.scripts || []);
        if (dataSettings.success) setBetaSettings(dataSettings.settings);
      })
      .catch(console.error)
      .finally(() => setLoadingScripts(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Ingresa tu usuario (correo, folio o teléfono) y contraseña.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setLoginUsername("");
        setLoginPassword("");
        // Save folio for quick reference if available
        if (data.user.studentFolio) {
          localStorage.setItem("dv_student_folio", data.user.studentFolio);
        }
      } else {
        setLoginError(data.error || "Credenciales incorrectas.");
      }
    } catch {
      setLoginError("Error de conexión al iniciar sesión.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem("dv_student_folio");
    router.refresh();
  };

  // Check access permissions
  const isAdmin = currentUser?.role === "ADMIN";
  const isStudent = currentUser?.role === "ALUMNO";
  const isPaid = currentUser?.hasPaidSubscription || currentUser?.subscriptionStatus === "ACTIVE" || isAdmin;
  const hasBeta = currentUser?.betaAccess || isAdmin;
  const isAccessAllowed = isAdmin || (isStudent && isPaid && (!betaSettings?.isBetaActive || hasBeta));

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 bg-[#161B22] border-b border-[#30363D] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/logo-badge.png" alt="DV Logo" className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
              DV PERFORMING ARTS
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                🧪 MODO BETA / PRUEBA
              </span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{currentUser.fullName}</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {currentUser.role === "ADMIN" ? "Director / Admin" : `Folio: ${currentUser.studentFolio || "Alumno DV"}`}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-3 py-1.5 rounded-lg border border-[#30363D] transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#30363D] hover:bg-[#21262D] transition-colors"
            >
              Acceso Docente
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Beta Status Notification Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-[#161B22] to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Fase de Prueba Privada (Beta)
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                {betaSettings?.announcementMessage ||
                  "Módulo de lectura y ensayo interactivo con voz. Acceso reservado exclusivamente para alumnos con usuario, contraseña y mensualidad al corriente."}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 rounded whitespace-nowrap">
            Opción 1: Web Speech Nativo
          </span>
        </div>

        {/* 1. NOT AUTHENTICATED: Render Login Gate */}
        {authChecked && !currentUser && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg mx-auto space-y-6 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
                🎙️
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Acceso a Sala de Ensayo de Guiones
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ingresa con tu usuario y contraseña de alumno registrado para verificar tu suscripción de mensualidad escolar y acceder al libreto.
              </p>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Usuario / Correo o Folio (DV-XXXX)
                </label>
                <input
                  type="text"
                  placeholder="ej. alumno.beta@dvperformingarts.com o DV-0482"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Tu contraseña asignada"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 rounded-xl text-sm transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verificando membresía...</span>
                  </>
                ) : (
                  <>
                    <span>🔐 Iniciar Sesión y Entrar al Ensayo</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#30363D] text-center">
              <p className="text-[11px] text-slate-500">
                🔒 Acceso restringido en Modo Prueba. Si aún no cuentas con tus claves de acceso o necesitas regularizar tu mensualidad, acude a recepción de la academia.
              </p>
            </div>
          </div>
        )}

        {/* 2. AUTHENTICATED BUT SUBSCRIPTION UNPAID (Past Due / Inactive) */}
        {authChecked && currentUser && !isPaid && (
          <div className="bg-[#161B22] border border-red-500/40 rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
              💳
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                Mensualidad Escolar Pendiente
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hola, <strong>{currentUser.fullName}</strong>. El módulo de ensayo interactivo con voz es exclusivo para alumnos con su mensualidad académica al corriente.
              </p>
              <div className="inline-block bg-red-950/60 border border-red-500/30 text-red-200 px-3 py-1 rounded-lg text-xs font-mono">
                Estatus actual: {currentUser.subscriptionStatus || "PENDIENTE DE PAGO"}
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/pagos"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Pagar Mensualidad en Línea
              </Link>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-4 py-2.5 rounded-xl text-xs border border-[#30363D]"
              >
                Cambiar de Cuenta
              </button>
            </div>
          </div>
        )}

        {/* 3. AUTHENTICATED AND PAID BUT WITHOUT BETA ACCESS IN TESTING MODE */}
        {authChecked && currentUser && isPaid && !isAccessAllowed && (
          <div className="bg-[#161B22] border border-amber-500/40 rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
              🧪
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                Fase de Prueba Beta Cerrada
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tu mensualidad está al corriente ✓, pero esta sala de ensayo se encuentra en <strong>fase beta cerrada</strong> para un grupo piloto de estudiantes.
              </p>
              <p className="text-[11px] text-slate-400">
                Tu maestro o director activará tu cuenta en la siguiente ronda de pruebas.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-4 py-2 rounded-xl text-xs border border-[#30363D]"
            >
              Cerrar Sesión
            </button>
          </div>
        )}

        {/* 4. ACCESS GRANTED: Full Script Catalog for Eligible Students / Admins */}
        {authChecked && currentUser && isAccessAllowed && (
          <div className="space-y-6 animate-fade-in">
            {/* Student Status Card */}
            <div className="bg-[#161B22] border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xl font-black">
                  ✓
                </div>
                <div>
                  <span className="text-xs text-slate-400">Sesión Activa:</span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{currentUser.fullName}</span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                      Mensualidad Pagada
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  🧪 Beta Tester Habilitado
                </span>
              </div>
            </div>

            {/* Scripts Catalog */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📚</span> Libretos de Ensayo Disponibles
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {scripts.length} {scripts.length === 1 ? "obra" : "obras"}
                </span>
              </div>

              {loadingScripts ? (
                <div className="p-12 text-center text-slate-400 bg-[#161B22] border border-[#30363D] rounded-2xl">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
                  <p className="text-xs">Cargando libretos y personajes...</p>
                </div>
              ) : scripts.length === 0 ? (
                <div className="bg-[#161B22] border border-[#30363D] p-10 rounded-2xl text-center">
                  <p className="text-sm text-slate-400">
                    No hay guiones activos asignados por la dirección en este momento.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scripts.map((script) => (
                    <div
                      key={script.id}
                      className="bg-[#161B22] border border-[#30363D] hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-sm"
                    >
                      <div className="space-y-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          {script.productionTitle}
                        </span>
                        <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                          {script.title}
                        </h4>
                        {script.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{script.description}</p>
                        )}

                        {/* Personajes del guion */}
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Selecciona tu personaje para ensayar:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {script.characters.map((c) => {
                              const isMyAssigned =
                                c.assignedStudentFolio &&
                                currentUser.studentFolio &&
                                c.assignedStudentFolio.toLowerCase() === currentUser.studentFolio.toLowerCase();

                              return (
                                <Link
                                  key={c.id}
                                  href={`/estudiantes/guion/${script.id}?char=${encodeURIComponent(c.name)}`}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                                    isMyAssigned
                                      ? "bg-amber-500 text-black font-bold border-amber-400 shadow-md scale-105"
                                      : "bg-[#21262D] text-slate-200 border-[#30363D] hover:border-amber-500/50 hover:bg-[#30363D]"
                                  }`}
                                >
                                  <span>{c.name}</span>
                                  <span className="text-[10px] opacity-70 font-mono">
                                    ({c.totalLinesCount})
                                  </span>
                                  {isMyAssigned && <span>⭐ Tu Rol</span>}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#30363D] flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">
                          {script.totalLines} parlamentos
                        </span>

                        <Link
                          href={`/estudiantes/guion/${script.id}`}
                          className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <span>🎙️ Entrar a la Sala de Ensayo</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
