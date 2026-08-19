import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getStoredArticles } from "@/lib/storage";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";
import SectionHeading from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Noticias & Novedades | DV Performing Arts",
  description: "Explora todas las noticias, crónicas de ensayos, convocatorias y vida estudiantil de DV Performing Arts.",
};

export default async function NewsArchivePage() {
  const articles = getStoredArticles().filter((a) => (a.status || "PUBLISHED") === "PUBLISHED");

  return (
    <div className="flex flex-col min-h-screen bg-[#07070A] text-text-main font-sans selection:bg-accent-red selection:text-text-main relative overflow-x-hidden">
      <TheatricalAuroraBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-mono">
          <Link href="/" className="hover:text-rose-400 transition-colors">
            Inicio
          </Link>
          <span>&rsaquo;</span>
          <span className="text-zinc-300 font-semibold">Noticias & Novedades</span>
        </nav>

        {/* Section Heading */}
        <SectionHeading
          number="ARCHIVOS"
          label="Prensa & Actualidad"
          title="Noticias de la Academia"
        />

        {articles.length === 0 ? (
          <div className="border-2 border-dashed border-border-editorial p-16 text-center text-xs text-zinc-400 font-mono uppercase tracking-widest bg-background-sec/20 rounded-3xl flex flex-col items-center justify-center gap-3 my-8">
            <span className="text-4xl">📰</span>
            <span className="text-rose-400 font-bold">Próximas publicaciones en redacción</span>
            <span className="text-zinc-500 font-normal">Estamos redactando nuevas notas y comunicados oficiales.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-8">
            {articles.map((article) => {
              const dateStr = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Reciente";

              return (
                <Link
                  key={article.id}
                  href={`/noticias/${article.slug}`}
                  className="group bg-[#0D0D12]/90 backdrop-blur-md border border-[#22222A] hover:border-rose-500/60 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-xl cursor-pointer"
                >
                  <div className="w-full aspect-[16/10] bg-black overflow-hidden relative border-b border-[#22222A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.featuredImage || "/images/hero/hero-stage.jpg"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-purple-300 border border-purple-500/30 font-bold uppercase">
                      {article.category || "Noticias"}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                        <span>📅 {dateStr}</span>
                        <span>{article.authorName || "Redacción DV"}</span>
                      </div>

                      <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover:text-rose-400 transition-colors leading-tight">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal leading-relaxed line-clamp-3">
                        {article.excerpt || "Descubre los detalles, avances y noticias más recientes de la comunidad artística de DV Performing Arts."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#22222A] flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300 group-hover:translate-x-1 transition-all">
                      <span>Leer Noticia Completa &rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </main>

      <SiteFooter />
    </div>
  );
}
