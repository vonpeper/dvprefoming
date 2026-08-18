"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/types/mock";

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles) setArticles(data.articles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este artículo?")) return;
    try {
      const res = await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "ALL" || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["ALL", "Teatro Musical", "Canto & Técnica Vocal", "Danza Urbana", "Valores & Formación", "Convocatorias"];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Revista & Artículos Editoriales (CMS)</span>
            <span className="text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
              {articles.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crea, edita y publica contenido editorial optimizado para SEO y redes sociales (OpenGraph).
          </p>
        </div>

        <Link
          href="/dashboard/articulos/nuevo"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Redactar Artículo (Gutenberg)</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar artículo por título o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-[#21262D] text-slate-300 hover:bg-[#30363D]"
              }`}
            >
              {cat === "ALL" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-500 transition-all group"
          >
            {/* Image banner */}
            <div className="w-full h-44 relative bg-[#0D1117] overflow-hidden border-b border-[#30363D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featuredImage || "/images/productions/galeria-show.jpg"}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/20">
                {article.category || "Teatro Musical"}
              </div>
              <div className="absolute bottom-3 left-3 bg-emerald-500/90 text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Publicado
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span>✍️ {article.authorName || "Redacción DV"}</span>
                  <span>&bull;</span>
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("es-MX") : "Reciente"}</span>
                </span>

                <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {article.excerpt || "Sin resumen provisto."}
                </p>
              </div>

              {/* SEO & OG Badges */}
              <div className="pt-3 border-t border-[#30363D] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span>✓</span> SEO / OpenGraph
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/articulos/nuevo?edit=${article.id}`}
                    className="px-2.5 py-1 bg-[#21262D] hover:bg-blue-600 hover:text-white rounded text-slate-300 font-semibold transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                    title="Eliminar artículo"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center bg-[#161B22] rounded-xl border border-dashed border-[#30363D]">
            <p className="text-sm text-slate-400">No se encontraron artículos con los filtros seleccionados.</p>
            <Link
              href="/dashboard/articulos/nuevo"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
            >
              Crear el primer artículo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
