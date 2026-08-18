import React from "react";
import { mockProductions } from "@/data/mock";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";
import MediaPlaceholder from "@/components/ui/media-placeholder";
import ButtonLink from "@/components/ui/button-link";

export default function ProductionsSection() {
  return (
    <section id="producciones" className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-producciones">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="02"
          label="Puesta en Escena"
          title="Cartelera y Obras"
        />

        {/* Poster Wall Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {mockProductions.map((production, index) => {
            const variantHash = index % 3 === 0 ? "red" : index % 3 === 1 ? "dark" : "gray";
            return (
              <article
                key={production.id}
                className="group border-4 border-text-main bg-background-sec flex flex-col justify-between transition-transform duration-200 hover:-translate-y-2"
              >
                {/* Poster Artwork Area */}
                <div className="w-full relative border-b-4 border-text-main">
                  <MediaPlaceholder
                    aspectRatio="3:4"
                    title={production.title}
                    description="PÓSTER OFICIAL DE CARTELERA PENDIENTE"
                    variant={variantHash}
                  />
                  {/* Absolute date tag at top right of poster */}
                  <div className="absolute top-4 right-4 bg-background-main border border-border-editorial px-2 py-1 font-mono text-[9px] text-text-main uppercase font-bold">
                    TEMP-2026
                  </div>
                </div>

                {/* Poster Details */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-2 pb-2 border-b border-border-editorial-light">
                      <span className="font-mono text-[8px] text-text-muted">
                        STG-ID: {production.id}
                      </span>
                      <EditorialLabel status={production.status} className="scale-90" />
                    </div>
                    
                    <h3 className="font-display text-3xl font-extrabold uppercase tracking-tighter text-text-main group-hover:text-accent-red transition-colors duration-200 leading-[0.82]">
                      {production.title}
                    </h3>

                    <p className="text-xs text-text-muted leading-relaxed font-sans font-bold uppercase tracking-wide line-clamp-3">
                      {production.synopsis}
                    </p>
                  </div>

                  {/* Director & Cast Info */}
                  <div className="border-t border-border-editorial-light pt-4 flex flex-col gap-1.5 font-mono text-[9px] text-text-muted uppercase tracking-wider">
                    <div>
                      <span className="text-accent-red font-bold mr-1">Dirección:</span>
                      <span>{production.director}</span>
                    </div>
                    <div>
                      <span className="text-accent-red font-bold mr-1">Elenco:</span>
                      <span>{production.castDescription}</span>
                    </div>
                    <div>
                      <span className="text-accent-red font-bold mr-1">Duración:</span>
                      <span>{production.durationMinutes > 0 ? `${production.durationMinutes} min.` : "Sin definir"}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <ButtonLink variant="primary" className="w-full">
                      Ver Funciones
                    </ButtonLink>
                  </div>

                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
