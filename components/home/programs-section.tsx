"use client";

import React, { useState } from "react";
import { mockPrograms } from "@/data/mock";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";
import MediaPlaceholder from "@/components/ui/media-placeholder";

export default function ProgramsSection() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TEATRO" | "CANTO" | "DANZA">("ALL");

  // Filter programs based on state
  const filteredPrograms = mockPrograms.filter((program) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "TEATRO") return program.name.toLowerCase().includes("teatro") || program.name.toLowerCase().includes("actuación");
    if (activeFilter === "CANTO") return program.name.toLowerCase().includes("canto");
    if (activeFilter === "DANZA") return program.name.toLowerCase().includes("danza");
    return true;
  });

  return (
    <section id="programas" className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-programas">
      <div className="mx-auto max-w-container-max">
        
        <SectionHeading
          number="01"
          label="Oferta Académica"
          title="Programas de Formación"
        />

        {/* Dynamic Category Tabs Selector */}
        <div className="flex flex-wrap gap-3 mb-16 border-b-2 border-border-editorial-light pb-6 justify-center sm:justify-start">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded ${
              activeFilter === "ALL"
                ? "bg-accent-red text-text-main font-bold border border-accent-red"
                : "bg-[#161B22] text-zinc-400 hover:text-white border border-[#30363D]"
            }`}
          >
            Mostrar Todo
          </button>
          <button
            onClick={() => setActiveFilter("TEATRO")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded ${
              activeFilter === "TEATRO"
                ? "bg-accent-red text-text-main font-bold border border-accent-red"
                : "bg-[#161B22] text-zinc-400 hover:text-white border border-[#30363D]"
            }`}
          >
            Teatro & Actuación
          </button>
          <button
            onClick={() => setActiveFilter("CANTO")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded ${
              activeFilter === "CANTO"
                ? "bg-accent-red text-text-main font-bold border border-accent-red"
                : "bg-[#161B22] text-zinc-400 hover:text-white border border-[#30363D]"
            }`}
          >
            Canto & Voz
          </button>
          <button
            onClick={() => setActiveFilter("DANZA")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer rounded ${
              activeFilter === "DANZA"
                ? "bg-accent-red text-text-main font-bold border border-accent-red"
                : "bg-[#161B22] text-zinc-400 hover:text-white border border-[#30363D]"
            }`}
          >
            Danza Urbana
          </button>
        </div>

        {/* Programs Listing */}
        <div className="flex flex-col gap-16">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={program.id}
                  className={`flex flex-col lg:flex-row gap-10 items-center p-6 md:p-8 bg-[#0D0D10] border-2 border-[#26262B] hover:border-accent-red/60 transition-all duration-300 rounded-2xl ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Large Visual block */}
                  <div className="w-full lg:w-1/2">
                    <MediaPlaceholder
                      src={program.imageUrl}
                      alt={program.name}
                      aspectRatio="16:9"
                      title={program.name}
                      description="FOTOGRAFÍA OFICIAL DE PROGRAMA"
                      variant={isEven ? "concrete" : "red"}
                      className="w-full rounded-xl overflow-hidden border border-text-main/20 shadow-md"
                    />
                  </div>

                  {/* Details */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border-editorial-light">
                      <span className="font-mono text-[9px] tracking-widest text-text-muted">
                        COD: {program.id}
                      </span>
                      <EditorialLabel status={program.status} className="scale-90" />
                    </div>

                    <h3 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-text-main leading-tight">
                      {program.name}
                    </h3>

                    <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans font-normal">
                      {program.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 border-t border-border-editorial-light pt-4 font-mono text-[10px] text-zinc-300">
                      <div>
                        <span className="block text-accent-red text-[9px] font-bold mb-0.5 uppercase tracking-wider">RANGO DE EDAD</span>
                        <span className="font-medium">{program.ageGroup}</span>
                      </div>
                      <div>
                        <span className="block text-accent-red text-[9px] font-bold mb-0.5 uppercase tracking-wider">HORARIOS</span>
                        <span className="font-medium">{program.scheduleDescription}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border-editorial font-mono text-xs text-text-muted uppercase tracking-widest">
              Ningún programa coincide con la selección.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
