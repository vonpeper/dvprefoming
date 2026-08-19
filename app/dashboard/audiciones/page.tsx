"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AuditionRegistration,
  Production,
  EvaluationCriteria,
  EvaluationDiscipline,
} from "@/types/mock";
import { AuditionStats } from "@/lib/storage";

export default function AuditionsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"ranking" | "reports" | "list" | "rubrics">("ranking");
  const [auditions, setAuditions] = useState<AuditionRegistration[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [stats, setStats] = useState<AuditionStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Production Filter
  const [selectedProductionId, setSelectedProductionId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selection & Modals
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleTargetAudition, setRoleTargetAudition] = useState<AuditionRegistration | null>(null);
  const [assignedRoleInput, setAssignedRoleInput] = useState("");
  const [roleNotesInput, setRoleNotesInput] = useState("");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // Criteria Management State
  const [newCritName, setNewCritName] = useState("");
  const [newCritDiscipline, setNewCritDiscipline] = useState<EvaluationDiscipline>("CANTO");
  const [newCritDesc, setNewCritDesc] = useState("");
  const [savingCrit, setSavingCrit] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auditions/list").then((res) => res.json()),
      fetch("/api/productions").then((res) => res.json()),
      fetch("/api/auditions/criteria").then((res) => res.json()),
      fetch(`/api/auditions/stats${selectedProductionId !== "ALL" ? `?productionId=${selectedProductionId}` : ""}`).then((res) => res.json()),
    ])
      .then(([audData, prodData, critData, statsData]) => {
        if (audData?.auditions) setAuditions(audData.auditions);
        if (prodData?.productions) setProductions(prodData.productions);
        if (critData?.criteria) setCriteria(critData.criteria);
        if (statsData?.stats) setStats(statsData.stats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedProductionId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: AuditionRegistration["status"],
    action?: "RESEND_CONFIRMATION" | "SEND_REMINDER"
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/auditions/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, action }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          action === "SEND_REMINDER"
            ? "🔔 Recordatorio de audición enviado por WhatsApp."
            : action === "RESEND_CONFIRMATION"
            ? "📱 Notificación de consulta enviada por WhatsApp."
            : `Estatus actualizado a ${newStatus}.`
        );
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Error al procesar la acción.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Assign Role Modal
  const openAssignRoleModal = (audition: AuditionRegistration) => {
    setRoleTargetAudition(audition);
    setAssignedRoleInput(audition.assignedRole || "");
    setRoleNotesInput(audition.notes || "");
    setRoleModalOpen(true);
  };

  // Confirm Assign Role & Notify
  const handleConfirmRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTargetAudition) return;
    if (!assignedRoleInput.trim()) {
      alert("Por favor ingresa el personaje o rol asignado para el alumno.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/auditions/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditionId: roleTargetAudition.id,
          assignedRole: assignedRoleInput.trim(),
          notes: roleNotesInput,
          notifyWhatsApp,
          notifyEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🎉 ¡Personaje "${assignedRoleInput.trim()}" asignado a ${roleTargetAudition.fullName}! Notificaciones enviadas.`);
        setRoleModalOpen(false);
        loadData();
      } else {
        alert(data.error || "Error al asignar personaje.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al procesar el casting.");
    } finally {
      setActionLoading(false);
    }
  };

  // Add new criteria
  const handleAddCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    setSavingCrit(true);
    try {
      const res = await fetch("/api/auditions/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCritName.trim(),
          discipline: newCritDiscipline,
          description: newCritDesc,
          maxScore: 10,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Criterio "${newCritName}" agregado con éxito.`);
        setNewCritName("");
        setNewCritDesc("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCrit(false);
    }
  };

  // Delete criteria
  const handleDeleteCriteria = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el criterio "${name}"?`)) return;
    try {
      const res = await fetch(`/api/auditions/criteria?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Criterio "${name}" eliminado.`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Folio",
      "Nombre Aspirante",
      "Obra Postulada",
      "Telefono",
      "Email",
      "Canto Promedio",
      "Coreo Promedio",
      "Actuacion Promedio",
      "Puntaje Global",
      "Personaje Asignado",
      "Estatus",
      "Jueces Evaluadores",
    ];
    const rows = auditions.map((a) => [
      a.folio,
      `"${a.fullName}"`,
      `"${a.productionName || "Si No Es Ahora"}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      a.cantoAverage || "N/A",
      a.danceAverage || "N/A",
      a.actingAverage || "N/A",
      a.overallScore || "N/A",
      `"${a.assignedRole || ""}"`,
      a.status,
      `"${(a.scores || []).map((s) => `${s.judgeName} (${s.discipline})`).join("; ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `informe_casting_dv_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to match candidate to production
  const matchCandidateToProd = (a: AuditionRegistration, prodId: string) => {
    if (prodId === "ALL") return true;
    const prod = productions.find((p) => p.id === prodId);
    if (a.productionId && a.productionId === prodId) return true;
    if (prod && a.productionName && (a.productionName === prod.title || a.productionName.toLowerCase().includes(prod.title.toLowerCase()) || prod.title.toLowerCase().includes(a.productionName.toLowerCase()))) return true;
    if (a.productionName && a.productionName === prodId) return true;
    // Fallback: If no production specified and selected is "Si No Es Ahora"
    if (!a.productionId && !a.productionName && prod && prod.title.includes("Si No Es Ahora")) return true;
    return false;
  };

  // Filtered Auditions
  const filteredAuditions = auditions.filter((a) => {
    const matchesSearch =
      !searchTerm.trim() ||
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesProduction = matchCandidateToProd(a, selectedProductionId);

    return matchesSearch && matchesStatus && matchesProduction;
  });

  // Ranking: Sort by overallScore DESC
  const rankedAuditions = [...filteredAuditions].sort((a, b) => {
    const scoreA = a.overallScore || 0;
    const scoreB = b.overallScore || 0;
    return scoreB - scoreA;
  });

  const activeProductionObj = productions.find((p) => p.id === selectedProductionId);

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-xs animate-bounce border border-emerald-400">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-purple-600/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Control de Casting & Audiciones
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Folios: <strong className="text-white font-bold">DV-501..DV-585</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <span>Gestión de Audiciones & Selección de Obra</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Selecciona la card de la obra para desplegar inmediatamente la lista de aspirantes registrados y calificados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/jueces"
            target="_blank"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-purple-950/40"
          >
            <span>⚖️ Abrir Portal de Jueces</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">/jueces ↗</span>
          </Link>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>📥 Exportar Informe CSV</span>
          </button>
        </div>
      </div>

      {/* ================= INTERACTIVE PRODUCTION CARDS SELECTOR (CON FOTO) ================= */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <span>🎭</span> Selecciona una Obra para ver sus Aspirantes y Ranking:
          </span>
          <span className="text-xs text-purple-400 font-mono">
            {selectedProductionId === "ALL" ? "Mostrando todas las obras" : `Filtrado por: ${activeProductionObj?.title || "Obra seleccionada"}`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Universal Card: All Productions */}
          <div
            onClick={() => setSelectedProductionId("ALL")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-md ${
              selectedProductionId === "ALL"
                ? "bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/40 text-white"
                : "bg-[#161B22] border-[#30363D] text-slate-300 hover:border-slate-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌟</span>
              <div>
                <h3 className="font-bold text-sm text-white">Todas las Obras</h3>
                <span className="text-[11px] text-slate-400">Padrón consolidado</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#30363D]/60 text-xs font-mono">
              <span className="text-purple-300 font-bold">{auditions.length} Aspirantes</span>
              <span className="text-[10px] text-slate-400">{auditions.filter(a => a.status === "APPROVED").length} aprobados</span>
            </div>
          </div>

          {/* Individual Production Cards with Photo */}
          {productions.map((prod) => {
            const isSelected = selectedProductionId === prod.id;
            const prodAuditions = auditions.filter((a) => matchCandidateToProd(a, prod.id));
            const approvedCount = prodAuditions.filter((a) => a.status === "APPROVED").length;

            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProductionId(prod.id)}
                className={`group rounded-2xl border-2 overflow-hidden transition-all cursor-pointer flex flex-col justify-between shadow-md ${
                  isSelected
                    ? "bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/50 text-white"
                    : "bg-[#161B22] border-[#30363D] text-slate-300 hover:border-purple-400/60"
                }`}
              >
                {/* Photo Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/70">
                  {prod.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🎭
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2">
                    {prod.isAuditionActive ? (
                      <span className="px-2 py-0.5 bg-emerald-600/90 text-white font-mono text-[9px] font-black uppercase rounded-md shadow">
                        ● Activa
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-black/70 text-slate-300 font-mono text-[9px] rounded-md">
                        Cartelera
                      </span>
                    )}
                  </div>

                  {/* Registered count pill */}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 bg-purple-600 text-white font-mono text-[10px] font-black rounded-lg shadow flex items-center gap-1">
                      <span>👥 {prodAuditions.length}</span>
                    </span>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-3.5 flex flex-col gap-1.5">
                  <h3 className="font-bold text-xs text-white truncate group-hover:text-purple-300 transition-colors">
                    {prod.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Dir: {prod.director || "Diego Vieyra"}</span>
                    <span className="text-emerald-400 font-bold">{approvedCount} en elenco</span>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161B22] p-2 rounded-2xl border border-[#30363D]">
        <div className="flex flex-wrap gap-2">
          
          <button
            onClick={() => setActiveTab("ranking")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ranking"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🏆</span>
            <span>Ranking de Jurados (Leaderboard)</span>
            <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded font-bold">
              {filteredAuditions.filter((a) => a.overallScore !== undefined).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "list"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📋</span>
            <span>Lista de Alumnos Registrados ({filteredAuditions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "reports"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📊</span>
            <span>Informes & Métricas de Casting</span>
          </button>

          <button
            onClick={() => setActiveTab("rubrics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "rubrics"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📐</span>
            <span>Rúbricas & Criterios ({criteria.length})</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Buscar por folio, nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* ================= TAB 1: RANKING DE CASTING (LEADERBOARD) ================= */}
      {activeTab === "ranking" && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-[#0D1117] border-b border-[#30363D] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌟</span>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Ranking de Audición para: {activeProductionObj?.title || "Todas las Obras"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Alumnos ordenados por mayor calificación del jurado. Haz clic en "Asignar Personaje" para aprobar e incorporar al elenco.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Escala:</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  8-10 Sobresaliente (Verde)
                </span>
                <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 px-2 py-0.5 rounded font-bold">
                  5-7 En Observación (Amarillo)
                </span>
                <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold">
                  0-4 En desarrollo (Rojo)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#161B22] text-slate-400 font-mono text-[11px] uppercase border-b border-[#30363D]">
                    <th className="py-3 px-4 text-center">Pos.</th>
                    <th className="py-3 px-4">Folio & Aspirante</th>
                    <th className="py-3 px-4">Obra Postulada</th>
                    <th className="py-3 px-4 text-center">🎤 Canto</th>
                    <th className="py-3 px-4 text-center">💃 Coreo</th>
                    <th className="py-3 px-4 text-center">🎭 Actuación</th>
                    <th className="py-3 px-4 text-center font-bold text-purple-300">⭐ Global</th>
                    <th className="py-3 px-4">Personaje Asignado</th>
                    <th className="py-3 px-4 text-right">Acción de Casting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/60 text-slate-300">
                  {rankedAuditions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 font-mono text-xs">
                        No hay aspirantes registrados para la obra seleccionada.
                      </td>
                    </tr>
                  ) : (
                    rankedAuditions.map((aud, index) => {
                      const pos = index + 1;
                      const hasOverall = aud.overallScore !== undefined && aud.overallScore > 0;

                      const getBadgeColor = (val: number | undefined) => {
                        if (val === undefined || val === null) return "text-slate-600";
                        if (val >= 8) return "bg-emerald-950/80 text-emerald-300 border-emerald-500/40";
                        if (val >= 5) return "bg-yellow-950/80 text-yellow-300 border-yellow-500/40";
                        return "bg-red-950/80 text-red-300 border-red-500/40";
                      };

                      return (
                        <tr
                          key={aud.id}
                          className={`hover:bg-[#21262D]/50 transition-colors ${
                            pos <= 3 && hasOverall ? "bg-purple-950/20" : ""
                          }`}
                        >
                          {/* Rank Position */}
                          <td className="py-3 px-4 text-center font-mono font-black text-sm">
                            {pos === 1 ? (
                              <span className="text-xl">🥇</span>
                            ) : pos === 2 ? (
                              <span className="text-xl">🥈</span>
                            ) : pos === 3 ? (
                              <span className="text-xl">🥉</span>
                            ) : (
                              <span className="text-slate-500">#{pos}</span>
                            )}
                          </td>

                          {/* Candidate Name & Short Folio */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">{aud.fullName}</span>
                              <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-slate-400">
                                <span className="text-purple-400 font-bold bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-500/30">
                                  {aud.folio}
                                </span>
                                <span>&bull;</span>
                                <span>{aud.phone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Production */}
                          <td className="py-3 px-4">
                            <span className="text-xs text-slate-300">
                              {aud.productionName || "Si No Es Ahora"}
                            </span>
                          </td>

                          {/* Canto Score */}
                          <td className="py-3 px-4 text-center font-mono">
                            {aud.cantoAverage !== undefined ? (
                              <span className={`border px-2 py-0.5 rounded font-bold ${getBadgeColor(aud.cantoAverage)}`}>
                                {aud.cantoAverage}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Dance Score */}
                          <td className="py-3 px-4 text-center font-mono">
                            {aud.danceAverage !== undefined ? (
                              <span className={`border px-2 py-0.5 rounded font-bold ${getBadgeColor(aud.danceAverage)}`}>
                                {aud.danceAverage}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Acting Score */}
                          <td className="py-3 px-4 text-center font-mono">
                            {aud.actingAverage !== undefined ? (
                              <span className={`border px-2 py-0.5 rounded font-bold ${getBadgeColor(aud.actingAverage)}`}>
                                {aud.actingAverage}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Overall Score */}
                          <td className="py-3 px-4 text-center font-mono">
                            {hasOverall ? (
                              <span className={`text-sm font-black px-3 py-1 rounded-xl shadow-md border ${
                                (aud.overallScore || 0) >= 8
                                  ? "bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/50"
                                  : (aud.overallScore || 0) >= 5
                                  ? "bg-yellow-500 text-black border-yellow-300 shadow-yellow-950/50"
                                  : "bg-red-600 text-white border-red-400 shadow-red-950/50"
                              }`}>
                                {aud.overallScore} / 10
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Sin evaluar</span>
                            )}
                          </td>

                          {/* Assigned Role */}
                          <td className="py-3 px-4">
                            {aud.assignedRole ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-bold text-xs">
                                <span>🎭</span>
                                <span>{aud.assignedRole}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Sin asignar</span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openAssignRoleModal(aud)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow ${
                                aud.assignedRole
                                  ? "bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D]"
                                  : "bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white"
                              }`}
                            >
                              {aud.assignedRole ? "Editar Papel / Reenviar" : "🌟 Asignar Personaje"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: LISTA DE ALUMNOS REGISTRADOS ================= */}
      {activeTab === "list" && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D1117] text-slate-400 font-mono text-[11px] uppercase border-b border-[#30363D]">
                  <th className="py-3 px-4">Folio</th>
                  <th className="py-3 px-4">Aspirante</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Obra & Disciplina</th>
                  <th className="py-3 px-4 text-center">Estatus</th>
                  <th className="py-3 px-4 text-center">Rol Asignado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/60 text-slate-300">
                {filteredAuditions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-xs">
                      No hay alumnos registrados para esta obra.
                    </td>
                  </tr>
                ) : (
                  filteredAuditions.map((aud) => (
                    <tr key={aud.id} className="hover:bg-[#21262D]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-400">{aud.folio}</td>
                      <td className="py-3 px-4 font-bold text-white">{aud.fullName}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{aud.phone}</div>
                        <div className="text-slate-500">{aud.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{aud.productionName || "Si No Es Ahora"}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{aud.programName}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={aud.status}
                          onChange={(e) => handleUpdateStatus(aud.id, e.target.value as AuditionRegistration["status"])}
                          className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border bg-[#0D1117] focus:outline-none ${
                            aud.status === "APPROVED"
                              ? "text-emerald-400 border-emerald-500/40"
                              : aud.status === "REJECTED"
                              ? "text-slate-400 border-slate-600"
                              : "text-amber-400 border-amber-500/40"
                          }`}
                        >
                          <option value="PENDING_REVIEW">⏳ Pendiente / En revisión</option>
                          <option value="APPROVED">✅ Aprobado</option>
                          <option value="REJECTED">❌ No Seleccionado</option>
                          <option value="CONFIRMED">📋 Citatorio Confirmado</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">
                        {aud.assignedRole || "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAssignRoleModal(aud)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold"
                          >
                            {aud.assignedRole ? "Editar Rol" : "Asignar Rol"}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(aud.id, aud.status, "RESEND_CONFIRMATION")}
                            title="Enviar link de consulta por WhatsApp"
                            className="p-1 bg-[#21262D] hover:bg-[#30363D] text-emerald-400 border border-[#30363D] rounded-lg text-xs"
                          >
                            📱
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: INFORMES & METRICAS ================= */}
      {activeTab === "reports" && stats && (
        <div className="flex flex-col gap-6">
          
          {/* Main KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Registrados</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalAuditions}</span>
              <span className="text-[10px] text-purple-400 font-mono mt-1">Convocatoria</span>
            </div>

            <div className="bg-[#161B22] border border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-emerald-950/20">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Aprobados / Elenco</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.approvedCount}</span>
              <span className="text-[10px] text-emerald-300 font-mono mt-1">{stats.approvalRate}% Selección</span>
            </div>

            <div className="bg-[#161B22] border border-amber-500/40 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-amber-950/20">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">En Deliberación</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{stats.pendingCount}</span>
              <span className="text-[10px] text-amber-300 font-mono mt-1">Evaluación abierta</span>
            </div>

            <div className="bg-[#161B22] border border-rose-500/40 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-rose-950/20">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">No Seleccionados</span>
              <span className="text-2xl sm:text-3xl font-black text-rose-400">{stats.rejectedCount}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">Agradecimiento formal</span>
            </div>

            <div className="bg-[#161B22] border border-purple-500/40 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-purple-950/20">
              <span className="text-[10px] font-mono uppercase text-purple-300 font-bold">Roles Asignados</span>
              <span className="text-2xl sm:text-3xl font-black text-purple-300">{stats.assignedRolesCount}</span>
              <span className="text-[10px] text-purple-400 font-mono mt-1">Con papel definido</span>
            </div>

            <div className="bg-[#161B22] border border-amber-400/40 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-amber-950/30">
              <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">Promedio Global</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300">
                {stats.averageScores.overall > 0 ? `${stats.averageScores.overall} ⭐` : "N/A"}
              </span>
              <span className="text-[10px] text-amber-400 font-mono mt-1">Escala de 0 a 10</span>
            </div>
          </div>

          {/* Discipline Average Scores Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#161B22] border border-[#30363D] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <span className="text-xs font-bold text-white block">Promedio Mesa de Canto</span>
                  <span className="text-[11px] text-slate-400">Afinación, tesitura y dicción</span>
                </div>
              </div>
              <span className="text-xl font-black font-mono text-purple-400 bg-purple-950/60 border border-purple-500/40 px-3 py-1 rounded-xl">
                {stats.averageScores.canto > 0 ? `${stats.averageScores.canto}/10` : "-"}
              </span>
            </div>

            <div className="p-4 bg-[#161B22] border border-[#30363D] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💃</span>
                <div>
                  <span className="text-xs font-bold text-white block">Promedio Mesa de Coreografía</span>
                  <span className="text-[11px] text-slate-400">Ritmo, coordinación y técnica</span>
                </div>
              </div>
              <span className="text-xl font-black font-mono text-rose-400 bg-rose-950/60 border border-rose-500/40 px-3 py-1 rounded-xl">
                {stats.averageScores.dance > 0 ? `${stats.averageScores.dance}/10` : "-"}
              </span>
            </div>

            <div className="p-4 bg-[#161B22] border border-[#30363D] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎭</span>
                <div>
                  <span className="text-xs font-bold text-white block">Promedio Mesa de Actuación</span>
                  <span className="text-[11px] text-slate-400">Interpretación y proyección</span>
                </div>
              </div>
              <span className="text-xl font-black font-mono text-amber-400 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl">
                {stats.averageScores.acting > 0 ? `${stats.averageScores.acting}/10` : "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: RUBRICS & CRITERIA MANAGER ================= */}
      {activeTab === "rubrics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add New Criteria Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex flex-col gap-4 shadow-sm h-fit">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#30363D] pb-3">
              <span>➕</span> Dar de Alta Nuevo Criterio / Rubro
            </h2>

            <form onSubmit={handleAddCriteria} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-300">Disciplina / Mesa</label>
                <select
                  value={newCritDiscipline}
                  onChange={(e) => setNewCritDiscipline(e.target.value as EvaluationDiscipline)}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="CANTO">🎤 Canto & Técnica Vocal</option>
                  <option value="COREOGRAFIA">💃 Coreografía & Danza</option>
                  <option value="ACTUACION">🎭 Actuación & Expresión</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-300">Nombre del Rubro</label>
                <input
                  type="text"
                  placeholder="Ej. Afinación, Dicción, Resistencia, etc."
                  value={newCritName}
                  onChange={(e) => setNewCritName(e.target.value)}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-300">Descripción o Guía para el Juez</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Evaluar precisión tonal, afinación en intervalos y limpieza armónica..."
                  value={newCritDesc}
                  onChange={(e) => setNewCritDesc(e.target.value)}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-slate-200 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingCrit}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors cursor-pointer mt-1"
              >
                {savingCrit ? "Guardando..." : "+ Agregar Criterio"}
              </button>
            </form>
          </div>

          {/* Criteria List by Discipline */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {(["CANTO", "COREOGRAFIA", "ACTUACION"] as EvaluationDiscipline[]).map((disc) => {
              const discCriteria = criteria.filter((c) => c.discipline === disc);
              return (
                <div key={disc} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {disc === "CANTO" ? "🎤" : disc === "COREOGRAFIA" ? "💃" : "🎭"}
                      </span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Rúbricas de {disc} ({discCriteria.length} Criterios de 0 a 10)
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {discCriteria.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs text-white">{c.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCriteria(c.id, c.name)}
                              className="text-slate-500 hover:text-rose-400 font-mono text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                          {c.description && (
                            <p className="text-[11px] text-slate-400 mt-1">{c.description}</p>
                          )}
                        </div>

                        <div className="text-[10px] font-mono text-purple-400 font-semibold">
                          Calificación: 0 a {c.maxScore} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN ROLE & NOTIFY WHATSAPP ================= */}
      {roleModalOpen && roleTargetAudition && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setRoleModalOpen(false)}
        >
          <div
            className="bg-[#161B22] border-2 border-purple-500/70 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-purple-950/60 to-rose-950/60 border-b border-[#30363D] flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono bg-purple-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Casting & Aprobación Oficial
                </span>
                <h2 className="text-xl font-black text-white mt-1.5">
                  Asignar Personaje / Papel
                </h2>
                <p className="text-xs text-purple-300 font-mono">
                  {roleTargetAudition.fullName} &bull; {roleTargetAudition.folio}
                </p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmRoleAssignment} className="p-6 flex flex-col gap-4 text-xs">
              
              {/* Scores summary pill if evaluated */}
              {roleTargetAudition.overallScore !== undefined && (
                <div className="p-3 bg-[#0D1117] border border-purple-500/40 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">Puntaje Global de Jueces:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    ⭐ {roleTargetAudition.overallScore} / 10
                  </span>
                </div>
              )}

              {/* Character / Role Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>🎭</span>
                  <span>Personaje / Rol Asignado en la Obra:</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Benny (Protagónico), Mariana, Ensamble Coral, etc."
                  value={assignedRoleInput}
                  onChange={(e) => setAssignedRoleInput(e.target.value)}
                  className="bg-[#0D1117] border-2 border-purple-500/60 focus:border-purple-400 rounded-xl p-3 text-sm text-white font-bold focus:outline-none"
                  required
                />
              </div>

              {/* Additional Director Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">
                  Notas de Dirección / Primer Llamado (Opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Llamado a lectura de libreto: Martes 17:00 hrs en Foro DV..."
                  value={roleNotesInput}
                  onChange={(e) => setRoleNotesInput(e.target.value)}
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none resize-none"
                />
              </div>

              {/* Notification Switches */}
              <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-2xl flex flex-col gap-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Canales de Notificación Inmediata:
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-base">📱</span>
                    <span className="text-slate-200 font-semibold">Notificar por WhatsApp Oficial</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded bg-[#161B22] border-[#30363D] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 text-base">✉️</span>
                    <span className="text-slate-200 font-semibold">Notificar por Correo HTML con Libreto</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="w-4 h-4 text-rose-500 rounded bg-[#161B22] border-[#30363D] cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2.5 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Enviando Notificaciones..." : "🚀 Confirmar y Notificar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
