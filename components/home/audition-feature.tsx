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
                <EditorialLabel text="Convocatoria Abierta" variant="accent" />
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.2em]">
                  Temporada de Teatro Musical
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tighter text-text-main leading-[0.82]">
                Audiciones: &ldquo;Si No Es Ahora&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans font-bold uppercase tracking-widest max-w-xl">
                Buscamos cantantes, actores y bailarines apasionados para formar parte del elenco y ensamble de nuestra próxima producción musical en León, Gto.
              </p>
            </div>

            {/* Warning strip-like bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9px] font-mono uppercase tracking-widest text-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Teatro Musical, Canto & Danza</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Edades: Niños, Jóvenes y Adultos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Sede: Jardines del Moral, León</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-red" />
                <span>Atención: 477 655 8156</span>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Registration Card */}
          <div className="w-full lg:w-[420px] flex flex-col bg-[#121215] border-2 border-border-editorial-light p-6 justify-center items-center gap-4 text-center min-h-[300px]">
            <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-bold border-b border-border-editorial w-full block">
              REGISTRO DE ASPIRANTES
            </span>
            <div className="text-3xl">🎭</div>
            <span className="font-mono text-[9px] text-text-main uppercase font-bold tracking-widest">
              POSTULACIÓN DIRECTA
            </span>
            <p className="text-[10px] font-sans text-text-muted uppercase tracking-wider leading-relaxed max-w-[280px]">
              Envía tu información de contacto y disciplina de interés a nuestro equipo de coordinación artística.
            </p>
            <a
              href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20deseo%20registrarme%20para%20la%20audición%20del%20musical%20Si%20no%20es%20ahora"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-4 py-3.5 bg-accent-red text-text-main border-2 border-accent-red hover:bg-transparent hover:text-accent-red transition-colors font-sans text-[11px] uppercase tracking-[0.18em] font-bold block text-center"
            >
              Registrarme por WhatsApp
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
