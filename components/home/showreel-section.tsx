"use client";

import React, { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/section-heading";
import MediaPlaceholder from "@/components/ui/media-placeholder";

export default function ShowreelSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Manage body scroll locking when modal video is active
  useEffect(() => {
    if (isPlaying) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPlaying]);

  return (
    <section className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-showreel">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="04"
          label="Registro Audiovisual"
          title="Experiencia Escénica"
        />

        {/* Video Box Wrapper */}
        <div className="max-w-4xl mx-auto w-full">
          <div
            onClick={() => setIsPlaying(true)}
            className="relative group border-4 border-text-main overflow-hidden shadow-lg cursor-pointer"
          >
            {/* Aspect Video Placeholder */}
            <MediaPlaceholder
              aspectRatio="16:9"
              title="SHOWREEL MULTIMEDIA"
              description="REPRODUCTOR DE VÍDEO INTERACTIVO - CLIC PARA REPRODUCIR"
              variant="dark"
              className="w-full transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Play Button Overlay (Stylized and clickable) */}
            <div className="absolute inset-0 flex items-center justify-center select-none">
              <div className="w-20 h-20 rounded-full border-4 border-text-main bg-accent-red flex items-center justify-center text-text-main hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl cursor-pointer">
                <svg
                  className="w-8 h-8 text-text-main ml-1.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Technical Specs list */}
          <div className="mt-4 text-[9px] font-mono text-text-muted uppercase tracking-widest flex flex-wrap justify-between items-center gap-2">
            <span>Video sugerido: MP4/WebM 4K H.264</span>
            <span>Relación de aspecto: 16:9 Horizontal</span>
            <span>Duración máxima: 120 segundos</span>
          </div>
        </div>

      </div>

      {/* Video Player Modal */}
      {isPlaying && (
        <div
          className="fixed inset-0 z-50 bg-background-main/95 flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Reproductor de Showreel"
        >
          {/* Close trigger overlay */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsPlaying(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-4xl bg-[#08080A] border-4 border-text-main z-10 shadow-2xl flex flex-col">
            {/* Top Bar inside player */}
            <div className="flex justify-between items-center px-4 py-3 border-b-2 border-border-editorial font-mono text-[9px] tracking-widest uppercase text-text-muted">
              <span>[REPRODUCIENDO SHOWREEL PROVISIONAL]</span>
              <button
                onClick={() => setIsPlaying(false)}
                className="px-2 py-1 border border-border-editorial hover:border-accent-red hover:text-accent-red transition-colors text-text-main cursor-pointer"
              >
                Cerrar [X]
              </button>
            </div>

            {/* Video Player Box */}
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              {/* Using a high-quality free stock video for testing to show real motion! */}
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-41983-large.mp4"
                className="w-full h-full object-cover"
                autoPlay
                controls
                loop
              />
            </div>

            {/* Bottom details */}
            <div className="p-4 border-t border-border-editorial font-mono text-[8px] sm:text-[9px] text-text-muted uppercase flex justify-between items-center">
              <span>DV PERFORMING ARTS &bull; BACKSTAGE REEL</span>
              <span>ESTATUS: SIMULACIÓN ACTIVA</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
