import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, getStoredArticles } from "@/lib/storage";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";
import SocialShareButtons from "@/components/news/social-share-buttons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Noticia no encontrada | DV Performing Arts",
    };
  }

  const title = article.seoTitle || `${article.title} | DV Performing Arts`;
  const description = article.seoDescription || article.excerpt || "Noticias y crónicas de la academia DV Performing Arts.";
  const image = article.featuredImage || "/images/hero/hero-stage.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://dvperformingarts.com/noticias/${article.slug}`,
      siteName: "DV Performing Arts",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      authors: [article.authorName || "Redacción DV Performing Arts"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export async function generateStaticParams() {
  const articles = getStoredArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

interface EditorBlock {
  id: string;
  type: "heading_1" | "heading_2" | "heading_3" | "paragraph" | "blockquote" | "image" | "bullet_list" | "numbered_list" | "alert_box";
  content: string;
  extra?: string;
}

export default async function SingleArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.id, 4);

  // Parse structured blocks or fallback to raw content
  let blocks: EditorBlock[] = [];
  if (article.content) {
    try {
      const parsed = JSON.parse(article.content);
      if (Array.isArray(parsed)) {
        blocks = parsed;
      } else {
        blocks = [{ id: "b1", type: "paragraph", content: article.content }];
      }
    } catch {
      blocks = [{ id: "b1", type: "paragraph", content: article.content }];
    }
  }

  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Reciente";

  const keywordsArray = Array.isArray(article.keywords)
    ? article.keywords
    : article.keywords
    ? article.keywords.split(",").map((k) => k.trim())
    : ["TeatroMusical", "ArtesEscénicas", "LeónGto"];

  return (
    <div className="flex flex-col min-h-screen bg-[#07070A] text-text-main font-sans selection:bg-accent-red selection:text-text-main relative overflow-x-hidden">
      {/* Background Stage Atmosphere */}
      <TheatricalAuroraBackground />

      <SiteHeader />

      <main className="flex-1 relative z-10 py-8 md:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* ================= BREADCRUMBS ================= */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-mono">
          <Link href="/" className="hover:text-rose-400 transition-colors">
            Inicio
          </Link>
          <span>&rsaquo;</span>
          <Link href="/#noticias" className="hover:text-rose-400 transition-colors">
            Noticias & Novedades
          </Link>
          <span>&rsaquo;</span>
          <span className="text-zinc-300 font-semibold truncate max-w-xs sm:max-w-md">
            {article.category || "General"}
          </span>
        </nav>

        {/* ================= HERO HEADER ================= */}
        <header className="flex flex-col gap-6 mb-10">
          
          {/* Category & Date Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold font-mono bg-purple-600/20 text-purple-300 border border-purple-500/30">
              🎭 {article.category || "Noticias & Novedades"}
            </span>
            <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
              <span>📅</span> {dateStr}
            </span>
            <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
              <span>⏱️</span> {article.readTimeMinutes || 3} min de lectura
            </span>
          </div>

          {/* Article Title */}
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-[1.04]">
            {article.title}
          </h1>

          {/* Excerpt / Lead paragraph */}
          {article.excerpt && (
            <p className="text-base sm:text-xl text-zinc-300 font-normal leading-relaxed border-l-4 border-accent-red pl-4 py-1 italic bg-white/5 rounded-r-xl">
              {article.excerpt}
            </p>
          )}

          {/* Author & Share Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-y border-[#20202B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                DV
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{article.authorName || "Redacción DV Performing Arts"}</span>
                <span className="text-xs text-zinc-400">Prensa & Contenido Escénico</span>
              </div>
            </div>

            {/* Interactive Social Sharing */}
            <SocialShareButtons
              title={article.title}
              url={`https://dvperformingarts.com/noticias/${article.slug}`}
            />
          </div>

          {/* Featured Image */}
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden relative shadow-2xl border border-[#252535] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.featuredImage || "/images/hero/hero-stage.jpg"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </header>

        {/* ================= 2-COLUMN BLOG LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ================= MAIN ARTICLE BODY (8 COLS) ================= */}
          <article className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Blocks Content Canvas */}
            <div className="flex flex-col gap-6 text-zinc-200 text-base sm:text-lg leading-relaxed font-sans font-normal">
              {blocks.map((block) => {
                if (block.type === "heading_1") {
                  return (
                    <h2 key={block.id} className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase mt-6 pt-4 border-t border-[#20202B]">
                      {block.content}
                    </h2>
                  );
                }
                if (block.type === "heading_2") {
                  return (
                    <h2 key={block.id} className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase mt-6 pt-4 border-t border-[#20202B]">
                      {block.content}
                    </h2>
                  );
                }
                if (block.type === "heading_3") {
                  return (
                    <h3 key={block.id} className="font-display text-xl sm:text-2xl font-bold text-rose-300 tracking-tight mt-4">
                      {block.content}
                    </h3>
                  );
                }
                if (block.type === "blockquote") {
                  return (
                    <blockquote key={block.id} className="p-6 bg-purple-950/20 border-l-4 border-purple-500 rounded-r-2xl text-purple-200 italic font-serif text-lg sm:text-xl my-2 shadow-inner">
                      &ldquo;{block.content}&rdquo;
                    </blockquote>
                  );
                }
                if (block.type === "bullet_list") {
                  const items = block.content.split("\n").filter((l) => l.trim());
                  return (
                    <ul key={block.id} className="flex flex-col gap-2 my-2 pl-4">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-rose-500 font-bold mt-1">&bull;</span>
                          <span>{item.replace(/^[•\-*]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === "numbered_list") {
                  const items = block.content.split("\n").filter((l) => l.trim());
                  return (
                    <ol key={block.id} className="flex flex-col gap-2 my-2 pl-4">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-purple-400 font-mono font-bold">{idx + 1}.</span>
                          <span>{item.replace(/^\d+[.)]\s*/, "")}</span>
                        </li>
                      ))}
                    </ol>
                  );
                }
                if (block.type === "alert_box") {
                  return (
                    <div key={block.id} className="p-5 bg-rose-950/30 border border-rose-500/40 rounded-2xl text-rose-200 text-sm sm:text-base flex items-start gap-3 my-2 shadow-sm">
                      <span className="text-xl">📌</span>
                      <p className="font-medium leading-relaxed">{block.content}</p>
                    </div>
                  );
                }
                if (block.type === "image") {
                  return (
                    <div key={block.id} className="flex flex-col gap-2 my-4">
                      <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#252535] bg-black shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={block.content} alt={block.extra || "Imagen"} className="w-full h-full object-cover" />
                      </div>
                      {block.extra && (
                        <span className="text-xs text-zinc-400 font-mono text-center">
                          {block.extra}
                        </span>
                      )}
                    </div>
                  );
                }
                return (
                  <p key={block.id} className="leading-relaxed">
                    {block.content}
                  </p>
                );
              })}
            </div>

            {/* Keywords / Tags */}
            <div className="pt-8 border-t border-[#20202B] flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase font-mono mr-2">
                Palabras Clave:
              </span>
              {keywordsArray.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#14141C] hover:bg-purple-600/30 border border-[#282838] hover:border-purple-500 rounded-lg text-xs text-purple-300 font-mono transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Bottom Author Bio Card */}
            <div className="bg-[#121218] border border-[#252535] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shrink-0">
                DV
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
                    Redacción Oficial
                  </span>
                  <h4 className="text-xl font-bold text-white font-display">
                    {article.authorName || "DV Performing Arts"}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  Academia líder en formación escénica, danza urbana, canto y teatro musical en León, Guanajuato. Impulsamos a los artistas del mañana con disciplina y pasión sobre el escenario.
                </p>
                <div className="pt-2 flex justify-center sm:justify-start gap-3">
                  <Link
                    href="/#audiciones"
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
                  >
                    Audicionar para el elenco &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </article>

          {/* ================= SIDEBAR (4 COLS) ================= */}
          <aside className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            
            {/* Widget 1: Related / More News */}
            <div className="bg-[#121218] border border-[#252535] rounded-3xl p-6 shadow-xl flex flex-col gap-5">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-[#252535] pb-3 flex items-center justify-between">
                <span>Noticias Relacionadas</span>
                <span className="text-rose-400">✦</span>
              </h3>

              <div className="flex flex-col gap-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/noticias/${rel.slug}`}
                    className="group flex gap-3.5 items-center hover:bg-[#1A1A24] p-2 rounded-2xl transition-all"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-[#2A2A38] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rel.featuredImage || "/images/hero/hero-stage.jpg"}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                        {rel.category || "Noticias"}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Widget 2: Convocatoria de Audición Card */}
            <div className="bg-gradient-to-br from-rose-950/50 via-[#151520] to-purple-950/40 border border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
              <span className="text-3xl">🎭</span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  Convocatoria Abierta 2026
                </span>
                <h4 className="text-lg font-bold text-white font-display">
                  ¿Quieres formar parte del elenco?
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                  Inscríbete hoy en nuestro registro digital para audicionar en nuestras próximas producciones.
                </p>
              </div>

              <Link
                href="/#audiciones"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950/50 transition-all"
              >
                Ir al Registro de Audición ✨
              </Link>
            </div>

            {/* Widget 3: Obra en Cartelera */}
            <div className="bg-[#121218] border border-[#252535] rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-[#252535] pb-3">
                En Cartelera
              </h3>
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden relative shadow-md border border-[#2A2A38]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/productions/galeria-show.jpg"
                  alt="Si No Es Ahora"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                    ★ Musical Original
                  </span>
                  <h4 className="text-sm font-bold text-white font-display">
                    Si No Es Ahora (El Musical)
                  </h4>
                  <span className="text-[11px] text-zinc-300 mt-0.5">
                    Temporada 2026 &bull; Auditorio DV
                  </span>
                </div>
              </div>

              <Link
                href="/#producciones"
                className="text-center py-2.5 bg-[#1C1C26] hover:bg-[#252535] text-zinc-200 rounded-xl text-xs font-semibold border border-[#303045] transition-colors"
              >
                Ver Cartelera Completa &rarr;
              </Link>
            </div>

          </aside>

        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
