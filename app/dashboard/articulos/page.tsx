"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/types/mock";

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles) setArticles(data.articles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la noticia "${title}"?`)) return;
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
    const matchesStatus = statusFilter === "ALL" || (a.status || "PUBLISHED") === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    "ALL",
    "Noticias & Novedades",
    "Montajes & Cartelera",
    "Audiciones & Castings",
    "Masterclasses & Talleres",
    "Vida Estudiantil",
    "Consejos de Formación Escénica",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Noticias & Artículos Web (CMS)</span>
            <span className="text-xs font-mono bg-purple-600/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
              {articles.length} Artículos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de publicaciones, notas de prensa y novedades del sitio con SEO y tarjetas OpenGraph.
          </p>
        </div>

        <Link
          href="/dashboard/articulos/nuevo"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Redactar Nueva Noticia</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por título, extracto o palabra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.filter((c) => c !== "ALL").map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="DRAFT">Borradores</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-slate-400 font-mono uppercase text-[10px] border-b border-[#30363D]">
              <tr>
                <th className="py-3 px-4">Portada</th>
                <th className="py-3 px-4">Título & Extracto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Autor</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {filteredArticles.map((article) => {
                const dateStr = article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Reciente";
                const isPublished = (article.status || "PUBLISHED") === "PUBLISHED";

                return (
                  <tr key={article.id} className="hover:bg-[#21262D]/60 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4 w-16">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-black border border-[#30363D]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.featuredImage || "/images/hero/hero-stage.jpg"}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Title & Excerpt */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        href={`/dashboard/articulos/nuevo?edit=${article.id}`}
                        className="font-bold text-white hover:text-purple-400 transition-colors block text-sm"
                      >
                        {article.title}
                      </Link>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {article.excerpt || "Sin extracto registrado."}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                        {article.category || "Noticias"}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                      {article.authorName || "Redacción"}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {dateStr}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isPublished
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {isPublished ? "Publicado" : "Borrador"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/articulos/nuevo?edit=${article.id}`}
                          className="px-2.5 py-1 bg-[#21262D] hover:bg-purple-600 hover:text-white rounded text-[11px] font-semibold text-slate-200 transition-colors"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                          title="Eliminar noticia"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredArticles.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    No se encontraron noticias con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
