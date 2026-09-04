"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: string;
    fullName: string;
  } | null>(null);
  const [evolutionStatus, setEvolutionStatus] = useState<{
    connected: boolean;
    state: string;
  }>({ connected: true, state: "open" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, render children cleanly without dashboard frame
  if (pathname === "/dashboard/login" || pathname === "/admin") {
    return <>{children}</>;
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    fetch("/api/messaging/evolution/status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.status) {
          setEvolutionStatus(data.status);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      window.location.href = "/admin";
    }
  };

  const isTeacher = currentUser?.role === "MAESTRO" || currentUser?.role === "DOCENTE_JUEZ";

  const allNavItems = [
    {
      label: "Resumen General",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Control de Audiciones & Casting",
      href: "/dashboard/audiciones",
      badge: "Ranking",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: "Alumnado & Aspirantes",
      href: "/dashboard/alumnos",
      badge: "Padrón",
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
    },
    {
      label: "⭐ Panel de Jueces (Docentes)",
      href: "/jueces",
      badge: "En Vivo",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: "Noticias & Novedades (CMS)",
      href: "/dashboard/articulos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      label: "Obras & Cartelera",
      href: "/dashboard/producciones",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      label: "Páginas & Contenido Web",
      href: "/dashboard/paginas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Biblioteca Multimedia",
      href: "/dashboard/multimedia",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp & Evolution API",
      href: "/dashboard/mensajeria",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      label: "Usuarios",
      href: "/dashboard/usuarios",
      badge: "Acceso",
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const navItems = isTeacher
    ? [
        {
          label: "⭐ Panel de Jueces (Mesa en Vivo)",
          href: "/jueces",
          badge: "En Vivo",
          icon: (
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
        },
        {
          label: "Ranking de Audiciones & Casting",
          href: "/dashboard/audiciones",
          badge: "Ranking",
          icon: (
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
      ]
    : allNavItems;

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 bg-[#161B22] border-b border-[#30363D] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Brand & Mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#21262D] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href={isTeacher ? "/jueces" : "/dashboard"} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/logo-badge.png" alt="DV Logo" className="h-8 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                DV PERFORMING ARTS
                <span className={`text-[10px] border px-1.5 py-0.5 rounded font-mono font-semibold ${
                  isTeacher
                    ? "bg-amber-600/30 text-amber-300 border-amber-500/40"
                    : "bg-red-600/30 text-red-400 border-red-500/40"
                }`}>
                  {isTeacher ? "MAESTRO / JURADO" : "ADMIN"}
                </span>
              </span>
              <span className="text-[11px] text-slate-400">
                {isTeacher ? "Mesa de Calificación & Casting" : "Panel de Control & CMS"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions & Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Evolution API Pill */}
          {!isTeacher && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#21262D] border border-[#30363D] rounded-full text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${evolutionStatus.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-slate-300">WhatsApp: {evolutionStatus.connected ? "Conectado" : "Simulado"}</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-medium transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">Ver Sitio Web</span>
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-[#30363D]">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow ${
                isTeacher ? "bg-amber-600" : "bg-red-600"
              }`}>
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "DV"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-white">
                  {currentUser?.fullName || currentUser?.username || "admin@dvperformingarts.com"}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {isTeacher ? "Docente Activo" : "Sesión Segura"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-[#21262D] rounded-lg transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-[#161B22] border-r border-[#30363D] flex flex-col justify-between shrink-0 transition-transform duration-200 z-20 md:static fixed inset-y-16 left-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Navigation Links */}
          <div className="p-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase px-3 py-1 font-semibold">
              Módulos del Sistema
            </span>

            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-red-600 text-white shadow-md font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-[#21262D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#30363D] flex flex-col gap-2">
            <div className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D]/80 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                DV Performing Arts v1.0
              </span>
              <span className="text-[10px] text-slate-400">propodvps1 &bull; Producción</span>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#0D1117]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
