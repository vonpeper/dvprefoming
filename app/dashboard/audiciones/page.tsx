"use client";

import React, { useState, useEffect } from "react";
import { AuditionRegistration, Production } from "@/types/mock";

export default function AuditionsDashboardPage() {
  const [auditions, setAuditions] = useState<AuditionRegistration[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [productionFilter, setProductionFilter] = useState("ALL");
  const [selectedAudition, setSelectedAudition] = useState<AuditionRegistration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadAuditions = () => {
    Promise.all([
      fetch("/api/auditions/list").then((res) => res.json()),
      fetch("/api/productions").then((res) => res.json()),
    ])
      .then(([audData, prodData]) => {
        if (audData?.auditions) setAuditions(audData.auditions);
        if (prodData?.productions) setProductions(prodData.productions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAuditions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
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
            ? "📱 Confirmación con folio reenviada por WhatsApp."
            : `Estatus actualizado a ${newStatus}.`
        );
        loadAuditions();
        if (selectedAudition && selectedAudition.id === id) {
          setSelectedAudition(data.audition);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error al procesar la acción.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Folio", "Nombre", "Obra", "Telefono", "Email", "Edad", "Programa", "Horario", "Estatus", "Fecha Registro"];
    const rows = auditions.map((a) => [
      a.folio,
      `"${a.fullName}"`,
      `"${a.productionName || "Si No Es Ahora"}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      `"${a.age || ""}"`,
      `"${a.programName || a.programId}"`,
      `"${a.preferredSchedule || ""}"`,
      a.status,
      new Date(a.createdAt).toLocaleDateString("es-MX"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audiciones_dv_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAuditions = auditions.filter((a) => {
    const matchesSearch =
      a.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.productionName && a.productionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesProgram = programFilter === "ALL" || a.programId === programFilter;
    const matchesProduction =
      productionFilter === "ALL" ||
      a.productionId === productionFilter ||
      a.productionName === productionFilter;

    return matchesSearch && matchesStatus && matchesProgram && matchesProduction;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-xs animate-bounce">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Control & Registro de Audiciones</span>
            <span className="text-xs font-mono bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold">
              {auditions.length} Aspirantes
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de postulaciones oficiales, folios de acceso, obra en curso y mensajería automática por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Buscar por Folio, Nombre o Teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
          />
        </div>

        {/* Production Filter */}
        <div>
          <select
            value={productionFilter}
            onChange={(e) => setProductionFilter(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none font-bold text-red-400"
          >
            <option value="ALL">Todas las Obras</option>
            {productions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.isAuditionActive ? "★ (Activa)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDING_REVIEW">En Revisión (Pendiente)</option>
            <option value="APPROVED">Aprobados</option>
            <option value="CONFIRMED">Cita Confirmada</option>
            <option value="REJECTED">Rechazados</option>
          </select>
        </div>

        {/* Program filter */}
        <div>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todas las Disciplinas</option>
            <option value="prog_teatro_musical">Teatro Musical Integral</option>
            <option value="prog_canto_vocal">Canto & Técnica Vocal</option>
            <option value="prog_danza_urbana">Danza Urbana & Hip Hop</option>
            <option value="prog_actuacion_escenica">Actuación Escénica</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-slate-400 font-mono uppercase text-[10px] border-b border-[#30363D]">
              <tr>
                <th className="py-3 px-4">Folio Oficial</th>
                <th className="py-3 px-4">Aspirante</th>
                <th className="py-3 px-4">Obra / Montaje</th>
                <th className="py-3 px-4">WhatsApp / Teléfono</th>
                <th className="py-3 px-4">Disciplina</th>
                <th className="py-3 px-4">Turno</th>
                <th className="py-3 px-4">Estatus</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {filteredAuditions.map((aud) => (
                <tr key={aud.id} className="hover:bg-[#21262D]/60 transition-colors">
                  {/* Folio */}
                  <td className="py-3.5 px-4 font-mono font-bold text-red-400">{aud.folio}</td>

                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{aud.fullName}</div>
                    <div className="text-[10px] text-slate-400">{aud.email || "Sin correo"}</div>
                  </td>

                  {/* Obra */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      🎭 {aud.productionName || "Si No Es Ahora"}
                    </span>
                  </td>

                  {/* WhatsApp */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <a
                      href={`https://wa.me/52${aud.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 flex items-center gap-1.5"
                    >
                      <span>💬</span> {aud.phone}
                    </a>
                  </td>

                  {/* Program */}
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {aud.programName || aud.programId}
                  </td>

                  {/* Preferred Schedule */}
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {aud.preferredSchedule || "Vespertino"}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
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

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedAudition(aud)}
                        className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded font-semibold text-[11px] transition-colors"
                      >
                        Ver Ficha
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(aud.id, aud.status, "SEND_REMINDER")}
                        disabled={actionLoading}
                        className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded text-[11px] font-mono transition-colors"
                        title="Enviar Recordatorio por WhatsApp"
                      >
                        🔔 Recordar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAuditions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                    No se encontraron aspirantes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICANT DETAIL MODAL */}
      {selectedAudition && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedAudition(null)}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#30363D] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold">
                    FOLIO: {selectedAudition.folio}
                  </span>
                  <span className="text-xs text-slate-400">
                    Registrado: {new Date(selectedAudition.createdAt).toLocaleString("es-MX")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{selectedAudition.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedAudition(null)}
                className="p-1 text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#0D1117] rounded-xl border border-purple-500/30 flex flex-col gap-1">
                <span className="text-purple-400 font-mono text-[10px] uppercase font-bold">Obra en Convocatoria</span>
                <span className="text-white font-bold text-sm">🎭 {selectedAudition.productionName || "Si No Es Ahora"}</span>
              </div>

              <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D] flex flex-col gap-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Disciplina de Interés</span>
                <span className="text-white font-bold">{selectedAudition.programName || selectedAudition.programId}</span>
              </div>

              <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D] flex flex-col gap-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Teléfono / WhatsApp</span>
                <span className="text-white font-mono font-bold text-sm">{selectedAudition.phone}</span>
              </div>

              <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D] flex flex-col gap-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Turno Preferido</span>
                <span className="text-white">{selectedAudition.preferredSchedule || "Vespertino"}</span>
              </div>
            </div>

            {/* Experience Notes */}
            <div className="p-4 bg-[#0D1117] rounded-xl border border-[#30363D] flex flex-col gap-1.5 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">
                Experiencia Previa / Comentarios Artísticos:
              </span>
              <p className="text-slate-200 leading-relaxed italic">
                &ldquo;{selectedAudition.experienceNotes || "Sin comentarios adicionales de experiencia previa."}&rdquo;
              </p>
            </div>

            {/* Evolution API WhatsApp Quick Actions */}
            <div className="p-4 bg-[#0D1117] rounded-xl border border-emerald-500/30 flex flex-col gap-3">
              <span className="text-emerald-400 font-mono text-xs font-bold uppercase flex items-center gap-2">
                <span>📱 Acciones de Mensajería WhatsApp (Evolution API)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAudition.id, selectedAudition.status, "RESEND_CONFIRMATION")}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-[#161B22] hover:bg-[#21262D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>📨</span> Reenviar Folio y Cita
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAudition.id, selectedAudition.status, "SEND_REMINDER")}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <span>🔔</span> Enviar Recordatorio para el Día de Audición
                </button>
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#30363D]">
              <span className="text-xs font-semibold text-slate-400">Cambiar Estatus:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAudition.id, "APPROVED")}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAudition.id, "CONFIRMED")}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-xs font-bold transition-colors"
                >
                  🎯 Confirmar Asistencia
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAudition.id, "REJECTED")}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-xs font-bold transition-colors"
                >
                  ✕ Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
