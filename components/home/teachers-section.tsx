"use client";

import React, { useState, useEffect } from "react";
import { mockTeachers } from "@/data/mock";
import { Teacher } from "@/types/mock";
import SectionHeading from "@/components/ui/section-heading";
import MediaPlaceholder from "@/components/ui/media-placeholder";

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

  return (
    <section id="maestros" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-border-editorial bg-transparent" aria-labelledby="heading-maestros">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="05"
          label="Cuerpo Docente de Élite"
          title="Maestros y Dirección Artística"
        />

        {/* Apple-like Subtitle */}
        <div className="max-w-2xl mx-auto text-center mb-16 -mt-4">
          <p className="text-sm sm:text-base text-zinc-300 font-sans font-normal leading-relaxed">
            Artistas en activo, directores escénicos y coaches certificados internacionalmente dedicados a potenciar tu talento.
          </p>
        </div>

        {/* Teachers Grid - Minimalist, High-Impact Portrait Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {mockTeachers.map((teacher, index) => {
            const variantHash = index % 2 === 0 ? "concrete" : "dark";

            // Concise punchlines for Apple-style readability
            const shortHighlights: Record<string, string> = {
              teacher_diego_vieyra: "AMDA New York & PAA Londres. Dirección de Rent, Spring Awakening y Matilda.",
              teacher_marena_segura: "Berklee College of Music. TEDx Performer y coach de artistas en La Voz.",
              teacher_fanny_monroy: "Campeona Nacional Infinity Championship & Coreógrafa en México y España.",
            };

            const punchline = shortHighlights[teacher.id] || "Formación actoral y dirección escénica de alto rendimiento.";

            return (
              <div
                key={teacher.id}
                className="group flex flex-col justify-between bg-[#0D0D12]/90 backdrop-blur-md p-5 rounded-3xl border border-[#22222C] hover:border-rose-500/70 transition-all duration-300 shadow-xl hover:-translate-y-1.5"
              >
                <div className="flex flex-col gap-4">
                  {/* Portrait Media Container */}
                  <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative bg-black border border-[#252535] shadow-md">
                    <MediaPlaceholder
                      src={teacher.imageUrl}
                      alt={teacher.fullName}
                      aspectRatio="3:4"
                      title={teacher.fullName}
                      description="FOTO OFICIAL"
                      variant={variantHash}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <span className="text-[9px] font-mono text-purple-300 uppercase font-bold tracking-wider block mb-0.5">
                        {teacher.title || teacher.specialties[0]}
                      </span>
                      <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white leading-tight">
                        {teacher.fullName}
                      </h3>
                    </div>
                  </div>

                  {/* Clean One-Liner (Apple Style) */}
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans font-normal">
                    {punchline}
                  </p>

                  {/* Clean Specialty Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.specialties.slice(0, 2).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#14141C] border border-[#252535] font-mono text-[9px] uppercase text-zinc-300 rounded-lg font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Minimalist Action */}
                <div className="pt-4 mt-2 border-t border-[#1E1E28]">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(teacher)}
                    className="w-full py-2 bg-[#171722] hover:bg-rose-600/20 text-zinc-300 hover:text-rose-400 border border-[#282838] hover:border-rose-500/40 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                className="w-8 h-8 rounded-full bg-black/60 border border-white/20 text-zinc-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Split */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-[#252535] shrink-0 shadow-lg">
                <MediaPlaceholder
                  src={selectedTeacher.imageUrl}
                  alt={selectedTeacher.fullName}
                  aspectRatio="3:4"
                  title={selectedTeacher.fullName}
                  description="FOTO OFICIAL"
                  variant="dark"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-4 text-xs text-zinc-300 flex-1">
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
                    Semblanza Artística & Trayectoria:
                  </h4>
                  <p className="text-sm text-zinc-200 leading-relaxed font-sans font-normal">
                    {selectedTeacher.bio}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-[#20202C]">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                    Especialidades & Disciplinas Impartidas:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.specialties.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1 bg-[#161622] border border-purple-500/30 text-purple-300 font-mono text-xs rounded-lg font-semibold"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-[#252535]">
              <span className="text-[10px] font-mono text-zinc-500">
                DV PERFORMING ARTS &bull; FORMACIÓN INTEGRAL
              </span>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="px-5 py-2.5 bg-[#1C1C26] hover:bg-[#252535] text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-[#303045] transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
