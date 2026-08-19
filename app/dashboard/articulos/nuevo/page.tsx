"use client";

import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUploader from "@/components/ui/image-uploader";

interface EditorBlock {
  id: string;
  type: "heading_1" | "heading_2" | "heading_3" | "paragraph" | "blockquote" | "image" | "bullet_list" | "numbered_list" | "alert_box";
  content: string;
  extra?: string; // e.g. image caption or alert variant
}

const CATEGORIES_LIST = [
  "Noticias & Novedades",
  "Montajes & Cartelera",
  "Audiciones & Castings",
  "Masterclasses & Talleres",
  "Vida Estudiantil",
  "Consejos de Formación Escénica",
];

function ArticleEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Main post state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Noticias & Novedades");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [authorName, setAuthorName] = useState("Redacción DV Performing Arts");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
  const [featuredImage, setFeaturedImage] = useState("/images/hero/hero-stage.jpg");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  // Keywords / Tags state
  const [keywords, setKeywords] = useState<string[]>([
    "Teatro Musical",
    "Artes Escénicas",
    "León Gto",
  ]);
  const [keywordInput, setKeywordInput] = useState("");

  // SEO & OpenGraph State
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Gutenberg Blocks
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    {
      id: "b1",
      type: "paragraph",
      content: "Escribe aquí la introducción de la noticia o crónica de la academia...",
    },
  ]);

  // Autosave and UI states
  const [saving, setSaving] = useState(false);
  const [lastAutosaveTime, setLastAutosaveTime] = useState<string | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "seo" | "preview">("editor");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("b1");

  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Load article if in edit mode or restore local draft
  useEffect(() => {
    if (editId) {
      fetch("/api/articles")
        .then((res) => res.json())
        .then((data) => {
          const found = data?.articles?.find((a: { id: string }) => a.id === editId);
          if (found) {
            setTitle(found.title);
            setSlug(found.slug);
            setCategory(found.category || "Noticias & Novedades");
            setAuthorName(found.authorName || "Redacción DV Performing Arts");
            setFeaturedImage(found.featuredImage || "/images/hero/hero-stage.jpg");
            setExcerpt(found.excerpt || "");
            setSeoTitle(found.seoTitle || found.title);
            setSeoDescription(found.seoDescription || found.excerpt || "");
            setStatus(found.status || "PUBLISHED");
            if (found.keywords) {
              setKeywords(Array.isArray(found.keywords) ? found.keywords : found.keywords.split(",").map((s: string) => s.trim()));
            }
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
    } else {
      // Check for local unsaved draft
      const localDraft = localStorage.getItem("dv_article_draft_new");
      if (localDraft) {
        try {
          const d = JSON.parse(localDraft);
          if (d.title && confirm("¿Deseas restaurar el último borrador no publicado que estabas escribiendo?")) {
            setTitle(d.title || "");
            setSlug(d.slug || "");
            setCategory(d.category || "Noticias & Novedades");
            setExcerpt(d.excerpt || "");
            setFeaturedImage(d.featuredImage || "/images/hero/hero-stage.jpg");
            if (d.blocks) setBlocks(d.blocks);
            if (d.keywords) setKeywords(d.keywords);
            setLastAutosaveTime("Restaurado");
          }
        } catch {}
      }
    }
  }, [editId]);

  // Real-time Autosave to localStorage
  const triggerAutosave = useCallback(() => {
    setIsAutosaving(true);
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(() => {
      const draftData = {
        title,
        slug,
        category,
        excerpt,
        featuredImage,
        blocks,
        keywords,
        seoTitle,
        seoDescription,
        status: "DRAFT",
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`dv_article_draft_${editId || "new"}`, JSON.stringify(draftData));
      const now = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastAutosaveTime(now);
      setIsAutosaving(false);
    }, 1200);
  }, [title, slug, category, excerpt, featuredImage, blocks, keywords, seoTitle, seoDescription, editId]);

  useEffect(() => {
    if (title || blocks.length > 1 || blocks[0].content !== "Escribe aquí la introducción de la noticia o crónica de la academia...") {
      triggerAutosave();
    }
  }, [title, blocks, category, excerpt, keywords, triggerAutosave]);

  // Keywords management
  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const clean = keywordInput.trim().replace(/^,|,$/g, "");
    if (clean && !keywords.includes(clean)) {
      setKeywords([...keywords, clean]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (tagToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== tagToRemove));
  };

  // Block management
  const addBlock = (type: EditorBlock["type"]) => {
    const newBlock: EditorBlock = {
      id: `b_${Date.now()}`,
      type,
      content:
        type === "heading_1"
          ? "Título Principal H1"
          : type === "heading_2"
          ? "Encabezado de Sección H2"
          : type === "heading_3"
          ? "Subtítulo de Sección H3"
          : type === "blockquote"
          ? "Escribe una cita o frase destacada del maestro o alumno..."
          : type === "image"
          ? "/images/hero/manifesto-rehearsal.jpg"
          : type === "bullet_list"
          ? "• Primer punto de la lista\n• Segundo punto clave\n• Tercer elemento importante"
          : type === "numbered_list"
          ? "1. Primer paso o requisito\n2. Segundo punto a considerar\n3. Conclusión del procedimiento"
          : type === "alert_box"
          ? "📌 Nota Importante: Las fechas de audición están abiertas para el nuevo ciclo académico."
          : "Continúa redactando el contenido de la noticia...",
      extra: type === "alert_box" ? "info" : type === "image" ? "Pie de foto oficial de la academia" : undefined,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const updateBlockExtra = (id: string, extra: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, extra } : b)));
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) return;
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  // Save / Publish
  const handleSave = async (publishStatus: "PUBLISHED" | "DRAFT") => {
    if (!title.trim()) {
      alert("Por favor ingresa un título para la noticia.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editId || undefined,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category,
        authorName,
        publishedAt: new Date(publishedAt).toISOString(),
        featuredImage,
        excerpt: excerpt || title,
        content: JSON.stringify(blocks),
        keywords,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        status: publishStatus,
        readTimeMinutes: Math.max(1, Math.ceil(blocks.reduce((acc, b) => acc + b.content.split(" ").length, 0) / 180)),
      };

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem(`dv_article_draft_${editId || "new"}`);
        router.push("/dashboard/articulos");
      } else {
        alert("Error al guardar la noticia en el servidor.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar el artículo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#30363D]">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/articulos"
            className="p-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            &larr; Volver
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>{editId ? "Editar Noticia / Artículo" : "Crear Nueva Noticia"}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                {status === "PUBLISHED" ? "Publicado" : "Borrador"}
              </span>
            </h1>
            {/* Autosave status indicator */}
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
              {isAutosaving ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Guardando borrador automático...
                </span>
              ) : lastAutosaveTime ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span>🟢</span> Borrador guardado automáticamente a las {lastAutosaveTime}
                </span>
              ) : (
                <span>Autoguardado activo en tiempo real</span>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            Guardar Borrador
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>🚀 {editId ? "Actualizar Noticia" : "Publicar Noticia"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: 2/3 Content Editor, 1/3 Settings & SEO Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN: GUTENBERG CANVAS (8 COLS) ================= */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Post Title Field */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <input
              type="text"
              placeholder="Escribe el Título de la Noticia..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-500 focus:outline-none tracking-tight font-display"
            />
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 border-t border-[#30363D]/60 pt-3 mt-1">
              <span className="text-purple-400 font-bold">SLUG:</span>
              <span>/noticias/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded px-2 py-0.5 text-slate-200 text-[11px] focus:outline-none flex-1 max-w-sm"
              />
            </div>
          </div>

          {/* GUTENBERG BLOCK TOOLBAR */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 flex flex-wrap items-center gap-1.5 sticky top-20 z-20 shadow-md">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mr-1">Insertar Bloque:</span>
            <button
              type="button"
              onClick={() => addBlock("paragraph")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1"
            >
              <span>¶</span> Párrafo
            </button>
            <button
              type="button"
              onClick={() => addBlock("heading_2")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1 font-bold"
            >
              <span>H2</span> Encabezado
            </button>
            <button
              type="button"
              onClick={() => addBlock("heading_3")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1"
            >
              <span>H3</span> Subtítulo
            </button>
            <button
              type="button"
              onClick={() => addBlock("blockquote")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1"
            >
              <span>❝</span> Cita
            </button>
            <button
              type="button"
              onClick={() => addBlock("bullet_list")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1"
            >
              <span>•</span> Viñetas
            </button>
            <button
              type="button"
              onClick={() => addBlock("numbered_list")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1"
            >
              <span>1.</span> Numerada
            </button>
            <button
              type="button"
              onClick={() => addBlock("alert_box")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1"
            >
              <span>📌</span> Destacado
            </button>
            <button
              type="button"
              onClick={() => addBlock("image")}
              className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-purple-600 hover:text-white text-slate-300 rounded text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-1"
            >
              <span>🖼️</span> Foto en Cuerpo
            </button>
          </div>

          {/* BLOCKS LIST CANVAS */}
          <div className="flex flex-col gap-4">
            {blocks.map((block, index) => {
              const isSelected = selectedBlockId === block.id;
              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`relative group bg-[#161B22] border rounded-2xl p-5 transition-all shadow-sm ${
                    isSelected ? "border-purple-500 ring-1 ring-purple-500/50" : "border-[#30363D] hover:border-slate-500"
                  }`}
                >
                  {/* Block Header Toolbar */}
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-[#30363D]/60 text-xs">
                    <span className="font-mono text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Bloque {index + 1}:</span>
                      <span className="text-slate-300">
                        {block.type === "heading_1"
                          ? "Título H1"
                          : block.type === "heading_2"
                          ? "Encabezado H2"
                          : block.type === "heading_3"
                          ? "Subtítulo H3"
                          : block.type === "blockquote"
                          ? "Cita Destacada"
                          : block.type === "bullet_list"
                          ? "Lista con Viñetas"
                          : block.type === "numbered_list"
                          ? "Lista Numerada"
                          : block.type === "alert_box"
                          ? "Cuadro Destacado"
                          : block.type === "image"
                          ? "Fotografía"
                          : "Párrafo de Texto"}
                      </span>
                    </span>

                    {/* Block Action Buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(index, "up");
                        }}
                        disabled={index === 0}
                        className="p-1 hover:bg-[#21262D] rounded text-slate-400 hover:text-white disabled:opacity-30"
                        title="Subir bloque"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(index, "down");
                        }}
                        disabled={index === blocks.length - 1}
                        className="p-1 hover:bg-[#21262D] rounded text-slate-400 hover:text-white disabled:opacity-30"
                        title="Bajar bloque"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(block.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 ml-1"
                        title="Eliminar bloque"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Block Content Input based on Type */}
                  {block.type === "heading_1" && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none font-display uppercase tracking-tight"
                    />
                  )}

                  {block.type === "heading_2" && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      className="w-full bg-transparent text-xl font-bold text-white focus:outline-none font-display tracking-tight"
                    />
                  )}

                  {block.type === "heading_3" && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      className="w-full bg-transparent text-lg font-semibold text-purple-300 focus:outline-none"
                    />
                  )}

                  {block.type === "paragraph" && (
                    <textarea
                      rows={4}
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      placeholder="Escribe tu párrafo con detalles de la noticia..."
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none resize-y leading-relaxed font-sans"
                    />
                  )}

                  {block.type === "blockquote" && (
                    <div className="border-l-4 border-purple-500 pl-4 py-1">
                      <textarea
                        rows={2}
                        value={block.content}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        className="w-full bg-transparent text-base italic text-purple-200 focus:outline-none resize-none font-serif"
                      />
                    </div>
                  )}

                  {block.type === "bullet_list" && (
                    <textarea
                      rows={4}
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      placeholder="• Escribe cada punto en una nueva línea..."
                      className="w-full bg-transparent text-xs text-slate-200 focus:outline-none resize-y font-mono leading-loose"
                    />
                  )}

                  {block.type === "numbered_list" && (
                    <textarea
                      rows={4}
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      placeholder="1. Escribe cada paso enumerado..."
                      className="w-full bg-transparent text-xs text-slate-200 focus:outline-none resize-y font-mono leading-loose"
                    />
                  )}

                  {block.type === "alert_box" && (
                    <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl flex flex-col gap-2">
                      <textarea
                        rows={2}
                        value={block.content}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        className="w-full bg-transparent text-xs text-purple-200 focus:outline-none resize-none font-sans font-medium"
                      />
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="flex flex-col gap-3">
                      <ImageUploader
                        label="Fotografía del Cuerpo de Noticia"
                        value={block.content}
                        aspectRatio="16:9"
                        recommendedSize="1200 × 800 px (3:2) o 1200 × 675 px (16:9)"
                        description="Fotografía nítida para ilustrar el artículo en el cuerpo del texto."
                        onChange={(url) => updateBlockContent(block.id, url)}
                      />
                      <input
                        type="text"
                        placeholder="Pie de foto descriptivo..."
                        value={block.extra || ""}
                        onChange={(e) => updateBlockExtra(block.id, e.target.value)}
                        className="bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Add block at bottom */}
          <button
            type="button"
            onClick={() => addBlock("paragraph")}
            className="w-full py-4 border-2 border-dashed border-[#30363D] hover:border-purple-500/70 rounded-2xl text-slate-400 hover:text-purple-300 font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#161B22]/30"
          >
            <span>+ Agregar Nuevo Párrafo</span>
          </button>
        </div>

        {/* ================= RIGHT COLUMN: WORDPRESS INSPECTOR SIDEBAR (4 COLS) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
          
          {/* Sidebar Tab Switcher */}
          <div className="flex bg-[#161B22] p-1.5 rounded-xl border border-[#30363D]">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "editor" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Ajustes de Noticia
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "seo" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              SEO & OpenGraph
            </button>
          </div>

          {/* TAB 1: SETTINGS */}
          {activeTab === "editor" && (
            <div className="flex flex-col gap-6">
              
              {/* Box 1: Publication Settings */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-4 shadow-sm text-xs">
                <h3 className="font-bold text-sm text-white border-b border-[#30363D] pb-3 flex items-center justify-between">
                  <span>Publicación & Categoría</span>
                </h3>

                {/* Status Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Estado de Publicación</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "PUBLISHED" | "DRAFT")}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="PUBLISHED">🚀 Publicado (Visible en el sitio)</option>
                    <option value="DRAFT">📝 Borrador (Solo en administración)</option>
                  </select>
                </div>

                {/* Category Selector */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-slate-300">Categoría</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCat(!showAddCat)}
                      className="text-[10px] text-purple-400 hover:underline font-semibold"
                    >
                      {showAddCat ? "Cancelar" : "+ Nueva"}
                    </button>
                  </div>

                  {!showAddCat ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      {CATEGORIES_LIST.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre de categoría..."
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryInput.trim()) {
                            setCategory(newCategoryInput.trim());
                            setShowAddCat(false);
                            setNewCategoryInput("");
                          }
                        }}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
                      >
                        OK
                      </button>
                    </div>
                  )}
                </div>

                {/* Author */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Autor / Firma</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Published Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Fecha y Hora de Publicación</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Box 2: Keywords / Tags (Palabras Clave) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-3 shadow-sm text-xs">
                <h3 className="font-bold text-sm text-white border-b border-[#30363D] pb-3 flex items-center justify-between">
                  <span>Palabras Clave & Tags</span>
                  <span className="text-[10px] font-mono text-purple-400">{keywords.length} tags</span>
                </h3>

                <p className="text-[11px] text-slate-400">
                  Escribe palabras clave para indexación y posicionamiento SEO en Google.
                </p>

                {/* Keyword Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  {keywords.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[11px] font-medium"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(tag)}
                        className="hover:text-white font-bold ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="+ palabra clave (Enter)..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    className="bg-transparent text-xs text-white focus:outline-none flex-1 min-w-[120px] p-1 font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] text-slate-500">Sugerencias:</span>
                  {["TeatroMusical", "Audiciones2026", "ArtesEscenicas", "Canto", "Danza", "LeónGto"].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!keywords.includes(s)) setKeywords([...keywords, s]);
                      }}
                      className="text-[10px] text-slate-400 hover:text-purple-300 bg-[#21262D] px-1.5 py-0.5 rounded font-mono"
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 3: Featured Image with ImageUploader */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                <ImageUploader
                  label="Imagen Destacada / Portada Oficial"
                  value={featuredImage}
                  aspectRatio="16:9"
                  recommendedSize="1200 × 675 px (16:9 Panorámica)"
                  onChange={(newUrl) => setFeaturedImage(newUrl)}
                  description="Resolución recomendada: 1200 × 675 px o 1920 × 1080 px para web y tarjetas en redes sociales."
                />
              </div>

              {/* Box 4: Excerpt */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-3 shadow-sm text-xs">
                <label className="font-bold text-sm text-white border-b border-[#30363D] pb-3 block">
                  Extracto / Resumen Corto
                </label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Escribe un breve resumen de 2 líneas para tarjetas del home..."
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                />
              </div>

            </div>
          )}

          {/* TAB 2: SEO & OPENGRAPH PREVIEWS */}
          {activeTab === "seo" && (
            <div className="flex flex-col gap-6 text-xs">
              
              {/* Google Search Snippet */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                <h3 className="font-bold text-sm text-white border-b border-[#30363D] pb-3 flex items-center gap-2">
                  <span>🔍 Vista Previa en Google Search</span>
                </h3>

                <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1.5 font-sans">
                  <div className="text-[11px] text-slate-400 font-mono">
                    https://prev.dvperformingarts.com &rsaquo; noticias &rsaquo; {slug || "noticia"}
                  </div>
                  <div className="text-base text-blue-400 font-semibold hover:underline cursor-pointer line-clamp-1">
                    {seoTitle || title || "Título de la Noticia en Google"}
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {seoDescription || excerpt || "Resumen del artículo que los usuarios verán en los resultados del buscador de Google..."}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Meta Título SEO</span>
                    <span>{(seoTitle || title).length} / 60</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || "Título SEO"}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Meta Descripción SEO</span>
                    <span>{(seoDescription || excerpt).length} / 160</span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder={excerpt || "Descripción para Google..."}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* WhatsApp OpenGraph Card Preview */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                <h3 className="font-bold text-sm text-white border-b border-[#30363D] pb-3 flex items-center gap-2">
                  <span>📱 Vista Previa en WhatsApp (OpenGraph)</span>
                </h3>

                {/* WhatsApp Chat Simulation Bubble */}
                <div className="p-4 bg-[#0B141A] rounded-xl border border-emerald-900/40 flex flex-col gap-2">
                  <div className="bg-[#1F2C34] rounded-xl overflow-hidden border border-[#2A3942] max-w-sm self-end shadow-lg">
                    {/* Thumbnail */}
                    <div className="w-full aspect-[16/9] bg-black overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featuredImage} alt="OG Preview" className="w-full h-full object-cover" />
                    </div>
                    {/* Caption */}
                    <div className="p-3 flex flex-col gap-1 bg-[#111B21]">
                      <span className="text-[10px] text-slate-400 font-mono">prev.dvperformingarts.com</span>
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {seoTitle || title || "Título de la Noticia"}
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {seoDescription || excerpt || "Resumen de la noticia compartida por WhatsApp..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs font-mono">Cargando editor CMS...</div>}>
      <ArticleEditorContent />
    </Suspense>
  );
}
