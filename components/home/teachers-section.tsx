import React from "react";
import { mockTeachers } from "@/data/mock";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";
import MediaPlaceholder from "@/components/ui/media-placeholder";

export default function TeachersSection() {
  return (
    <section className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-maestros">
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
                className="group flex flex-col gap-6"
              >
                {/* Large Portrait Media Placeholder */}
                <div className="w-full border-4 border-text-main shadow-lg">
                  <MediaPlaceholder
                    aspectRatio="3:4"
                    title={teacher.fullName}
                    description="RETRATO DOCUMENTAL DEL INSTRUCTOR PENDIENTE"
                    variant={variantHash}
                    className="w-full"
                  />
                </div>

                {/* Details under image (not enclosing) */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-2 pb-2 border-b border-border-editorial-light">
                    <span className="font-mono text-[9px] text-text-muted">
                      DOCENTE-COD: {teacher.id}
                    </span>
                    <EditorialLabel status={teacher.status} className="scale-90" />
                  </div>

                  <h3 className="font-display text-3xl font-extrabold uppercase tracking-tighter text-text-main group-hover:text-accent-red transition-colors duration-200 leading-[0.82]">
                    {teacher.fullName}
                  </h3>

                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans font-bold uppercase tracking-wide">
                    {teacher.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {teacher.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 border border-border-editorial-light font-mono text-[9px] text-text-muted uppercase"
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
