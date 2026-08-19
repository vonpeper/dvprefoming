"use client";

import React, { useState } from "react";
import { mockPrograms } from "@/data/mock";
import { Program } from "@/types/mock";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";
import MediaPlaceholder from "@/components/ui/media-placeholder";
import StripeCheckoutModal from "@/components/payments/stripe-checkout-modal";

export default function ProgramsSection() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TEATRO" | "CANTO" | "DANZA">("ALL");
  const [selectedProgramForCheckout, setSelectedProgramForCheckout] = useState<Program | null>(null);

  // Filter programs based on state
  const filteredPrograms = mockPrograms.filter((program) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "TEATRO") return program.name.toLowerCase().includes("teatro") || program.name.toLowerCase().includes("actuación");
    if (activeFilter === "CANTO") return program.name.toLowerCase().includes("canto");
    if (activeFilter === "DANZA") return program.name.toLowerCase().includes("danza");
    return true;
  });

  return (
    <section id="programas" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-border-editorial bg-transparent" aria-labelledby="heading-programas">
      <div className="mx-auto max-w-container-max">
        
        <SectionHeading
          number="01"
          label="Oferta Académica & Suscripciones"
          title="Programas de Formación Escénica"
        />

        {/* Dynamic Category Tabs Selector */}
        <div className="flex flex-wrap gap-2.5 mb-14 border-b border-[#22222E] pb-6 justify-center sm:justify-start">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl ${
              activeFilter === "ALL"
                ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40"
                : "bg-[#14141C] text-zinc-400 hover:text-white border border-[#2A2A38]"
            }`}
          >
            Mostrar Todo
          </button>
          <button
            onClick={() => setActiveFilter("TEATRO")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl ${
              activeFilter === "TEATRO"
                ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40"
                : "bg-[#14141C] text-zinc-400 hover:text-white border border-[#2A2A38]"
            }`}
          >
            Teatro & Actuación
          </button>
          <button
            onClick={() => setActiveFilter("CANTO")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl ${
              activeFilter === "CANTO"
                ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40"
                : "bg-[#14141C] text-zinc-400 hover:text-white border border-[#2A2A38]"
            }`}
          >
            Canto & Voz
          </button>
          <button
            onClick={() => setActiveFilter("DANZA")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl ${
              activeFilter === "DANZA"
                ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950/40"
                : "bg-[#14141C] text-zinc-400 hover:text-white border border-[#2A2A38]"
            }`}
          >
            Danza Urbana
          </button>
        </div>

        {/* Programs Listing */}
        <div className="flex flex-col gap-12">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program, index) => {
              const isEven = index % 2 === 0;
              const price = program.monthlyPrice || 2400;

              return (
                <div
                  key={program.id}
                  className={`flex flex-col lg:flex-row gap-10 items-center p-6 md:p-8 bg-[#0D0D12]/95 backdrop-blur-md border-2 border-[#202028] hover:border-purple-500/60 transition-all duration-300 rounded-3xl shadow-xl ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Visual Image container */}
                  <div className="w-full lg:w-1/2">
                    <MediaPlaceholder
                      src={program.imageUrl}
                      alt={program.name}
                      aspectRatio="16:9"
                      title={program.name}
                      description="FOTOGRAFÍA OFICIAL DE PROGRAMA"
                      variant={isEven ? "concrete" : "red"}
                      className="w-full rounded-2xl overflow-hidden border border-[#252535] shadow-lg"
                    />
                  </div>

                  {/* Program Details */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    
                    {/* Header line & Price */}
                    <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-[#20202A]">
                      <span className="font-mono text-[10px] tracking-widest text-purple-400 font-bold uppercase">
                        ★ PROGRAMA ACADÉMICO
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs font-mono rounded-full">
                          ${price.toLocaleString("es-MX")} MXN / mes
                        </span>
                        <EditorialLabel status={program.status} className="scale-90" />
                      </div>
                    </div>

                    <h3 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
                      {program.name}
                    </h3>

                    <p className="text-sm text-zinc-300 leading-relaxed font-sans font-normal">
                      {program.description}
                    </p>

                    {/* Features checklist */}
                    {program.features && program.features.length > 0 && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1 text-xs text-zinc-300">
                        {program.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Schedules & Age Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#20202A] pt-4 font-mono text-[11px] text-zinc-300">
                      <div>
                        <span className="block text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">RANGO DE EDAD</span>
                        <span className="font-medium text-white">{program.ageGroup}</span>
                      </div>
                      <div>
                        <span className="block text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">HORARIOS</span>
                        <span className="font-medium text-white">{program.scheduleDescription}</span>
                      </div>
                    </div>

                    {/* Action Bar (Stripe Checkout + WhatsApp) */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProgramForCheckout(program)}
                        className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Adquirir</span>
                      </button>

                      <a
                        href={`https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20quiero%20agendar%20una%20clase%20muestra%20para%20${encodeURIComponent(program.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#1C1C26] hover:bg-[#252535] text-zinc-200 hover:text-white border border-[#303045] text-xs font-semibold transition-colors text-center"
                      >
                        Clase Muestra 💬
                      </a>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-[#252535] font-mono text-xs text-zinc-400 uppercase tracking-widest rounded-2xl">
              Ningún programa coincide con la selección.
            </div>
          )}
        </div>

      </div>

      {/* Stripe Interactive Checkout Modal */}
      <StripeCheckoutModal
        program={selectedProgramForCheckout}
        isOpen={!!selectedProgramForCheckout}
        onClose={() => setSelectedProgramForCheckout(null)}
      />
    </section>
  );
}
