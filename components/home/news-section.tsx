"use client";

import React, { useState, useEffect } from "react";
import { Article } from "@/types/mock";
import SectionHeading from "@/components/ui/section-heading";
import QuickReaderModal from "@/components/ui/quick-reader-modal";

interface NewsSectionProps {
  initialArticles?: Article[];
}

export default function NewsSection({ initialArticles = [] }: NewsSectionProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles && data.articles.length > 0) {
          const published = data.articles.filter((a: Article) => a.status === "PUBLISHED");
          if (published.length > 0) {
            setArticles(published);
          }
        }
      })
      .catch(() => {});
  }, []);

  const openReader = (article: Article) => {
    setActiveArticle(article);
    setIsReaderOpen(true);
  };

  return (
    <section id="noticias" className="relative w-full py-20 px-6 border-b-4 border-border-editorial bg-background-main" aria-labelledby="heading-noticias">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="06"
          label="Actualidad Escénica"
          title="Últimas Noticias & Novedades"
        />

        {articles.length === 0 ? (
          <div className="border-2 border-dashed border-border-editorial p-12 text-center text-xs text-text-muted font-mono uppercase tracking-widest bg-background-sec/20 flex flex-col items-center justify-center gap-3 rounded-2xl">
            <span className="text-3xl">📰</span>
            <span className="text-accent-red font-bold">Nuevas Noticias en Redacción</span>
            <span className="text-zinc-400 font-normal">Próximamente se publicarán las crónicas de ensayos y comunicados oficiales.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 6).map((article) => {
              const dateStr = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Reciente";

              return (
                <article
                  key={article.id}
                  onClick={() => openReader(article)}
                  className="group bg-[#0D0D12] border border-[#22222A] hover:border-accent-red/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-md cursor-pointer"
                >
                  {/* Thumbnail Cover */}
                  <div className="w-full aspect-[16/10] bg-black overflow-hidden relative border-b border-[#22222A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.featuredImage || "/images/hero/hero-stage.jpg"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Tag on top of image */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-mono text-accent-red border border-accent-red/30 font-bold uppercase tracking-wider">
                      {article.category || "Noticias"}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-zinc-300">
                      ⏱ {article.readTimeMinutes || 3} min
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                        <span>📅 {dateStr}</span>
                        <span>{article.authorName || "Redacción DV"}</span>
                      </div>

                      <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover:text-accent-red transition-colors leading-tight">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal leading-relaxed line-clamp-3">
                        {article.excerpt || "Descubre los detalles, avances y noticias más recientes de la comunidad artística de DV Performing Arts."}
                      </p>
                    </div>

                    {/* Footer link */}
                    <div className="pt-4 border-t border-[#22222A] flex items-center justify-between text-xs font-semibold text-accent-red group-hover:translate-x-1 transition-transform">
                      <span>Leer Noticia Completa &rarr;</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* Quick Reader Modal */}
      <QuickReaderModal
        article={activeArticle}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />
    </section>
  );
}
