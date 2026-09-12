import React from "react";
import ButtonLink from "@/components/ui/button-link";
import MediaPlaceholder from "@/components/ui/media-placeholder";
import { WebsiteContent } from "@/lib/storage";

interface HomeHeroProps {
  content?: WebsiteContent["hero"];
}

const DEFAULT_HERO: WebsiteContent["hero"] = {
  badgeText: "[ESTUDIO DE ENTRENAMIENTO] • ACTO I",
  headline: "DISCIPLINA\nESCENARIO\nMOVIMIENTO.",
  subtitle: "Academia de formación integral en Teatro Musical en León, Gto. Desarrollamos el talento escénico a través de canto, danza y actuación con rigor técnico, pasión y compromiso artístico.",
  primaryCtaText: "Ver Programas",
  secondaryCtaText: "Audiciones Abiertas",
  heroImage: "/images/hero/hero-stage.jpg",
  auditionNotice: "Audiciones abiertas para el musical “Si no es ahora”. Inicia tu registro oficial.",
};

export default function HomeHero({ content }: HomeHeroProps) {
  const heroData = {
    ...DEFAULT_HERO,
    ...(content || {}),
  };

  // Process headline lines for condensed theatrical typography
  const rawHeadline = heroData.headline || DEFAULT_HERO.headline;
  const headlineLines = rawHeadline.split("\n").filter((l) => l.trim().length > 0);

  return (
    <section className="relative w-full py-16 md:py-24 px-6 bg-transparent overflow-hidden border-b-4 border-border-editorial" aria-label="Introducción principal">
      {/* Background signal coords text */}
      <div className="absolute top-4 right-6 font-mono text-[9px] text-text-muted tracking-widest uppercase pointer-events-none select-none">
        LOC: LEÓN, GTO / 21.1219° N, 101.6825° W
      </div>

      <div className="mx-auto max-w-container-max flex flex-col lg:flex-row gap-12 items-stretch">
        {/* Left Column: Heading and Details */}
        <div className="flex-1 flex flex-col justify-between gap-8 z-10 lg:max-w-[60%]">
          
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2.5 font-mono text-[10px] tracking-[0.25em] text-accent-red uppercase">
              <span>{heroData.badgeText || "[ESTUDIO DE ENTRENAMIENTO] • ACTO I"}</span>
            </div>

            {/* Giant, tall condensed display title */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.2rem] font-extrabold uppercase tracking-tighter text-text-main leading-[0.78] select-none">
              {headlineLines.length > 0 ? (
                headlineLines.map((line, idx) => {
                  const isAccent = idx === 1 || (headlineLines.length === 1 && line.includes("ESCENARIO"));
                  return (
                    <React.Fragment key={idx}>
                      {isAccent ? (
                        <span className="text-accent-red">{line}</span>
                      ) : (
                        line
                      )}
                      {idx < headlineLines.length - 1 && <br />}
                    </React.Fragment>
                  );
                })
              ) : (
                <>
                  DISCIPLINA
                  <br />
                  <span className="text-accent-red">ESCENARIO</span>
                  <br />
                  MOVIMIENTO.
                </>
              )}
            </h1>
          </div>

          <div className="flex flex-col gap-6 max-w-lg">
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-sans font-normal whitespace-pre-line">
              {heroData.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-1">
              <ButtonLink href="#programas" variant="primary">
                {heroData.primaryCtaText || "Ver Programas"}
              </ButtonLink>
              <ButtonLink href="#audiciones" variant="secondary">
                {heroData.secondaryCtaText || "Audiciones Abiertas"}
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Right Column: Layered Graphic Placeholder */}
        <div className="flex-1 flex items-center justify-center relative min-h-[360px] lg:min-h-auto">
          {/* Main Large Visual Block */}
          <div className="w-full relative z-0 md:pl-8 lg:pl-0">
            <MediaPlaceholder
              src={heroData.heroImage || "/images/hero/hero-stage.jpg"}
              aspectRatio="3:4"
              title="DV PERFORMING ARTS"
              description="ACADEMIA DE TEATRO MUSICAL & ARTES ESCÉNICAS"
              variant="red"
              className="w-full max-w-[400px] mx-auto border-4 border-text-main shadow-[12px_12px_0px_0px_rgba(30,30,36,0.8)]"
            />
            
            {/* Superimposed label card */}
            {heroData.auditionNotice && (
              <div className="absolute -bottom-4 -left-2 md:left-2 bg-[#0A0A0C] border-2 border-border-editorial-light p-4 z-10 font-mono text-[9px] uppercase tracking-widest text-text-main max-w-[220px]">
                <span className="text-accent-red block font-bold mb-1">CONVOCATORIA ACTIVA</span>
                <span className="text-zinc-300 font-normal leading-tight block">{heroData.auditionNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
