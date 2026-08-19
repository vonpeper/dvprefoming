"use client";

import React, { useState, useRef, useEffect } from "react";
import { MediaItem } from "@/lib/media-storage";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: "3:4" | "16:9" | "1:1" | "auto";
  previewClassName?: string;
  description?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Fotografía / Imagen",
  aspectRatio = "auto",
  previewClassName = "h-40 w-full",
  description = "Formatos recomendados: JPG, PNG o WebP. Se optimizará automáticamente para la web.",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.file?.url) {
        onChange(data.file.url);
      } else {
        alert(data.error || "Error al subir la imagen.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const openGalleryModal = () => {
    setGalleryOpen(true);
    setLoadingGallery(true);
    fetch("/api/media")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) setMediaItems(data.items);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingGallery(false));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}

      {/* Upload Zone / Preview Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative bg-[#0D1117] border-2 rounded-xl p-4 flex flex-col sm:flex-row gap-5 items-center transition-all ${
          dragOver ? "border-purple-500 bg-purple-950/20" : "border-[#30363D] hover:border-slate-500"
        }`}
      >
        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        {/* Thumbnail Preview Area */}
        <div
          className={`relative bg-black rounded-lg overflow-hidden border border-[#30363D] shrink-0 flex items-center justify-center ${
            aspectRatio === "3:4"
              ? "w-24 h-32"
              : aspectRatio === "1:1"
              ? "w-28 h-28"
              : aspectRatio === "16:9"
              ? "w-40 h-24"
              : "w-28 h-28"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-500 text-xs font-mono">Sin foto</span>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
              <span className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] font-mono text-purple-300">Optimizando WebP...</span>
            </div>
          )}
        </div>

        {/* Controls & Path Input */}
        <div className="flex-1 flex flex-col justify-between gap-3 w-full">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Subir / Reemplazar Foto</span>
              </button>

              <button
                type="button"
                onClick={openGalleryModal}
                className="px-3.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📁 Elegir de la Galería</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{description}</p>
          </div>

          {/* Direct URL text field */}
          <div className="flex items-center bg-[#161B22] border border-[#30363D] rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-mono text-[10px] mr-2">URL:</span>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/images/..."
              className="flex-1 bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* GALLERY PICKER MODAL */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setGalleryOpen(false)}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-4xl w-full p-6 flex flex-col gap-6 shadow-2xl max-h-[85vh] overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#30363D] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Biblioteca Multimedia</span>
                  <span className="text-xs bg-purple-500/20 text-purple-400 font-mono px-2 py-0.5 rounded">
                    {mediaItems.length} Imágenes
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Selecciona una imagen existente para reemplazar la actual.</p>
              </div>
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="p-1 text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {loadingGallery ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                <span className="animate-spin mr-2">⏳</span> Cargando biblioteca...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto max-h-[55vh] p-1">
                {mediaItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setGalleryOpen(false);
                    }}
                    className={`group relative rounded-xl overflow-hidden border transition-all flex flex-col bg-black ${
                      value === item.url
                        ? "border-purple-500 ring-2 ring-purple-500 scale-95"
                        : "border-[#30363D] hover:border-slate-400"
                    }`}
                  >
                    <div className="w-full h-24 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-1.5 bg-[#0D1117] flex flex-col text-left">
                      <span className="text-[10px] text-slate-300 font-mono truncate">{item.filename}</span>
                      <span className="text-[9px] text-slate-500 uppercase">{item.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#30363D]">
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
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
