"use client";

import React, { useEffect } from "react";
import { Article } from "@/types/mock";
import EditorialLabel from "@/components/ui/editorial-label";

interface QuickReaderModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickReaderModal({
  article,
  isOpen,
  onClose,
}: QuickReaderModalProps) {
  // Lock body scroll and handle escape key close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-background-main/80 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-title"
    >
      {/* Click outside overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} aria-hidden="true" />

      {/* Main Drawer Container */}
      <div className="relative w-full max-w-2xl h-full md:h-[90vh] bg-background-sec border-4 border-text-main text-text-main flex flex-col z-10 shadow-2xl p-6 sm:p-8 overflow-y-auto">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center pb-4 border-b border-border-editorial-light mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-text-muted">
              REVISTA ART-ID: {article.id}
            </span>
            <EditorialLabel status={article.status} className="scale-75" />
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 border-2 border-border-editorial-light hover:border-accent-red font-mono text-[10px] uppercase tracking-widest text-text-main hover:text-accent-red transition-colors cursor-pointer"
            aria-label="Cerrar lector"
          >
            [ CERRAR ]
          </button>
        </div>

        {/* Article Content Layout */}
        <article className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] text-accent-red uppercase tracking-[0.2em] font-bold">
              [ ARTÍCULO CULTURAL ]
            </span>
            <h2 id="reader-title" className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter text-text-main leading-[0.82]">
              {article.title}
            </h2>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-text-muted pb-4 border-b border-border-editorial-light">
            <span>Escrito por: {article.authorName}</span>
            <span>Fecha: {article.publishedAt ? article.publishedAt.toLocaleDateString("es-MX") : "PENDIENTE DE PUBLICACIÓN"}</span>
          </div>

          {/* Simulated Magazine Full Text content */}
          <div className="font-sans text-sm text-text-muted leading-relaxed uppercase tracking-wider font-medium flex flex-col gap-4">
            <p className="font-bold text-text-main border-l-4 border-accent-red pl-4 italic">
              {article.excerpt}
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. En el backstage de las artes escénicas en León, Guanajuato, la experimentación es el núcleo. Los alumnos se preparan físicamente, afinan sus cuerdas vocales y ensayan rutinas de movimiento bajo la estricta y apasionada guía de directores profesionales.
            </p>
            <p className="font-editorial text-lg text-text-main italic my-4 border-y border-border-editorial-light py-4 text-center">
              &ldquo;La disciplina no es una limitación, sino la llave que abre el escenario al infinito.&rdquo;
            </p>
            <p>
              El motor editorial Manifiesto 21 promueve la reflexión crítica sobre el teatro independiente, la ópera clásica, la danza experimental y la fusión de géneros. La academia de DV Performing Arts promueve un espacio de debate cultural vivo, libre de solemnidad académica, fomentando la juventud creativa.
            </p>
          </div>

          {/* Interactive footer actions inside drawer */}
          <div className="mt-8 border-t border-border-editorial-light pt-6 flex flex-wrap gap-4 items-center justify-between font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-accent-red animate-pulse" />
              <span className="text-text-muted uppercase">MANIFIESTO 21 SECURE FEED</span>
            </div>
            <button
              onClick={() => alert("¡Artículo compartido con éxito (Simulación)! Totalmente integrado en la base técnica.")}
              className="px-4 py-2 bg-accent-red text-text-main hover:bg-text-main hover:text-accent-red transition-all duration-200 uppercase font-bold tracking-widest border-2 border-accent-red"
            >
              Compartir Lectura
            </button>
          </div>
        </article>

      </div>
    </div>
  );
}
