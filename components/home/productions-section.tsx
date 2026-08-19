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

  return (
    <section id="producciones" className="relative w-full py-20 px-6 border-b-4 border-border-editorial bg-[#070709]" aria-labelledby="heading-producciones">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="02"
          label="Puesta en Escena"
          title="Cartelera de Obras & Montajes"
        />

        {/* Billboard Subtitle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 -mt-4 border-b border-[#222228] pb-4">
          <p className="text-zinc-400 text-sm max-w-xl font-normal">
            Grandes producciones teatrales y musicales montadas íntegramente por el talento, ensamble y cuerpo docente de DV Performing Arts.
          </p>
          <span className="font-mono text-[10px] uppercase text-accent-red tracking-widest font-bold">
            ● TEMPORADA OFICIAL 2026
          </span>
        </div>

        {/* MOVIE POSTER BILLBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {productions.map((production) => {
            const isAudition = production.isAuditionActive;
            return (
              <article
                key={production.id}
                className="group relative bg-[#0D0D12] border-2 border-[#202028] hover:border-accent-red/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(230,0,38,0.15)]"
              >
                {/* Cinema Poster Artwork Container (2:3 Aspect Ratio) */}
                <div className="w-full relative aspect-[2/3] bg-black overflow-hidden border-b border-[#202028]">
                  {/* Poster Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={production.imageUrl || "/images/productions/si-no-es-ahora.jpg"}
                    alt={production.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Cinematic Top Vignette & Badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-black/70 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded">
                      {production.season || "TEMPORADA 2026"}
                    </span>

                    {isAudition ? (
                      <span className="px-2.5 py-1 bg-accent-red text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded flex items-center gap-1 shadow-lg animate-pulse">
                        <span>★</span> Convocatoria Abierta
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-zinc-900/90 border border-zinc-700 text-zinc-300 font-mono text-[9px] uppercase tracking-wider rounded">
                        En Cartelera
                      </span>
                    )}
                  </div>

                  {/* Overlaid Title at bottom of poster image */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <span className="text-[10px] font-mono text-accent-red uppercase tracking-widest font-bold block mb-1">
                      DIRECCIÓN: {production.director}
                    </span>
                    <h3 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-none drop-shadow-md">
                      {production.title}
                    </h3>
                  </div>
                </div>

                {/* Poster Content & Synopsis */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-6 bg-[#0D0D12]">
                  
                  {/* Synopsis text (light and readable) */}
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-normal line-clamp-3">
                    {production.synopsis || "Una producción de alto nivel escénico con música en vivo, elenco estelar y coreografías originales de la academia."}
                  </p>

                  {/* AUTHENTIC MOVIE BILLING BLOCK (CRÉDITOS CINEMATOGRÁFICOS) */}
                  <div className="border-t border-b border-[#202028] py-3.5 flex flex-col gap-1 text-center bg-black/40 rounded-lg p-2.5">
                    <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400 font-semibold leading-tight">
                      DV PERFORMING ARTS PRESENTA UNA PRODUCCIÓN DE {production.director.toUpperCase()}
                    </div>
                    <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-500 leading-relaxed">
                      ELENCO & ENSAMBLE OFICIAL &bull; DIRECCIÓN VOCAL &bull; COREOGRAFÍA ORIGINAL &bull; ILUMINACIÓN ESCÉNICA
                    </div>
                    <div className="font-mono text-[7.5px] uppercase tracking-[0.2em] text-accent-red/90 font-bold mt-0.5">
                      DURACIÓN: {production.durationMinutes || 120} MINUTOS &bull; AUDITORIO DV LEÓN GTO
                    </div>
                  </div>

                  {/* Buttons Action Bar */}
                  <div className="flex items-center gap-3 pt-1">
                    {isAudition ? (
                      <ButtonLink href="#audiciones" variant="primary" className="flex-1 text-center text-xs py-3">
                        ★ Audicionar para esta Obra
                      </ButtonLink>
                    ) : (
                      <ButtonLink href="#contacto" variant="secondary" className="flex-1 text-center text-xs py-3">
                        Informes de Boletos
                      </ButtonLink>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedProduction(production)}
                      className="px-3.5 py-3 bg-[#181820] hover:bg-[#252530] text-zinc-300 hover:text-white border border-[#30303E] rounded text-xs font-mono font-semibold transition-colors cursor-pointer"
                      title="Ver Ficha y Créditos"
                    >
                      Ficha
                    </button>
                  </div>

                </div>
              </article>
            );
          })}
        </div>

      </div>

      {/* FULL MOVIE CREDITS & SYNOPSIS MODAL */}
      {selectedProduction && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121218] border-2 border-accent-red/60 rounded-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#252532] pb-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-accent-red font-bold uppercase tracking-widest">
                  ★ CARTELERA OFICIAL &bull; {selectedProduction.season || "TEMPORADA 2026"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
                  {selectedProduction.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduction(null)}
                className="p-1 text-zinc-400 hover:text-white text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Poster + Overview */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProduction.imageUrl || "/images/productions/si-no-es-ahora.jpg"}
                alt={selectedProduction.title}
                className="w-36 aspect-[2/3] object-cover rounded-xl border border-white/20 shadow-xl shrink-0"
              />
              <div className="flex flex-col gap-3 text-xs text-zinc-300">
                <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                  {selectedProduction.synopsis}
                </p>
                <div className="p-3 bg-black/50 rounded-lg border border-[#252532] flex flex-col gap-1.5 font-mono text-[11px]">
                  <div><span className="text-accent-red font-bold">Dirección:</span> {selectedProduction.director}</div>
                  <div><span className="text-accent-red font-bold">Elenco:</span> {selectedProduction.castDescription || "Alumnos y Ensamble DV Performing Arts"}</div>
                  <div><span className="text-accent-red font-bold">Duración:</span> {selectedProduction.durationMinutes || 120} minutos</div>
                  <div><span className="text-accent-red font-bold">Fechas de Audición:</span> {selectedProduction.auditionDates || "Convocatoria Abierta"}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#252532]">
              <button
                type="button"
                onClick={() => setSelectedProduction(null)}
                className="px-4 py-2 bg-[#20202A] text-zinc-300 hover:text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
              {selectedProduction.isAuditionActive && (
                <a
                  href="#audiciones"
                  onClick={() => setSelectedProduction(null)}
                  className="px-5 py-2 bg-accent-red hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Postularme a esta Audición
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
