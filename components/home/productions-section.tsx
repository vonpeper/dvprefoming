"use client";

import React, { useState, useEffect } from "react";
import { mockProductions } from "@/data/mock";
import { Production } from "@/types/mock";
import SectionHeading from "@/components/ui/section-heading";
import ButtonLink from "@/components/ui/button-link";

export default function ProductionsSection() {
  const [productions, setProductions] = useState<Production[]>(mockProductions);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);

  useEffect(() => {
    fetch("/api/productions")
      .then((res) => res.json())
      .then((data) => {
        if (data?.productions && data.productions.length > 0) {
          setProductions(data.productions);
        }
      })
      .catch(() => {});
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    if (!selectedProduction) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProduction(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduction]);

  return (
    <section id="producciones" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-border-editorial bg-transparent" aria-labelledby="heading-producciones">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="02"
          label="Puesta en Escena"
          title="Cartelera de Obras & Montajes"
        />

        {/* Billboard Subtitle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 -mt-4 border-b border-[#222228] pb-4">
          <p className="text-zinc-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Grandes producciones teatrales y musicales montadas íntegramente por el talento, ensamble y cuerpo docente de DV Performing Arts.
          </p>
          <span className="font-mono text-[11px] uppercase text-rose-400 tracking-wider font-bold bg-rose-950/30 border border-rose-500/30 px-3 py-1 rounded-full">
            ● TEMPORADA OFICIAL 2026
          </span>
        </div>

        {/* ================= BILLBOARD GRID (WIDE / CINEMATIC ARTWORK CARDS) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productions.map((production) => {
            const isAudition = production.isAuditionActive;
            const ticketLink = production.ticketUrl || "https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20quiero%20comprar%20tickets%20para%20la%20obra";

            return (
              <article
                key={production.id}
                className="group relative bg-[#0D0D12]/95 backdrop-blur-md border-2 border-[#202028] hover:border-rose-500/80 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(225,29,72,0.2)] shadow-xl"
              >
                {/* Wide 16:10 Cinematic Artwork Container */}
                <div className="w-full relative aspect-[16/10] bg-black overflow-hidden border-b border-[#202028]">
                  {/* Poster / Wide Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={production.imageUrl || "/images/productions/si-no-es-ahora.jpg"}
                    alt={production.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Top Vignette & Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-black/60 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center pointer-events-none">
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-full shadow">
                      {production.season || "TEMPORADA 2026"}
                    </span>

                    {isAudition ? (
                      <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-red-600 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                        <span>★</span> Audiciones Abiertas
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-zinc-900/90 border border-zinc-700 text-zinc-300 font-mono text-[10px] uppercase tracking-wider rounded-full">
                        En Cartelera
                      </span>
                    )}
                  </div>

                  {/* Title Overlaid at Bottom */}
                  <div className="absolute bottom-3.5 left-4 right-4 z-10">
                    <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold block mb-1">
                      DIRECCIÓN: {production.director}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white leading-none drop-shadow-md">
                      {production.title}
                    </h3>
                  </div>
                </div>

                {/* Poster Content & Details */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5 bg-[#0D0D12]">
                  
                  {/* Synopsis text */}
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-normal line-clamp-3">
                    {production.synopsis || "Una producción de alto nivel escénico con música en vivo, elenco estelar y coreografías originales de la academia."}
                  </p>

                  {/* Billing Block Credits */}
                  <div className="border-t border-b border-[#202028] py-3 flex flex-col gap-1 text-center bg-black/50 rounded-xl p-3">
                    <div className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-zinc-300 font-bold leading-tight">
                      DV PERFORMING ARTS PRESENTA UNA PRODUCCIÓN DE {production.director.toUpperCase()}
                    </div>
                    <div className="font-mono text-[7.5px] uppercase tracking-[0.15em] text-zinc-400 leading-relaxed">
                      ELENCO & ENSAMBLE OFICIAL &bull; DIRECCIÓN VOCAL &bull; COREOGRAFÍA ORIGINAL
                    </div>
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-rose-400 font-bold mt-0.5">
                      DURACIÓN: {production.durationMinutes || 110} MINUTOS &bull; AUDITORIO DV LEÓN GTO
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-xs py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🎟️</span>
                      <span>Tickets</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedProduction(production)}
                      className="px-4 py-3 bg-[#1C1C26] hover:bg-[#252535] text-zinc-200 hover:text-white border border-[#303045] rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Ver Ficha y Créditos Completos"
                    >
                      <span>🔍</span>
                      <span>Ficha</span>
                    </button>
                  </div>

                </div>
              </article>
            );
          })}
        </div>

      </div>

      {/* ================= WIDE-FORMAT MOVIE & SHOW PRODUCTION MODAL ================= */}
      {selectedProduction && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
          role="dialog"
          aria-modal="true"
          aria-label={`Ficha de ${selectedProduction.title}`}
          onClick={() => setSelectedProduction(null)}
        >
          <div
            className="bg-[#101016] border-2 border-rose-500/40 rounded-3xl max-w-3xl w-full overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh] animate-fade-in relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. CINEMATIC WIDE HERO HEADER (16:9 / 21:9) */}
            <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-black overflow-hidden relative shrink-0 border-b border-[#252535]">
              {/* Wide Artwork */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProduction.imageUrl || "/images/productions/si-no-es-ahora.jpg"}
                alt={selectedProduction.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Dramatic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101016] via-black/40 to-black/70 pointer-events-none" />

              {/* Floating Top Header inside Wide Banner */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <span className="px-3.5 py-1 bg-black/80 backdrop-blur-md border border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase font-bold tracking-wider rounded-full shadow">
                  ★ CARTELERA OFICIAL &bull; {selectedProduction.season || "TEMPORADA 2026"}
                </span>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedProduction(null)}
                  className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
                  aria-label="Cerrar ficha de la obra"
                >
                  ✕
                </button>
              </div>

              {/* Title & Category Overlaid at bottom of wide hero */}
              <div className="absolute bottom-4 left-6 right-6 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-500/40">
                    DIRECCIÓN: {selectedProduction.director}
                  </span>
                  {selectedProduction.isAuditionActive && (
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
                      ● Convocatoria Activa
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl sm:text-4xl font-extrabold uppercase text-white tracking-tight leading-tight drop-shadow-lg">
                  {selectedProduction.title}
                </h3>
              </div>
            </div>

            {/* 2. MODAL BODY (STRUCTURED TECHNICAL SPECS & SYNOPSIS) */}
            <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 text-sm text-zinc-300">
              
              {/* Synopsis Section */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  Sinopsis & Argumento:
                </h4>
                <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans font-normal">
                  {selectedProduction.synopsis || "Una puesta en escena original de gran formato de la academia DV Performing Arts. Una historia vibrante sobre la juventud, las decisiones decisivas y el poder transformador de la música sobre el escenario."}
                </p>
              </div>

              {/* Modern Theatrical Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#0A0A0E] border border-[#20202C] rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                    🎬 Dirección Escénica:
                  </span>
                  <span className="text-xs text-white font-semibold">
                    {selectedProduction.director}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                    👥 Elenco & Ensamble:
                  </span>
                  <span className="text-xs text-white font-semibold">
                    {selectedProduction.castDescription || "Alumnos de Alto Rendimiento y Ensamble DV"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                    ⏱️ Duración de la Obra:
                  </span>
                  <span className="text-xs text-white font-semibold">
                    {selectedProduction.durationMinutes || 110} minutos (Con intermedio)
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                    📅 Fechas & Convocatoria:
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {selectedProduction.auditionDates || "Convocatoria Abierta Ciclo 2026"}
                  </span>
                </div>
              </div>

              {/* Theatrical Production Notice */}
              <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Sede oficial: Auditorio DV Performing Arts &bull; Paseo de los Insurgentes #1506, León, Gto.</span>
                </div>
              </div>

            </div>

            {/* 3. MODAL ACTION FOOTER */}
            <div className="p-4 sm:p-6 bg-[#0B0B10] border-t border-[#20202C] flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProduction(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1C1C26] hover:bg-[#252535] text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-[#303045] transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={selectedProduction.ticketUrl || "https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20quiero%20comprar%20tickets%20para%20la%20obra"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40"
                >
                  <span>🎟️</span>
                  <span>Tickets</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
