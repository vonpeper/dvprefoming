"use client";

import React, { useState, useEffect, useRef } from "react";
import { MediaItem } from "@/lib/media-storage";

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = () => {
    fetch("/api/media")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) setItems(data.items);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ ${data.files?.length || 1} imagen(es) optimizada(s) y subida(s) con éxito.`);
        loadMedia();
      } else {
        alert(data.error || "Error al subir imágenes.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al procesar imágenes.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id: string, filename: string) => {
    if (!confirm(`¿Eliminar la imagen "${filename}" de la biblioteca?`)) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Imagen "${filename}" eliminada.`);
        setSelectedItem(null);
        loadMedia();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("📋 URL copiada al portapapeles.");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "ALL", label: "Todas" },
    { id: "uploads", label: "Subidas Recientes" },
    { id: "hero", label: "Hero & Portada" },
    { id: "teachers", label: "Docentes" },
    { id: "programs", label: "Programas" },
    { id: "productions", label: "Cartelera" },
    { id: "brand", label: "Logos & Marca" },
  ];

  const totalSize = items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-xs animate-bounce">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Biblioteca de Medios & Multimedia</span>
            <span className="text-xs font-mono bg-purple-600/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
              {items.length} Archivos ({formatFileSize(totalSize)})
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sube, gestiona y optimiza automáticamente imágenes a formato WebP para la web y redes sociales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Optimizando WebP...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>+ Subir Imágenes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DRAG & DROP UPLOAD DROPZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUploadFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
          dragOver
            ? "border-purple-400 bg-purple-950/30 scale-[1.01]"
            : "border-[#30363D] hover:border-purple-500/60 bg-[#161B22]/40"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl">
          📁
        </div>
        <div className="flex flex-col items-center text-center gap-1">
          <span className="text-sm font-bold text-white">
            Arrastra y suelta fotos aquí para subirlas y optimizarlas automáticamente
          </span>
          <span className="text-xs text-slate-400">
            o haz clic para explorar tus archivos (JPG, PNG, WebP) &bull; Compresión y redimensión instantánea a WebP
          </span>
        </div>
      </div>

      {/* RECOMMENDED SIZES CHEAT SHEET */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📐</span>
            <div>
              <h2 className="text-sm font-bold text-white">
                Guía de Medidas Oficiales & Tamaños en Pixeles para Diseño Web
              </h2>
              <p className="text-[11px] text-slate-400">
                Consulta estas dimensiones para preparar y recortar las imágenes antes de publicarlas en el CMS.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2.5 py-1 rounded-full font-bold">
            Formatos: JPG / PNG / WebP
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">🌟 Hero / Portada Principal</span>
            <span className="font-mono font-black text-white text-sm">800 × 1067 px</span>
            <span className="text-[10px] text-slate-400">Ratio 3:4 Vertical (o 1200×1600 px HD)</span>
          </div>

          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">📜 Manifiesto & Filosofía</span>
            <span className="font-mono font-black text-white text-sm">800 × 800 px</span>
            <span className="text-[10px] text-slate-400">Ratio 1:1 Cuadrado (o 1000×1000 px)</span>
          </div>

          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">🎓 Talleres & Programas</span>
            <span className="font-mono font-black text-white text-sm">1200 × 675 px</span>
            <span className="text-[10px] text-slate-400">Ratio 16:9 Panorámica (o 800×450 px)</span>
          </div>

          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">👨‍🏫 Retratos de Docentes</span>
            <span className="font-mono font-black text-white text-sm">600 × 800 px</span>
            <span className="text-[10px] text-slate-400">Ratio 3:4 Vertical Headshot</span>
          </div>

          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">🎭 Póster de Obra / Cartelera</span>
            <span className="font-mono font-black text-white text-sm">800 × 1067 px</span>
            <span className="text-[10px] text-slate-400">Ratio 3:4 Cartel Publicitario</span>
          </div>

          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">📰 Portada de Blog / Noticia</span>
            <span className="font-mono font-black text-white text-sm">1200 × 675 px</span>
            <span className="text-[10px] text-slate-400">Ratio 16:9 HD Editorial</span>
          </div>

          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">🌐 Tarjeta Redes Sociales (OG)</span>
            <span className="font-mono font-black text-white text-sm">1200 × 630 px</span>
            <span className="text-[10px] text-slate-400">Para WhatsApp y Facebook Share</span>
          </div>

          <div className="p-3.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">💎 Logo / Emblema de Marca</span>
            <span className="font-mono font-black text-white text-sm">512 × 512 px</span>
            <span className="text-[10px] text-slate-400">PNG Transparente de Alta Definición</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre de archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                categoryFilter === cat.id
                  ? "bg-purple-600 text-white font-bold"
                  : "bg-[#21262D] text-slate-300 hover:bg-[#30363D]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MEDIA GRID (WORDPRESS STYLE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative bg-[#161B22] border border-[#30363D] hover:border-purple-500 rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all shadow-sm"
          >
            {/* Thumbnail */}
            <div className="w-full h-36 relative bg-black overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.originalName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/productions/si-no-es-ahora.jpg";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-white border border-white/20 uppercase">
                {item.mimeType.split("/")[1] || "IMG"}
              </div>
            </div>

            {/* Caption info */}
            <div className="p-2.5 flex flex-col gap-0.5 bg-[#0D1117]">
              <span className="text-xs font-semibold text-slate-200 truncate font-mono">{item.filename}</span>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>{formatFileSize(item.sizeBytes)}</span>
                <span className="text-purple-400 uppercase text-[9px] font-bold">{item.category}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center bg-[#161B22] rounded-xl border border-dashed border-[#30363D]">
            <p className="text-sm text-slate-400">No se encontraron imágenes en esta categoría.</p>
          </div>
        )}
      </div>

      {/* MEDIA DETAILS MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-3xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#30363D] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Detalles del Archivo Multimedia</h3>
                <span className="text-xs text-slate-400 font-mono">{selectedItem.filename}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Image preview + Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Preview */}
              <div className="md:col-span-6 w-full h-64 bg-black rounded-xl overflow-hidden border border-[#30363D] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.url}
                  alt={selectedItem.filename}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/productions/si-no-es-ahora.jpg";
                  }}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info & URL copy */}
              <div className="md:col-span-6 flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-2 p-4 bg-[#0D1117] rounded-xl border border-[#30363D]">
                  <div className="flex justify-between py-1 border-b border-[#30363D]/60">
                    <span className="text-slate-400">Tamaño de archivo:</span>
                    <span className="font-mono text-white font-semibold">{formatFileSize(selectedItem.sizeBytes)}</span>
                  </div>
                  {selectedItem.width && (
                    <div className="flex justify-between py-1 border-b border-[#30363D]/60">
                      <span className="text-slate-400">Dimensiones:</span>
                      <span className="font-mono text-white font-semibold">
                        {selectedItem.width} &times; {selectedItem.height} px
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-[#30363D]/60">
                    <span className="text-slate-400">Formato / MIME:</span>
                    <span className="font-mono text-purple-400 font-bold">{selectedItem.mimeType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Categoría:</span>
                    <span className="font-mono uppercase text-slate-300">{selectedItem.category}</span>
                  </div>
                </div>

                {/* Direct URL Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300">Enlace directo al archivo:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-slate-300 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => copyUrlToClipboard(selectedItem.url)}
                      className="px-3 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-semibold"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                {/* Delete button (for custom uploads) */}
                {selectedItem.category === "uploads" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(selectedItem.id, selectedItem.filename)}
                    className="mt-2 py-2 px-3 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🗑️</span> Eliminar Imagen Definitivamente
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#30363D]">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
