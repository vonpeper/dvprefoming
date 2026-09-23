"use client";

import React, { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/section-heading";
import MediaPlaceholder from "@/components/ui/media-placeholder";

export interface ShowreelContent {
  tag?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  posterImage?: string;
  videoUrl?: string;
}

export interface ShowreelSectionProps {
  content?: ShowreelContent;
}

export function parseVideoSource(rawUrl?: string): { type: "youtube" | "vimeo" | "video"; embedUrl: string } {
  const url = (rawUrl || "").trim();
  if (!url) {
    return {
      type: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/NEImqBBcx1o?autoplay=1&rel=0",
    };
  }

  // YouTube match: watch?v=ID, youtu.be/ID, embed/ID, shorts/ID
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // Vimeo match: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Direct video file (mp4, webm, mov, ogg, or local /images/uploads/...)
  if (url.match(/\.(mp4|webm|mov|ogg)($|\?)/i) || url.startsWith("/images/uploads/") || url.startsWith("/videos/")) {
    return {
      type: "video",
      embedUrl: url,
    };
  }

  // Fallback iframe
  return {
    type: "youtube",
    embedUrl: url.includes("autoplay=1") ? url : `${url}${url.includes("?") ? "&" : "?"}autoplay=1`,
  };
}

export default function ShowreelSection({ content }: ShowreelSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const title = content?.title || "Experiencia Escénica";
  const rawTag = content?.tag || "04 • REGISTRO AUDIOVISUAL";
  const tagNumber = rawTag.match(/^\d+/)?.[0] || "04";
  const tagLabel = rawTag.replace(/^\d+\s*[•·-]?\s*/, "") || "Registro Audiovisual";
  const subtitle = content?.subtitle || "SHOWREEL OFICIAL";
  const description = content?.description || "REPRODUCTOR DE VÍDEO INTERACTIVO - CLIC PARA REPRODUCIR";
  const posterImage = content?.posterImage || "/images/productions/galeria-show.jpg";
  const videoData = parseVideoSource(content?.videoUrl);

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
          number={tagNumber}
          label={tagLabel}
          title={title}
        />

        {/* Video Box Wrapper */}
        <div className="max-w-4xl mx-auto w-full">
          <div
            onClick={() => setIsPlaying(true)}
            className="relative group border-4 border-text-main overflow-hidden shadow-lg cursor-pointer"
          >
            {/* Aspect Video Placeholder / Poster Image */}
            <MediaPlaceholder
              src={posterImage}
              alt={title}
              aspectRatio="16:9"
              title={subtitle}
              description={description}
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
            <span>Video sugerido: MP4/WebM 4K H.264 o YouTube</span>
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
              <span>[REPRODUCIENDO SHOWREEL OFICIAL &bull; DV PERFORMING ARTS]</span>
              <button
                onClick={() => setIsPlaying(false)}
                className="px-2 py-1 border border-border-editorial hover:border-accent-red hover:text-accent-red transition-colors text-text-main cursor-pointer"
              >
                Cerrar [X]
              </button>
            </div>

            {/* Video Player Box */}
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              {videoData.type === "video" ? (
                <video
                  src={videoData.embedUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={videoData.embedUrl}
                  title="DV Performing Arts Showreel"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>

            {/* Bottom details */}
            <div className="p-4 border-t border-border-editorial font-mono text-[8px] sm:text-[9px] text-text-muted uppercase flex justify-between items-center">
              <span>DV PERFORMING ARTS &bull; {title.toUpperCase()}</span>
              <span>LEÓN, GUANAJUATO</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
