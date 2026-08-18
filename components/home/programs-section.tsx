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
        <div className="flex flex-wrap gap-4 mb-16 border-b-2 border-border-editorial-light pb-6 justify-center sm:justify-start">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-accent-red text-text-main font-bold border-2 border-accent-red"
                : "bg-transparent text-text-muted hover:text-text-main border-2 border-border-editorial-light"
            }`}
          >
            [ MOSTRAR TODO ]
          </button>
          <button
            onClick={() => setActiveFilter("TEATRO")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              activeFilter === "TEATRO"
                ? "bg-accent-red text-text-main font-bold border-2 border-accent-red"
                : "bg-transparent text-text-muted hover:text-text-main border-2 border-border-editorial-light"
            }`}
          >
            [ TEATRO & ACTUACIÓN ]
          </button>
          <button
            onClick={() => setActiveFilter("CANTO")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              activeFilter === "CANTO"
                ? "bg-accent-red text-text-main font-bold border-2 border-accent-red"
                : "bg-transparent text-text-muted hover:text-text-main border-2 border-border-editorial-light"
            }`}
          >
            [ CANTO & VOZ ]
          </button>
          <button
            onClick={() => setActiveFilter("DANZA")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              activeFilter === "DANZA"
                ? "bg-accent-red text-text-main font-bold border-2 border-accent-red"
                : "bg-transparent text-text-muted hover:text-text-main border-2 border-border-editorial-light"
            }`}
          >
            [ DANZA & HIP HOP ]
          </button>
        </div>

        {/* Programs Listing */}
        <div className="flex flex-col gap-20">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={program.id}
                  className={`flex flex-col lg:flex-row gap-12 items-center transition-all duration-300 animate-fade-in ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Large Visual block */}
                  <div className="w-full lg:w-1/2">
                    <MediaPlaceholder
                      aspectRatio="16:9"
                      title={program.name.split(" ")[0]}
                      description="FOTOGRAFÍA OFICIAL DE CLASE PENDIENTE"
                      variant={isEven ? "concrete" : "red"}
                      className="w-full border-2 border-text-main shadow-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border-editorial-light">
                      <span className="font-mono text-[9px] tracking-widest text-text-muted">
                        PROG-COD: {program.id}
                      </span>
                      <EditorialLabel status={program.status} className="opacity-70" />
                    </div>

                    <h3 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter text-text-main leading-[0.82]">
                      {program.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans font-bold uppercase tracking-widest">
                      {program.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 border-t border-border-editorial-light pt-4 font-mono text-[9px] uppercase tracking-wider text-text-main">
                      <div>
                        <span className="block text-accent-red text-[8px] font-bold mb-1">RANGO DE EDAD</span>
                        <span>{program.ageGroup}</span>
                      </div>
                      <div>
                        <span className="block text-accent-red text-[8px] font-bold mb-1">HORARIOS PREVISTOS</span>
                        <span>{program.scheduleDescription}</span>
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
