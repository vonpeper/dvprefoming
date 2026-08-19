import React from "react";
import { mockTeachers } from "@/data/mock";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";
import MediaPlaceholder from "@/components/ui/media-placeholder";

export default function TeachersSection() {
  return (
    <section id="maestros" className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-maestros">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="05"
          label="Equipo Académico"
          title="Maestros y Dirección"
        />

        {/* Teachers Grid - Large Portraits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {mockTeachers.map((teacher, index) => {
            const variantHash = index % 2 === 0 ? "concrete" : "dark";
            return (
              <div
                key={teacher.id}
                className="group flex flex-col gap-6 bg-[#0D0D10] p-6 rounded-2xl border border-[#26262B] hover:border-accent-red/60 transition-all duration-300 shadow-md"
              >
                {/* Large Portrait Media Placeholder */}
                <div className="w-full rounded-xl overflow-hidden border border-text-main/20 shadow-lg">
                  <MediaPlaceholder
                    src={teacher.imageUrl}
                    alt={teacher.fullName}
                    aspectRatio="3:4"
                    title={teacher.fullName}
                    description="RETRATO DOCUMENTAL DEL INSTRUCTOR"
                    variant={variantHash}
                    className="w-full"
                  />
                </div>

                {/* Details under image */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-2 pb-2 border-b border-border-editorial-light">
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">
                      DOCENTE: {teacher.id}
                    </span>
                    <EditorialLabel status={teacher.status} className="scale-90" />
                  </div>

                  <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight text-text-main group-hover:text-accent-red transition-colors duration-200 leading-tight">
                    {teacher.fullName}
                  </h3>

                  <p className="text-sm text-zinc-300 leading-relaxed font-sans font-normal">
                    {teacher.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {teacher.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#161B22] border border-[#30363D] font-mono text-[10px] uppercase text-zinc-300 rounded font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
