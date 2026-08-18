"use client";

import React, { useState } from "react";
import { Article } from "@/types/mock";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";
import MediaPlaceholder from "@/components/ui/media-placeholder";
import QuickReaderModal from "@/components/ui/quick-reader-modal";

interface EditorialSectionProps {
  articles: Article[];
}

export default function EditorialSection({ articles }: EditorialSectionProps) {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Split articles to create a hierarchical magazine layout
  const articleDominant = articles[0];
  const secondaryArticles = articles.slice(1);

  const openReader = (article: Article) => {
    setActiveArticle(article);
    setIsReaderOpen(true);
  };

  const closeReader = () => {
    setIsReaderOpen(false);
  };

  return (
    <section id="revista" className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-revista">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="06"
          label="EDITORIAL"
          title="Revista de Difusión"
        />

        {articles.length === 0 ? (
          <div className="border-4 border-dashed border-border-editorial p-12 text-center text-xs text-text-muted font-mono uppercase tracking-widest bg-background-sec/20 flex flex-col items-center justify-center gap-4 min-h-[240px]">
            <span className="text-3xl">📭</span>
            <span className="text-accent-red font-bold">EDICIÓN EN PREPARACIÓN</span>
            <span>El canal editorial no contiene artículos publicados en este entorno.</span>
          </div>
        ) : (
          /* Magazine Cover Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Main Dominant Article (Spans 8 cols on large screens) */}
            {articleDominant && (
              <article className="lg:col-span-8 group flex flex-col gap-6">
                <div
                  className="w-full border-4 border-text-main relative shadow-lg cursor-pointer overflow-hidden"
                  onClick={() => openReader(articleDominant)}
                >
                  <MediaPlaceholder
                    aspectRatio="16:9"
                    title="PORTADA DE ARTÍCULO"
                    description="FOTOGRAFÍA OFICIAL DE PORTADA EDITORIAL PENDIENTE"
                    variant="red"
                    className="w-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-accent-red text-text-main px-3 py-1 font-mono text-[9px] uppercase tracking-widest font-bold">
                    ARTÍCULO PRINCIPAL
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border-editorial-light">
                    <span className="font-mono text-[9px] text-text-muted">
                      BLOG-COD: {articleDominant.id}
                    </span>
                    <EditorialLabel status={articleDominant.status} className="scale-90" />
                  </div>

                  <h3
                    className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tighter text-text-main group-hover:text-accent-red transition-colors duration-200 leading-[0.82] cursor-pointer"
                    onClick={() => openReader(articleDominant)}
                  >
                    {articleDominant.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans font-bold uppercase tracking-widest">
                    {articleDominant.excerpt}
                  </p>

                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-text-muted border-t border-border-editorial-light pt-4">
                    <span>Autor: {articleDominant.authorName}</span>
                    <span>TEMP-21</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => openReader(articleDominant)}
                      className="px-6 py-3.5 bg-accent-red text-text-main border-2 border-accent-red hover:bg-transparent hover:text-accent-red transition-all duration-200 font-sans text-[11px] uppercase tracking-[0.18em] font-bold cursor-pointer"
                    >
                      Leer Edición Completa
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* Secondary Stack Column (Spans 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <span className="font-mono text-[10px] tracking-[0.25em] text-accent-red uppercase font-bold block pb-2 border-b-2 border-accent-red">
                Artículos Relacionados
              </span>

              {secondaryArticles.length > 0 ? (
                secondaryArticles.map((article) => (
                  <article key={article.id} className="group flex flex-col gap-3 pb-6 border-b border-border-editorial-light">
                    <div className="flex justify-between items-center text-[8px] font-mono text-text-muted uppercase">
                      <span>{article.id}</span>
                      <EditorialLabel status={article.status} className="scale-75" />
                    </div>
                    <h4
                      className="font-display text-2xl font-extrabold uppercase tracking-tighter text-text-main group-hover:text-accent-red transition-colors duration-200 leading-[0.82] cursor-pointer"
                      onClick={() => openReader(article)}
                    >
                      {article.title}
                    </h4>
                    <p className="text-[11px] text-text-muted font-sans font-medium line-clamp-3">
                      {article.excerpt}
                    </p>
                    <button
                      onClick={() => openReader(article)}
                      className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent-red hover:text-text-main transition-colors text-left cursor-pointer"
                    >
                      [ LEER MÁS ]
                    </button>
                  </article>
                ))
              ) : (
                <div className="border-2 border-dashed border-border-editorial p-6 text-center text-xs text-text-muted font-mono uppercase tracking-widest bg-background-sec/30">
                  <span className="block mb-2 text-accent-red font-bold">EDICIÓN EN PREPARACIÓN</span>
                  <span>Artículos secundarios pendientes de publicación.</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Interactive Modal Drawer */}
      <QuickReaderModal
        article={activeArticle}
        isOpen={isReaderOpen}
        onClose={closeReader}
      />
    </section>
  );
}
