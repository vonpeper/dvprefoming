"use client";

import React, { useState, useEffect } from "react";
import { mockTeachers } from "@/data/mock";
import { Teacher } from "@/types/mock";
import SectionHeading from "@/components/ui/section-heading";

export default function TeachersSection() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedTeacher) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTeacher(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTeacher]);

  // Concise punchlines for Apple-style high impact readability
  const shortHighlights: Record<string, string> = {
    teacher_diego_vieyra: "AMDA New York & PAA Londres. Dirección de Rent, Spring Awakening, Hoy No Me Puedo Levantar y Matilda.",
    teacher_marena_segura: "Berklee College of Music. TEDx Performer y coach de artistas en La Voz México y producciones CDMX.",
    teacher_fanny_monroy: "Campeona Nacional Infinity Championship & Coreógrafa en México y Festival Jorearte en España.",
    teacher_andres_rodriguez: "Graduado de CEUVOZ (respaldado por INBAL). Formación en Linklater, Feldenkrais y Técnica Alexander.",
    teacher_angel_piedra: "Licenciada con mención laureada (UG). Formación con Odin Teatret (Dinamarca) y Peeping Tom (Bélgica).",
    teacher_carolina_torres: "Becaria Vincerò Academy. Solista con la Compañía de Ópera del Teatro del Bicentenario y Cervantino.",
  };

  return (
    <section id="maestros" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-border-editorial bg-transparent" aria-labelledby="heading-maestros">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="05"
          label="Cuerpo Docente de Élite"
          title="Maestros y Dirección Artística"
        />

        {/* Subtitle */}
        <div className="max-w-2xl mx-auto text-center mb-16 -mt-4">
          <p className="text-sm sm:text-base text-zinc-300 font-sans font-normal leading-relaxed">
            Artistas en activo, directores escénicos y coaches certificados internacionalmente dedicados a potenciar tu talento en León, Gto.
          </p>
        </div>

        {/* Teachers Grid - 2x2 Clean Spacious Layout on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {mockTeachers.map((teacher) => {
            const punchline = shortHighlights[teacher.id] || "Formación actoral y dirección escénica de alto rendimiento.";

            return (
              <div
                key={teacher.id}
                className="group flex flex-col justify-between bg-[#0E0E14]/95 backdrop-blur-md p-6 sm:p-7 rounded-[2rem] border-2 border-[#22222E] hover:border-purple-500/70 transition-all duration-300 shadow-2xl hover:-translate-y-1.5"
              >
                <div className="flex flex-col gap-5">
                  {/* Portrait Media Container - Big & Cinematic 4:5 Aspect Ratio */}
                  <div className="w-full aspect-[4/5] sm:aspect-[4/4.8] rounded-2xl overflow-hidden relative bg-black border border-[#252535] shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={teacher.imageUrl || "/images/teachers/diego-vieyra.jpg"}
                      alt={teacher.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Top Subtle Frame Marks & Badge */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center pointer-events-none z-10">
                      <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded-full shadow">
                        DV PERFORMING ARTS
                      </span>
                      <span className="px-2.5 py-0.5 bg-purple-950/90 border border-purple-500/50 text-purple-300 font-mono text-[9px] uppercase font-bold tracking-wider rounded-full">
                        DOCENTE
                      </span>
                    </div>

                    {/* Clean Dark Vignette Overlay for Crisp Text Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E14] via-[#0E0E14]/20 to-transparent pointer-events-none" />

                    {/* Bottom Title on Image (Single clean overlay with no duplication) */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-1">
                      <span className="text-[11px] font-mono text-purple-300 uppercase font-extrabold tracking-wider block">
                        {teacher.title || teacher.specialties[0]}
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
                        {teacher.fullName}
                      </h3>
                    </div>
                  </div>

                  {/* Clean Highlight Punchline (Apple Style) */}
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans font-normal">
                    {punchline}
                  </p>

                  {/* Clean Specialty Pills */}
                  <div className="flex flex-wrap gap-2">
                    {teacher.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#161622] border border-[#2B2B3E] font-mono text-[10px] uppercase text-zinc-300 rounded-lg font-medium tracking-wide"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Minimalist Action Button */}
                <div className="pt-5 mt-4 border-t border-[#1E1E28]">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(teacher)}
                    className="w-full py-3 bg-[#171724] hover:bg-purple-600 hover:text-white text-zinc-200 border border-[#2B2B3E] hover:border-purple-500 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Trayectoria Completa</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ================= TEACHER FULL BIO MODAL ================= */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Trayectoria de ${selectedTeacher.fullName}`}
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="bg-[#101016] border-2 border-purple-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#252535] pb-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">
                  ★ {selectedTeacher.title || "Docente Titular"}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
                  {selectedTeacher.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="w-9 h-9 rounded-full bg-[#1C1C26] text-zinc-400 hover:text-white hover:bg-purple-600/30 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer border border-[#303045]"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Teacher Image & Info in Modal */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedTeacher.imageUrl || "/images/teachers/diego-vieyra.jpg"}
                alt={selectedTeacher.fullName}
                className="w-36 h-48 object-cover rounded-2xl border border-purple-500/30 shadow-lg shrink-0"
              />
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {selectedTeacher.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-purple-950/40 border border-purple-500/40 font-mono text-[10px] uppercase text-purple-300 rounded-lg font-bold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  Sede: DV Performing Arts &bull; León, Gto.
                </div>
              </div>
            </div>

            {/* Full Biography */}
            <div className="flex flex-col gap-3 border-t border-[#252535] pt-4">
              <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-bold">
                Semblanza & Trayectoria Escénica
              </h4>
              <p className="text-sm text-zinc-200 leading-relaxed font-sans font-normal whitespace-pre-line">
                {selectedTeacher.bio}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#252535] pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="py-2.5 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
