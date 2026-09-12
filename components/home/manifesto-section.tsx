import React from "react";
import MediaPlaceholder from "@/components/ui/media-placeholder";
import { WebsiteContent } from "@/lib/storage";

interface ManifestoSectionProps {
  content?: WebsiteContent["manifesto"];
}

const DEFAULT_MANIFESTO: WebsiteContent["manifesto"] = {
  tag: "NUESTRO MANIFIESTO",
  title: "TRANSFORMAMOS A TRAVÉS DEL TEATRO MUSICAL.",
  subtitle: "Misión & Filosofía Educativa • DV Performing Arts • León, Gto.",
  description: "Enseñamos a nuestros estudiantes que la disciplina, el compromiso y la pasión son los sellos distintivos de una formación escénica de excelencia. Impulsamos artistas completos preparados para destacar en cualquier escenario.",
  image: "/images/hero/manifesto-rehearsal.jpg",
};

export default function ManifestoSection({ content }: ManifestoSectionProps) {
  const data = {
    ...DEFAULT_MANIFESTO,
    ...(content || {}),
  };

  return (
    <section className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-label="Declaración de principios">
      <div className="mx-auto max-w-container-max grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Graphic Text block */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
            <span className="tracking-wide uppercase text-[11px] font-bold">
              {data.tag || DEFAULT_MANIFESTO.tag}
            </span>
          </div>

          {/* Title structured with clamp sizing */}
          <h3
            className="font-display font-extrabold uppercase text-white tracking-tight leading-[1.05]"
            style={{ fontSize: "clamp(1.9rem, 4.3vw, 3.85rem)" }}
          >
            {data.title.includes("TEATRO MUSICAL") ? (
              <>
                <span className="block">{data.title.replace(/TEATRO MUSICAL\.?/i, "").trim()}</span>
                <span className="block mt-1">
                  DEL <span className="inline-block bg-accent-red text-white px-3.5 py-0.5 rounded-lg shadow-lg">TEATRO MUSICAL.</span>
                </span>
              </>
            ) : (
              <span>{data.title}</span>
            )}
          </h3>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-sans font-normal whitespace-pre-line">
            {data.description}
          </p>

          <div className="border-t border-border-editorial-light pt-6 text-xs text-zinc-400 font-normal flex items-center gap-2">
            <span>{data.subtitle || DEFAULT_MANIFESTO.subtitle}</span>
          </div>
        </div>

        {/* Right Column: Backstage Photo */}
        <div className="lg:col-span-4 w-full">
          <MediaPlaceholder
            src={data.image || "/images/hero/manifesto-rehearsal.jpg"}
            aspectRatio="1:1"
            title="ENSAYO EN BACKSTAGE"
            description="EXPERIENCIA FORMATIVA EN SALÓN DE ENSAYOS"
            variant="concrete"
            className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
}
