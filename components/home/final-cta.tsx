import React from "react";
import ButtonLink from "@/components/ui/button-link";

export default function FinalCta() {
  return (
    <section id="contacto" className="relative w-full py-24 px-6 bg-accent-red text-text-main border-b-4 border-text-main" aria-label="Llamado a la acción final">
      {/* Background technical labels */}
      <div className="absolute top-4 right-6 font-mono text-[9px] text-text-main/60 tracking-widest uppercase pointer-events-none select-none">
        DV PERFORMING ARTS &bull; CALL FOR TALENT
      </div>

      <div className="mx-auto max-w-container-max text-center flex flex-col items-center gap-6">
        
        <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.25em] text-text-main bg-background-main/30 px-3 py-1 uppercase font-bold">
          <span>[ÚNETE AL ENTRENAMIENTO]</span>
          <span className="w-1.5 h-1.5 bg-text-main" />
          <span>STG-B ACCESS</span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter uppercase text-text-main max-w-3xl leading-[0.82]">
          EL PRIMER PASO PARA DOMINAR EL ESCENARIO COMIENZA AQUÍ.
        </h2>

        <p className="text-xs sm:text-sm text-text-main/80 leading-relaxed max-w-xl font-sans font-bold uppercase tracking-widest mb-4">
          Solicita informes sobre nuestras disciplinas, costos y agenda una sesión muestra en nuestras instalaciones de León, Guanajuato.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Button link to email with inverted background color theme */}
          <ButtonLink
            href="mailto:info-pendiente@dvperformingarts.com"
            variant="secondary"
            className="bg-background-main text-text-main border-background-main hover:bg-transparent hover:text-background-main hover:border-background-main"
          >
            Solicitar Información
          </ButtonLink>
          <ButtonLink
            href="#programas"
            variant="secondary"
            className="bg-transparent text-text-main border-text-main hover:bg-text-main hover:text-accent-red"
          >
            Ver Programas Académicos
          </ButtonLink>
        </div>

        {/* Technical Notice */}
        <span className="font-mono text-[8px] text-text-main/50 mt-8 uppercase tracking-widest block">
          * LOS ENLACES DE CONTACTO APUNTAN A BUZONES DE PRUEBA Y SECCIONES INTERNAS
        </span>

      </div>
    </section>
  );
}
