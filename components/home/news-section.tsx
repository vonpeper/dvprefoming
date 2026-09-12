"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/types/mock";
import SectionHeading from "@/components/ui/section-heading";

interface NewsSectionProps {
  initialArticles?: Article[];
}

export default function NewsSection({ initialArticles = [] }: NewsSectionProps) {
  const [articles, setArticles] = useState<Article[]>(() => {
    const published = initialArticles.filter((a) => (a.status || "PUBLISHED") === "PUBLISHED");
    return published
      .sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);
  });

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles)) {
          const published = data.articles.filter((a: Article) => (a.status || "PUBLISHED") === "PUBLISHED");
          const sorted = published.sort((a: Article, b: Article) => {
            const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
            const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
            return timeB - timeA;
          });
          setArticles(sorted.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  const featuredArticle = articles[0] || null;
  const secondaryArticles = articles.slice(1, 5);

  const formatDate = (dateValue?: Date | string | null) => {
    if (!dateValue) return "Reciente";
    try {
      return new Date(dateValue).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Reciente";
    }
  };

  return (
    <section id="noticias" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-border-editorial bg-transparent" aria-labelledby="heading-noticias">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="06"
          label="Actualidad Escénica & Crónicas"
          title="Últimas Noticias & Novedades"
        />

        {/* Subtitle & Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 -mt-4 border-b border-[#222228] pb-4">
          <p className="text-zinc-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Entérate de convocatorias, montajes, avances en sala de ensayos y noticias exclusivas de DV Performing Arts.
          </p>
          <span className="font-mono text-[11px] uppercase text-purple-400 tracking-wider font-bold bg-purple-950/40 border border-purple-500/40 px-3.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            5 NOTAS MÁS RECIENTES
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="border-2 border-dashed border-[#22222A] p-12 text-center text-xs text-text-muted font-mono uppercase tracking-widest bg-background-sec/20 flex flex-col items-center justify-center gap-3 rounded-3xl">
            <span className="text-4xl">📰</span>
            <span className="text-accent-red font-bold text-sm">Nuevas Noticias en Redacción</span>
            <span className="text-zinc-400 font-normal max-w-md">Próximamente se publicarán las crónicas de ensayos, llamados a audición y comunicados oficiales.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* 5-Article Editorial Magazine Grid: 1 Featured Main (Left) + 4 Compact Grid (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* FEATURED MAIN ARTICLE (#1 - Most Recent) */}
              {featuredArticle && (
                <div className={`${secondaryArticles.length > 0 ? "lg:col-span-6" : "lg:col-span-12"} flex flex-col`}>
                  <Link
                    href={`/noticias/${featuredArticle.slug}`}
                    className="group relative bg-[#0D0D12]/95 backdrop-blur-md border-2 border-[#22222E] hover:border-rose-500/80 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl h-full cursor-pointer"
                  >
                    {/* Top Image Banner */}
                    <div className="w-full aspect-[16/10] bg-black overflow-hidden relative border-b border-[#202028]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredArticle.featuredImage || "/images/hero/hero-stage.jpg"}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-black/60 pointer-events-none" />

                      {/* Badges on Top */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                        <span className="px-3.5 py-1 bg-gradient-to-r from-rose-600 to-purple-600 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                          <span>★</span> ÚLTIMA NOTICIA
                        </span>

                        <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-purple-300 font-mono text-[10px] uppercase font-bold tracking-wider rounded-full">
                          {featuredArticle.category || "Teatro Musical"}
                        </span>
                      </div>

                      {/* Bottom Image Tag */}
                      <div className="absolute bottom-3 right-4 z-10">
                        <span className="bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-300">
                          ⏱ {featuredArticle.readTimeMinutes || 3} min de lectura
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs font-mono text-zinc-400 pb-2 border-b border-[#20202A]">
                          <span className="text-purple-400 font-semibold">📅 {formatDate(featuredArticle.publishedAt)}</span>
                          <span className="text-zinc-400">✍️ {featuredArticle.authorName || "Redacción DV"}</span>
                        </div>

                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-rose-400 transition-colors leading-tight">
                          {featuredArticle.title}
                        </h3>

                        <p className="text-sm text-zinc-300 font-sans font-normal leading-relaxed line-clamp-4">
                          {featuredArticle.excerpt || "Descubre los detalles, avances y crónicas más recientes de la comunidad artística de DV Performing Arts."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#20202A] flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300 transition-all">
                        <span>Leer Artículo Completo &rarr;</span>
                        <span className="text-zinc-500 font-mono text-[11px]">Artículo #1</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* 4 SECONDARY ARTICLES (#2, #3, #4, #5) */}
              {secondaryArticles.length > 0 && (
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {secondaryArticles.map((article, idx) => {
                    const articleNum = idx + 2;
                    return (
                      <Link
                        key={article.id}
                        href={`/noticias/${article.slug}`}
                        className="group bg-[#0D0D12]/95 backdrop-blur-md border-2 border-[#202028] hover:border-purple-500/70 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg cursor-pointer"
                      >
                        {/* Thumbnail Cover */}
                        <div className="w-full aspect-[16/9] bg-black overflow-hidden relative border-b border-[#202028]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.featuredImage || "/images/hero/hero-stage.jpg"}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-mono text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
                            {article.category || "Noticias"}
                          </div>
                          <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono text-zinc-400">
                            #{articleNum}
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                              <span>📅 {formatDate(article.publishedAt)}</span>
                              <span>⏱ {article.readTimeMinutes || 3} min</span>
                            </div>

                            <h4 className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
                              {article.title}
                            </h4>

                            <p className="text-xs text-zinc-400 font-sans font-normal leading-relaxed line-clamp-2">
                              {article.excerpt || "Crónicas, anuncios y novedades de la academia."}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#1C1C24] flex items-center justify-between text-[11px] font-bold text-purple-400 group-hover:text-purple-300 transition-all">
                            <span>Leer más &rarr;</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Bottom Archive Link */}
            <div className="flex justify-center pt-4">
              <Link
                href="/noticias"
                className="px-6 py-3 rounded-2xl bg-[#14141E] hover:bg-[#1C1C2A] text-zinc-200 hover:text-white border border-[#2B2B3E] hover:border-purple-500/50 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
              >
                <span>📰</span>
                <span>Explorar Todas las Noticias & Archivo Completo</span>
                <span>&rarr;</span>
              </Link>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
