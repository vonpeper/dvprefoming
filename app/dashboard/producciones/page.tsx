"use client";

import React, { useState, useEffect } from "react";
import { Production } from "@/types/mock";
import ImageUploader from "@/components/ui/image-uploader";

export default function ProductionsDashboardPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [activeAudition, setActiveAudition] = useState<Production | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Partial<Production> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadProductions = () => {
    fetch("/api/productions")
      .then((res) => res.json())
      .then((data) => {
        if (data?.productions) {
          setProductions(data.productions);
          setActiveAudition(data.activeAudition || null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProductions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSetActive = async (id: string, title: string) => {
    try {
      const res = await fetch("/api/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_ACTIVE_AUDITION", id }),
      });
      if (res.ok) {
        showToast(`⭐ "${title}" es ahora la obra activa para audiciones en la web.`);
        loadProductions();
      }
    } catch (err) {
      console.error(err);
      alert("Error al activar convocatoria.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la producción "${title}"?`)) return;
    try {
      const res = await fetch(`/api/productions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Obra "${title}" eliminada.`);
        loadProductions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd || !editingProd.title?.trim()) {
      alert("El título de la obra es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProd),
      });

      if (res.ok) {
        showToast(editingProd.id ? "✓ Obra actualizada con éxito." : "✓ Nueva obra dada de alta en cartelera.");
        setModalOpen(false);
        setEditingProd(null);
        loadProductions();
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar la producción.");
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setEditingProd({
      title: "",
      synopsis: "",
      director: "Diego Vieyra",
      castDescription: "Elenco y ensamble de DV Performing Arts",
      durationMinutes: 120,
      season: "Temporada 2026",
      imageUrl: "/images/productions/si-no-es-ahora.jpg",
      productionStatus: "IN_SEASON",
      isAuditionActive: false,
      auditionDates: "Audiciones Abiertas",
    });
    setModalOpen(true);
  };

  const openEditModal = (prod: Production) => {
    setEditingProd({ ...prod });
    setModalOpen(true);
  };

  const galleryOptions = [
    "/images/productions/si-no-es-ahora.jpg",
    "/images/productions/into-the-woods.jpg",
    "/images/productions/hoy-no-me-puedo-levantar.jpg",
    "/images/productions/galeria-show.jpg",
    "/images/productions/galeria-danza.jpg",
    "/images/hero/hero-stage.jpg",
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-xs animate-bounce">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Producciones & Cartelera Teatral</span>
            <span className="text-xs font-mono bg-purple-600/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
              {productions.length} Obras
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Da de alta nuevas puestas en escena, administra la cartelera de la web y define la obra activa para audiciones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Dar de Alta Nueva Obra</span>
        </button>
      </div>

      {/* ACTIVE AUDITION CALL HIGHLIGHT CARD */}
      {activeAudition && (
        <div className="bg-gradient-to-r from-red-950/50 via-[#161B22] to-[#161B22] border-2 border-red-500/60 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-xl">
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeAudition.imageUrl || "/images/productions/si-no-es-ahora.jpg"}
              alt={activeAudition.title}
              className="w-20 h-28 object-cover rounded-xl border-2 border-red-500 shadow-md shrink-0"
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  ★ CONVOCATORIA ACTIVA EN AUDICIONES
                </span>
                <span className="text-xs text-slate-400 font-mono">{activeAudition.season}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{activeAudition.title}</h2>
              <p className="text-xs text-slate-300 line-clamp-2 max-w-xl">
                {activeAudition.synopsis || "Los alumnos postulados en la página web están aplicando actualmente para esta producción."}
              </p>
              <div className="text-[11px] text-red-400 font-mono font-semibold flex items-center gap-2 mt-1">
                <span>📍 Dirección: {activeAudition.director}</span>
                <span>&bull;</span>
                <span>📅 Fechas: {activeAudition.auditionDates || "Convocatoria Abierta"}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => openEditModal(activeAudition)}
              className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-semibold transition-colors"
            >
              Editar Convocatoria
            </button>
          </div>
        </div>
      )}

      {/* PRODUCTIONS CATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productions.map((prod) => {
          const isCurrentActive = prod.isAuditionActive;
          return (
            <div
              key={prod.id}
              className={`bg-[#161B22] border rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm transition-all group ${
                isCurrentActive ? "border-red-500/70 shadow-red-950/20" : "border-[#30363D] hover:border-slate-500"
              }`}
            >
              {/* Poster */}
              <div className="w-full h-56 relative bg-black overflow-hidden border-b border-[#30363D]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prod.imageUrl || "/images/productions/si-no-es-ahora.jpg"}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-white border border-white/20 font-bold">
                  {prod.season || "Temporada 2026"}
                </div>

                {isCurrentActive && (
                  <div className="absolute bottom-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                    <span>★</span> Convocatoria Activa
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>🎬 Dir: {prod.director || "Diego Vieyra"}</span>
                    <span>⏱ {prod.durationMinutes || 120} min</span>
                  </div>

                  <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors leading-snug">
                    {prod.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {prod.synopsis || "Sin sinopsis registrada."}
                  </p>
                </div>

                {/* Actions bottom bar */}
                <div className="pt-4 border-t border-[#30363D] flex items-center justify-between gap-2">
                  {!isCurrentActive ? (
                    <button
                      onClick={() => handleSetActive(prod.id, prod.title)}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <span>★</span> Activar para Audición
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                      <span>✓</span> En Convocatoria
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="px-2.5 py-1.5 bg-[#21262D] hover:bg-purple-600 hover:text-white rounded-lg text-xs text-slate-300 font-semibold transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.title)}
                      className="p-1.5 hover:text-red-400 text-slate-500 transition-colors"
                      title="Eliminar obra"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PRODUCTION MODAL */}
      {modalOpen && editingProd && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#30363D] pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingProd.id ? "Editar Obra / Producción" : "Dar de Alta Nueva Obra"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Los cambios se reflejarán automáticamente en la cartelera de la página principal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduction} className="flex flex-col gap-4 text-xs">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Título de la Obra *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Si No Es Ahora (El Musical)"
                  value={editingProd.title || ""}
                  onChange={(e) => setEditingProd({ ...editingProd, title: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Director & Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Director / Dirección Escénica</label>
                  <input
                    type="text"
                    placeholder="Ej. Diego Vieyra"
                    value={editingProd.director || ""}
                    onChange={(e) => setEditingProd({ ...editingProd, director: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Temporada / Año</label>
                  <input
                    type="text"
                    placeholder="Ej. Temporada 2026"
                    value={editingProd.season || ""}
                    onChange={(e) => setEditingProd({ ...editingProd, season: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Synopsis */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Sinopsis de la Obra</label>
                <textarea
                  rows={3}
                  placeholder="Descripción de la trama, montaje escénico y propuesta artística..."
                  value={editingProd.synopsis || ""}
                  onChange={(e) => setEditingProd({ ...editingProd, synopsis: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                />
              </div>

              {/* Audition Dates & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Fechas o Convocatoria de Audición</label>
                  <input
                    type="text"
                    placeholder="Ej. Sábados de Febrero y Marzo 2026"
                    value={editingProd.auditionDates || ""}
                    onChange={(e) => setEditingProd({ ...editingProd, auditionDates: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Duración (Minutos)</label>
                  <input
                    type="number"
                    value={editingProd.durationMinutes || 120}
                    onChange={(e) => setEditingProd({ ...editingProd, durationMinutes: Number(e.target.value) })}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Audition Deadline & Event Date (Vigencia Temporal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-purple-300 flex items-center justify-between">
                    <span>📅 Fecha Límite de Audición</span>
                    <span className="text-[10px] text-slate-500 font-mono">Cierre automático</span>
                  </label>
                  <input
                    type="date"
                    value={editingProd.auditionDeadline || ""}
                    onChange={(e) => setEditingProd({ ...editingProd, auditionDeadline: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300 flex items-center justify-between">
                    <span>🎭 Fecha de Estreno / Función</span>
                    <span className="text-[10px] text-slate-500 font-mono">Día del evento</span>
                  </label>
                  <input
                    type="date"
                    value={editingProd.eventDate || ""}
                    onChange={(e) => setEditingProd({ ...editingProd, eventDate: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Venue / Recinto & Google Maps Location */}
              <div className="flex flex-col gap-3 p-4 bg-[#0D1117] border border-[#30363D] rounded-xl my-1">
                <span className="font-mono text-[11px] uppercase text-purple-300 font-bold flex items-center gap-1.5">
                  <span>📍</span> Ubicación & Recinto de la Puesta en Escena
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-300">Recinto / Teatro Oficial</label>
                    <input
                      type="text"
                      placeholder="Ej. Teatro Manuel Doblado / Foro DV"
                      value={editingProd.venueName || ""}
                      onChange={(e) => setEditingProd({ ...editingProd, venueName: e.target.value })}
                      className="bg-[#161B22] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-300">Dirección del Recinto</label>
                    <input
                      type="text"
                      placeholder="Ej. Pedro Moreno esq. Hermanos Aldama, León, Gto."
                      value={editingProd.venueAddress || ""}
                      onChange={(e) => setEditingProd({ ...editingProd, venueAddress: e.target.value })}
                      className="bg-[#161B22] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300 flex items-center justify-between">
                    <span>🗺️ Enlace de Google Maps / Waze del Recinto</span>
                    <span className="text-[10px] text-slate-500 font-mono">https://maps.app.goo.gl/...</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/?q=Teatro+Manuel+Doblado..."
                    value={editingProd.venueMapsUrl || ""}
                    onChange={(e) => setEditingProd({ ...editingProd, venueMapsUrl: e.target.value })}
                    className="bg-[#161B22] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Ticket URL (External ticketing provider) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>🎟️ Enlace Externo de Boletería / Tickets</span>
                  <span className="text-[10px] text-slate-500 font-mono">Boletópolis, Ticketmaster, etc.</span>
                </label>
                <input
                  type="url"
                  placeholder="https://boletopolis.com/es/evento/tu-obra..."
                  value={editingProd.ticketUrl || ""}
                  onChange={(e) => setEditingProd({ ...editingProd, ticketUrl: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              {/* Reusable Image Uploader for Poster / Banner */}
              <ImageUploader
                label="Póster Oficial / Imagen Panorámica de Cartelera"
                value={editingProd.imageUrl || "/images/productions/si-no-es-ahora.jpg"}
                aspectRatio="16:9"
                onChange={(newUrl) => setEditingProd({ ...editingProd, imageUrl: newUrl })}
                description="Formato panorámico recomendado 16:9 o 16:10 para lucir en la cartelera y ficha de estreno."
              />

              {/* Set Active Audition Checkbox */}
              <div className="p-4 bg-[#0D1117] border border-red-500/30 rounded-xl flex items-center gap-3 my-2">
                <input
                  type="checkbox"
                  id="isAuditionActive"
                  checked={editingProd.isAuditionActive || false}
                  onChange={(e) => setEditingProd({ ...editingProd, isAuditionActive: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded bg-[#161B22] border-[#30363D] focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="isAuditionActive" className="cursor-pointer text-xs">
                  <span className="font-bold text-white block">
                    Activar como Convocatoria Oficial de Audición
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Al marcar esta opción, los aspirantes en la web seleccionarán esta obra por defecto y el Hero actualizará el llamado.
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#30363D]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Guardando..." : "Guardar Obra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
