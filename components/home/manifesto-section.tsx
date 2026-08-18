import React from "react";
import MediaPlaceholder from "@/components/ui/media-placeholder";

export default function ManifestoSection() {
  return (
    <section className="relative w-full py-20 px-6 border-b-4 border-border-editorial bg-background-sec" aria-label="Declaración de principios">
      <div className="mx-auto max-w-container-max grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Graphic Text block resembling an art poster */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] text-accent-red uppercase">
            <span>[DECLARACIÓN]</span>
            <span className="w-1 h-1 bg-accent-red" />
            <span>NUESTRO MANIFIESTO</span>
          </div>

          <h3 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase text-text-main leading-[0.82]">
            EL ESCENARIO NO ES UN PASATIEMPO.
            <br />
            ES UN <span className="bg-accent-red text-text-main px-2 py-0.5">ESPACIO DE CONFRONTACIÓN</span>.
          </h3>

          <p className="text-sm text-text-muted leading-relaxed max-w-xl font-sans font-bold uppercase tracking-widest">
            Creemos en la formación artística rigurosa. Moldeamos el carácter, la empatía y la presencia de la nueva generación creativa de León. Técnica, disciplina y sudor detrás del telón.
          </p>

          <div className="border-t border-border-editorial-light pt-6 text-[10px] font-mono text-text-muted uppercase tracking-wider">
            <span>REGISTRO DE PROPUESTA VISUAL EN DESARROLLO &bull; ACTO II</span>
          </div>
        </div>

        {/* Right Column: Dynamic placeholder to represent backstage photo */}
        <div className="lg:col-span-4 w-full">
          <MediaPlaceholder
            aspectRatio="1:1"
            title="ENSAYO EN BACKSTAGE"
            description="FOTOGRAFÍA DE ENSAYO FALTANTE"
            variant="concrete"
            className="w-full border-2 border-text-main"
          />
        </div>

      </div>
    </section>
  );
}
