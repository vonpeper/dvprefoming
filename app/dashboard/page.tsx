"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuditionRegistration, Article } from "@/types/mock";

export default function DashboardSummaryPage() {
  const [auditions, setAuditions] = useState<AuditionRegistration[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auditions/list").then((res) => res.json()),
      fetch("/api/articles").then((res) => res.json()),
    ])
      .then(([audData, artData]) => {
        if (audData?.auditions) setAuditions(audData.auditions);
        if (artData?.articles) setArticles(artData.articles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const pendingAuditions = auditions.filter((a) => a.status === "PENDING_REVIEW").length;
  const approvedAuditions = auditions.filter((a) => a.status === "APPROVED" || a.status === "CONFIRMED").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Panel de Control Principal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestión integral de audiciones, artículos de revista y contenidos de DV Performing Arts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/alumnos"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow"
          >
            <span>🎓 Padrón Alumnos</span>
          </Link>
          <Link
            href="/dashboard/audiciones"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow"
          >
            <span>Ver Audiciones</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{auditions.length}</span>
          </Link>
          <Link
            href="/dashboard/articulos/nuevo"
            className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <span>+ Nuevo Artículo</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Audiciones */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aspirantes Registrados</span>
            <span className="p-2 bg-red-500/10 text-red-400 rounded-lg text-lg">🎭</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{loading ? "--" : auditions.length}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="text-amber-400 font-semibold">{pendingAuditions} pendientes</span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-semibold">{approvedAuditions} confirmados</span>
            </div>
          </div>
        </div>

        {/* Card 2: Artículos Blog */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Artículos en Revista</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg text-lg">📝</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{loading ? "--" : articles.length}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">Publicación en vivo</span>
              <span>&bull;</span>
              <span>SEO activo</span>
            </div>
          </div>
        </div>

        {/* Card 3: WhatsApp Automation */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evolution WhatsApp</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-lg">📱</span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              Activo
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Notificación inmediata con folio y recordatorio
            </div>
          </div>
        </div>

        {/* Card 4: Disciplinas Oficiales */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Oferta Académica</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg text-lg">🎓</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">4</div>
            <div className="mt-2 text-xs text-slate-400 truncate">
              Teatro, Canto, Danza Urbana y Actuación
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link
          href="/dashboard/audiciones"
          className="group bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-purple-500/50 rounded-xl p-4 transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-base shrink-0">
              🏆
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">
                Ranking de Casting
              </h3>
              <p className="text-[11px] text-slate-400">Leaderboard, métricas y roles.</p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
            <span>Ver Ranking</span>
            <span>&rarr;</span>
          </div>
        </Link>

        <Link
          href="/jueces"
          target="_blank"
          className="group bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-amber-500/50 rounded-xl p-4 transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
              ⚖️
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                Mesa de Jurados
              </h3>
              <p className="text-[11px] text-slate-400">Canto, Danza y Actuación.</p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
            <span>Abrir Mesa</span>
            <span>↗</span>
          </div>
        </Link>

        <Link
          href="/dashboard/articulos"
          className="group bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-blue-500/50 rounded-xl p-4 transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-base shrink-0">
              ✍️
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                CMS de Noticias
              </h3>
              <p className="text-[11px] text-slate-400">Editor por bloques y SEO.</p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
            <span>Editar Revista</span>
            <span>&rarr;</span>
          </div>
        </Link>

        <Link
          href="/dashboard/producciones"
          className="group bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-rose-500/50 rounded-xl p-4 transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-base shrink-0">
              🎭
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
                Cartelera & Obras
              </h3>
              <p className="text-[11px] text-slate-400">Google Maps y convocatorias.</p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
            <span>Gestionar Obras</span>
            <span>&rarr;</span>
          </div>
        </Link>

        <Link
          href="/dashboard/usuarios"
          className="group bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-emerald-500/50 rounded-xl p-4 transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-base shrink-0">
              👥
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                Ajustes Usuarios
              </h3>
              <p className="text-[11px] text-slate-400">Alta y roles de jurados y admins.</p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <span>Control de Acceso</span>
            <span>&rarr;</span>
          </div>
        </Link>
      </div>

      {/* Recent Auditions Preview Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#30363D] flex justify-between items-center">
          <div>
            <h2 className="font-bold text-white text-base">Últimos Registros de Audición</h2>
            <p className="text-xs text-slate-400">Aspirantes que han enviado su postulación a través del formulario web.</p>
          </div>
          <Link
            href="/dashboard/audiciones"
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            Ver todos ({auditions.length}) &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-slate-400 font-mono uppercase text-[10px] border-b border-[#30363D]">
              <tr>
                <th className="py-3 px-4">Folio</th>
                <th className="py-3 px-4">Aspirante</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4">Disciplina</th>
                <th className="py-3 px-4">Notificación</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {auditions.slice(0, 5).map((aud) => (
                <tr key={aud.id} className="hover:bg-[#21262D]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{aud.folio}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{aud.fullName}</td>
                  <td className="py-3.5 px-4 text-slate-300">{aud.phone}</td>
                  <td className="py-3.5 px-4 text-slate-400">{aud.programName || "Teatro Musical"}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span>✓</span> Enviado
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        aud.status === "APPROVED" || aud.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : aud.status === "REJECTED"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {aud.status === "APPROVED"
                        ? "Aprobado"
                        : aud.status === "CONFIRMED"
                        ? "Confirmado"
                        : aud.status === "REJECTED"
                        ? "Rechazado"
                        : "En Revisión"}
                    </span>
                  </td>
                </tr>
              ))}

              {auditions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No hay registros de audiciones registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
