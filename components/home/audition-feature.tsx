"use client";

import React from "react";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";

export default function AuditionFeature() {
  return (
    <section id="audiciones" className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-audiciones">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="03"
          label="Admisiones"
          title="Audiciones y Registro"
        />

        {/* Feature Box with structural red accents and signal vibes */}
        <div className="border-4 border-accent-red bg-[#0A0A0C] p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row gap-8 justify-between items-stretch relative overflow-hidden">
          
          {/* Signal graphic tags in corner */}
          <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-accent-red text-text-main px-3 py-1 font-mono text-[9px] uppercase tracking-widest font-bold">
            STAGE-B ACCESS ONLY
          </div>

          {/* Left Column: Information */}
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <EditorialLabel text="Activo" variant="outline" />
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.2em]">
                  Ingreso Escénico Provisorio
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tighter text-text-main leading-[0.82]">
                Convocatoria Abierta: Simulador de Admisión
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans font-bold uppercase tracking-widest max-w-xl">
                Prueba nuestro simulador interactivo de admisiones. Registra tus datos para ver en tiempo real cómo el backend atómico de Next.js procesará tu folio de seguimiento único.
              </p>
            </div>

            {/* Warning strip-like bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9px] font-mono uppercase tracking-widest text-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Requisitos de disciplina y edad</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Fechas oficiales de evaluación</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Carga de portafolios y CV</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Folios atómicos transaccionales</span>
              </div>
            </div>
          </div>

          {/* Right Column: Inactive/Deactivated Simulator Message */}
          <div className="w-full lg:w-[420px] flex flex-col bg-[#121215] border-2 border-border-editorial-light p-6 justify-center items-center gap-4 text-center min-h-[300px]">
            <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-bold border-b border-border-editorial w-full block">
              SISTEMA DE ADMISIÓN
            </span>
            <div className="text-3xl">⚠️</div>
            <span className="font-mono text-[9px] text-accent-yellow uppercase font-bold tracking-widest">
              SIMULADOR DE AUDICIONES DESACTIVADO
            </span>
            <p className="text-[10px] font-sans text-text-muted uppercase tracking-wider leading-relaxed max-w-[260px]">
              El prototipo interactivo de admisiones ha sido desactivado temporalmente por auditoría técnica.
            </p>
            <button
              disabled
              className="w-full mt-4 py-3.5 bg-background-main text-text-muted border-2 border-border-editorial-light font-sans text-[11px] uppercase tracking-[0.18em] font-bold cursor-not-allowed"
            >
              Registro Inactivo
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
