"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface EditorBlock {
  id: string;
  type: "heading_2" | "heading_3" | "paragraph" | "blockquote" | "image" | "bullet_list" | "alert_box";
  content: string;
  extra?: string; // e.g. image caption or alert variant
}

function ArticleEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Main post state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Teatro Musical");
  const [authorName, setAuthorName] = useState("Redacción DV Performing Arts");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
  const [featuredImage, setFeaturedImage] = useState("/images/hero/hero-stage.jpg");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  // SEO & OpenGraph State
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [tags, setTags] = useState("Teatro Musical, Artes Escénicas, León Gto");

  // Gutenberg blocks
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    {
      id: "b1",
      type: "paragraph",
      content: "Escribe aquí la introducción de tu artículo editorial...",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "seo" | "preview">("editor");

  // Auto-generate slug and SEO defaults from title
  useEffect(() => {
    if (!editId && title) {
      const generatedSlug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
      if (!seoTitle) setSeoTitle(`${title} | DV Performing Arts`);
    }
  }, [title, editId, seoTitle]);

  // Load article if in edit mode
  useEffect(() => {
    if (editId) {
      fetch("/api/articles")
        .then((res) => res.json())
        .then((data) => {
          const found = data?.articles?.find((a: { id: string }) => a.id === editId);
          if (found) {
            setTitle(found.title);
            setSlug(found.slug);
            setCategory(found.category || "Teatro Musical");
            setAuthorName(found.authorName || "Redacción DV Performing Arts");
            setFeaturedImage(found.featuredImage || "/images/hero/hero-stage.jpg");
            setExcerpt(found.excerpt || "");
            setSeoTitle(found.seoTitle || found.title);
            setSeoDescription(found.seoDescription || found.excerpt || "");
            setStatus(found.status || "PUBLISHED");
            if (found.content) {
              try {
                const parsed = JSON.parse(found.content);
                if (Array.isArray(parsed)) setBlocks(parsed);
              } catch {
                setBlocks([{ id: "b_old", type: "paragraph", content: found.content }]);
              }
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [editId]);

  // Block management
  const addBlock = (type: EditorBlock["type"]) => {
    const newBlock: EditorBlock = {
      id: `b_${Date.now()}`,
      type,
      content:
        type === "heading_2"
          ? "Nuevo Encabezado H2"
          : type === "heading_3"
          ? "Subtítulo H3"
          : type === "blockquote"
          ? "«Una cita artística que inspire al lector sobre el escenario...»"
          : type === "image"
          ? "/images/hero/manifesto-rehearsal.jpg"
          : type === "alert_box"
          ? "Nota importante para los estudiantes o lectores."
          : type === "bullet_list"
          ? "Elemento 1\nElemento 2\nElemento 3"
          : "Párrafo de contenido con ideas clave...",
      extra: type === "image" ? "Pie de foto oficial de la academia" : "",
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string, extra?: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content, extra: extra !== undefined ? extra : b.extra } : b))
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleSaveArticle = async () => {
    if (!title.trim()) {
      alert("Por favor ingresa un título para el artículo.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editId || undefined,
        title,
        slug,
        category,
        authorName,
        publishedAt: new Date(publishedAt),
        featuredImage,
        excerpt: excerpt || blocks.find((b) => b.type === "paragraph")?.content.slice(0, 150) || "",
        content: JSON.stringify(blocks),
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        ogImage: featuredImage,
        tags: tags.split(",").map((t) => t.trim()),
        status,
      };

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/articulos");
      } else {
        alert("Error al guardar el artículo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  // Image library options
  const sampleImages = [
    "/images/hero/hero-stage.jpg",
    "/images/hero/manifesto-rehearsal.jpg",
    "/images/hero/backstage-acting.jpg",
    "/images/productions/si-no-es-ahora.jpg",
    "/images/productions/into-the-woods.jpg",
    "/images/productions/hoy-no-me-puedo-levantar.jpg",
    "/images/productions/galeria-show.jpg",
    "/images/productions/galeria-danza.jpg",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/articulos"
            className="p-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-lg text-xs transition-colors"
          >
            &larr; Volver
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{editId ? "Editar Artículo" : "Nuevo Artículo Editorial"}</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                Gutenberg Blocks
              </span>
            </h1>
            <span className="text-xs text-slate-400">Autor: {authorName}</span>
          </div>
        </div>

        {/* Action tabs & Save button */}
        <div className="flex items-center gap-3">
          <div className="bg-[#161B22] p-1 rounded-lg border border-[#30363D] flex text-xs">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "editor" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              ✍️ Editor de Bloques
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "seo" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              🔍 SEO & OpenGraph
            </button>
          </div>

          <button
            onClick={handleSaveArticle}
            disabled={saving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Publicar Artículo"}
          </button>
        </div>
      </div>

      {/* Main Grid: Content + Meta Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor or SEO Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeTab === "editor" ? (
            /* ================= GUTENBERG BLOCKS EDITOR ================= */
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
              {/* Title input */}
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Escribe el Título del Artículo..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-3xl font-black text-white placeholder-slate-600 focus:outline-none border-b border-[#30363D] pb-3"
                />
              </div>

              {/* Gutenberg Blocks Inserter Bar */}
              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold mr-1">+ Añadir Bloque:</span>
                <button
                  type="button"
                  onClick={() => addBlock("paragraph")}
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded transition-colors"
                >
                  ¶ Párrafo
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("heading_2")}
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded transition-colors"
                >
                  H2 Encabezado
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("heading_3")}
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded transition-colors"
                >
                  H3 Subtítulo
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("blockquote")}
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded transition-colors"
                >
                  “ Cita Destacada
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("image")}
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded transition-colors"
                >
                  🖼️ Imagen
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("bullet_list")}
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded transition-colors"
                >
                  • Lista
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("alert_box")}
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded transition-colors"
                >
                  ⚠️ Aviso
                </button>
              </div>

              {/* Render Blocks */}
              <div className="flex flex-col gap-5">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="group relative p-4 bg-[#0D1117] border border-[#30363D] hover:border-blue-500/60 rounded-xl transition-all flex flex-col gap-2"
                  >
                    {/* Block Toolbar Top Bar */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pb-1 border-b border-[#30363D]/40">
                      <span className="uppercase font-bold text-blue-400">
                        Bloque: {block.type.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveBlock(index, "up")}
                          disabled={index === 0}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Subir"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(index, "down")}
                          disabled={index === blocks.length - 1}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Bajar"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1 hover:text-red-400 text-slate-500 ml-2"
                          title="Eliminar bloque"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Block Content Inputs */}
                    {block.type === "paragraph" && (
                      <textarea
                        rows={3}
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                        placeholder="Escribe el texto del párrafo..."
                        className="w-full bg-transparent text-sm text-slate-200 leading-relaxed focus:outline-none resize-y"
                      />
                    )}

                    {block.type === "heading_2" && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                        placeholder="Encabezado H2..."
                        className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                      />
                    )}

                    {block.type === "heading_3" && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                        placeholder="Subtítulo H3..."
                        className="w-full bg-transparent text-lg font-semibold text-slate-200 focus:outline-none"
                      />
                    )}

                    {block.type === "blockquote" && (
                      <div className="border-l-4 border-red-500 pl-3 py-1">
                        <textarea
                          rows={2}
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Cita destacada..."
                          className="w-full bg-transparent text-sm italic text-slate-300 focus:outline-none resize-none"
                        />
                      </div>
                    )}

                    {block.type === "bullet_list" && (
                      <textarea
                        rows={3}
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                        placeholder="Un elemento por línea..."
                        className="w-full bg-transparent text-sm font-mono text-slate-300 focus:outline-none resize-y"
                      />
                    )}

                    {block.type === "alert_box" && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 text-xs">
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Aviso o advertencia..."
                          className="w-full bg-transparent font-medium focus:outline-none"
                        />
                      </div>
                    )}

                    {block.type === "image" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            placeholder="URL de la imagen (/images/...)"
                            className="flex-1 bg-[#161B22] border border-[#30363D] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <input
                          type="text"
                          value={block.extra || ""}
                          onChange={(e) => updateBlock(block.id, block.content, e.target.value)}
                          placeholder="Pie de foto / Leyenda..."
                          className="w-full bg-transparent text-xs text-slate-400 italic border-b border-[#30363D]/40 pb-1 focus:outline-none"
                        />
                        {block.content && (
                          <div className="w-full h-36 relative bg-black/40 rounded overflow-hidden mt-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={block.content} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ================= SEO & OPENGRAPH STUDIO ================= */
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Optimización para Google & Redes Sociales</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    OpenGraph Ready
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ajusta cómo aparecerá este artículo en búsquedas de Google, enlaces de WhatsApp y publicaciones de Facebook.
                </p>
              </div>

              {/* SEO Inputs */}
              <div className="flex flex-col gap-5">
                {/* Meta Title */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300">Meta Title (Título SEO)</label>
                    <span className={`font-mono text-[11px] ${seoTitle.length >= 40 && seoTitle.length <= 60 ? "text-emerald-400" : "text-slate-400"}`}>
                      {seoTitle.length} / 60 caracteres
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Título optimizado para motores de búsqueda..."
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Slug URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-slate-300">URL Slug (Enlace permanente)</label>
                  <div className="flex items-center bg-[#0D1117] border border-[#30363D] rounded-lg overflow-hidden text-xs">
                    <span className="px-3 py-2 text-slate-500 bg-[#161B22] border-r border-[#30363D] font-mono text-[11px]">
                      dvperformingarts.com/revista/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 bg-transparent px-3 py-2 text-slate-200 focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300">Meta Description (Snippet de búsqueda)</label>
                    <span className={`font-mono text-[11px] ${seoDescription.length >= 120 && seoDescription.length <= 160 ? "text-emerald-400" : "text-slate-400"}`}>
                      {seoDescription.length} / 160 caracteres
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Resumen persuasivo de 120 a 160 caracteres que invite al usuario a hacer clic..."
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* LIVE GOOGLE SERP PREVIEW */}
              <div className="flex flex-col gap-3 pt-6 border-t border-[#30363D]">
                <span className="font-mono text-xs text-slate-300 font-bold uppercase flex items-center gap-2">
                  <span>🔎 Vista Previa en Google Search</span>
                </span>

                <div className="p-4 bg-[#202124] rounded-xl border border-[#3c4043] flex flex-col gap-1 max-w-xl">
                  <div className="flex items-center gap-2 text-[11px] text-[#bdc1c6]">
                    <span>dvperformingarts.com</span>
                    <span>&rsaquo; revista &rsaquo; {slug || "articulo"}</span>
                  </div>
                  <h3 className="text-[#8ab4f8] text-base font-medium hover:underline cursor-pointer">
                    {seoTitle || title || "Título del artículo en DV Performing Arts"}
                  </h3>
                  <p className="text-[#bdc1c6] text-xs leading-relaxed line-clamp-2">
                    {seoDescription || excerpt || "Descubre los programas de teatro musical, técnicas vocales y disciplinas escénicas en León, Guanajuato."}
                  </p>
                </div>
              </div>

              {/* LIVE WHATSAPP / FACEBOOK OPENGRAPH PREVIEW */}
              <div className="flex flex-col gap-3 pt-6 border-t border-[#30363D]">
                <span className="font-mono text-xs text-slate-300 font-bold uppercase flex items-center gap-2">
                  <span>📱 Vista Previa OpenGraph (WhatsApp / Facebook)</span>
                </span>

                <div className="max-w-md bg-[#005c4b]/30 p-3 rounded-2xl border border-emerald-500/20">
                  <div className="bg-[#1f2c34] rounded-xl overflow-hidden border border-[#30363d] shadow-lg">
                    <div className="w-full h-44 relative bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredImage || "/images/hero/hero-stage.jpg"}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">DVPERFORMINGARTS.COM</span>
                      <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">
                        {seoTitle || title || "Título del artículo"}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {seoDescription || excerpt || "Resumen del artículo compartido en redes sociales."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Metadata & Publishing Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Box 1: Publishing Settings */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="font-bold text-sm text-white border-b border-[#30363D] pb-3 flex items-center justify-between">
              <span>Publicación</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                {status === "PUBLISHED" ? "Publicado" : "Borrador"}
              </span>
            </h3>

            {/* Status Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-semibold">Estado de la Entrada</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "PUBLISHED" | "DRAFT")}
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="PUBLISHED">Publicado (Visible en el sitio)</option>
                <option value="DRAFT">Borrador (Privado)</option>
              </select>
            </div>

            {/* Author */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-semibold">Autor</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-semibold">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Teatro Musical">Teatro Musical</option>
                <option value="Canto & Técnica Vocal">Canto & Técnica Vocal</option>
                <option value="Danza Urbana">Danza Urbana</option>
                <option value="Valores & Formación">Valores & Formación</option>
                <option value="Convocatorias">Convocatorias</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-semibold">Fecha y Hora de Publicación</label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            {/* Excerpt */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-semibold">Resumen (Excerpt)</label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve extracto para tarjetas del blog..."
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Box 2: Featured Image */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="font-bold text-sm text-white border-b border-[#30363D] pb-3">
              Imagen Destacada (OpenGraph)
            </h3>

            {/* Preview Image */}
            <div className="w-full h-44 relative bg-black/50 rounded-lg overflow-hidden border border-[#30363D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
            </div>

            {/* Image path input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-semibold">Ruta / URL de la Imagen</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono text-[11px]"
              />
            </div>

            {/* Quick Gallery Picker */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                Seleccionar de la galería:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {sampleImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFeaturedImage(img)}
                    className={`w-full h-12 rounded overflow-hidden border transition-all ${
                      featuredImage === img ? "border-blue-500 scale-95" : "border-[#30363D] opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArticleEditorGutenbergPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Cargando editor editorial...</div>}>
      <ArticleEditorContent />
    </Suspense>
  );
}
