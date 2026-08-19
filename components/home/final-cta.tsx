import React from "react";
import ButtonLink from "@/components/ui/button-link";

export default function FinalCta() {
  return (
    <section id="contacto" className="relative w-full py-20 md:py-24 px-4 sm:px-6 bg-accent-red text-text-main border-b-4 border-text-main" aria-label="Llamado a la acción final">
      {/* Background signal labels */}
      <div className="absolute top-4 right-6 font-mono text-[9px] text-text-main/60 tracking-widest uppercase pointer-events-none select-none hidden sm:block">
        DV PERFORMING ARTS &bull; CALL FOR TALENT
      </div>

      <div className="mx-auto max-w-container-max text-center flex flex-col items-center gap-6">
        
        <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] text-text-main bg-background-main/30 px-3 py-1 uppercase font-bold rounded-full">
          <span>ÚNETE AL ENTRENAMIENTO</span>
          <span className="w-1.5 h-1.5 bg-text-main rounded-full" />
          <span>LEÓN GTO</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase text-text-main max-w-3xl leading-tight">
          EL PRIMER PASO PARA DOMINAR EL ESCENARIO COMIENZA AQUÍ.
        </h2>

        <p className="text-sm sm:text-base text-text-main/90 leading-relaxed max-w-2xl font-sans font-normal mb-2">
          Solicita informes sobre nuestras disciplinas, inscripciones y agenda una clase muestra en nuestras instalaciones de Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.
        </p>

        {/* WhatsApp Direct Action Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <ButtonLink
            href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20me%20gustar%C3%ADa%20solicitar%20informes%20de%20clases%20e%20inscripciones"
            variant="secondary"
            className="bg-background-main text-text-main border-background-main hover:bg-transparent hover:text-background-main hover:border-background-main text-sm font-bold py-3.5 px-8 shadow-2xl rounded-xl flex items-center gap-2"
          >
            <span>📱</span>
            <span>Escribir por WhatsApp: 477 655 8156</span>
          </ButtonLink>
        </div>

        {/* Attention Notice */}
        <span className="font-mono text-[10px] text-text-main/80 mt-6 uppercase tracking-wider block">
          ATENCIÓN A NUESTROS ARTISTAS &bull; HORARIOS: L-V 16:00 - 20:00 | SÁB 10:00 - 15:00
        </span>

      </div>
    </section>
  );
}
