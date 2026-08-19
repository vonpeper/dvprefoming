"use client";

import React, { useState, useRef } from "react";
import { MediaItem } from "@/lib/media-storage";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: "3:4" | "16:9" | "1:1" | "4:3" | "3:2" | "auto";
  recommendedSize?: string; // e.g. "800 x 1067 px"
  previewClassName?: string;
  description?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Fotografía / Imagen",
  aspectRatio = "auto",
  recommendedSize,
  description = "Formatos recomendados: JPG, PNG o WebP. Se optimizará automáticamente para la web.",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Auto derive recommended size if not explicitly provided
  const derivedSize =
    recommendedSize ||
    (aspectRatio === "3:4"
      ? "800 × 1067 px (3:4 Vertical)"
      : aspectRatio === "16:9"
      ? "1920 × 1080 px (16:9 Horizontal)"
      : aspectRatio === "1:1"
      ? "800 × 800 px (1:1 Cuadrado)"
      : aspectRatio === "3:2"
      ? "1200 × 800 px (3:2 Horizontal)"
      : aspectRatio === "4:3"
      ? "800 × 600 px (4:3)"
      : "1200 × 800 px");

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).");
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
      {/* Label and Recommended Dimensions Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && <label className="text-xs font-bold text-slate-200">{label}</label>}
        
        {derivedSize && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-sm">
            <span>📐 Tamaño recomendado:</span>
            <span className="text-white font-black">{derivedSize}</span>
          </span>
        )}
      </div>

      {/* Upload Zone / Preview Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative bg-[#0D1117] border-2 rounded-xl p-4 flex flex-col sm:flex-row gap-5 items-center transition-all ${
          dragOver ? "border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-950/50" : "border-[#30363D] hover:border-slate-500"
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

        {/* Thumbnail Preview Area with Aspect Ratio Sizing */}
        <div
          className={`relative bg-black rounded-lg overflow-hidden border border-[#30363D] shrink-0 flex items-center justify-center ${
            aspectRatio === "3:4"
              ? "w-24 h-32"
              : aspectRatio === "1:1"
              ? "w-28 h-28"
              : aspectRatio === "16:9"
              ? "w-40 h-24"
              : aspectRatio === "3:2"
              ? "w-36 h-24"
              : aspectRatio === "4:3"
              ? "w-32 h-24"
              : "w-28 h-28"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center text-slate-500">
              <span className="text-lg">🖼️</span>
              <span className="text-[10px] font-mono mt-1">Sin imagen</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
              <span className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] font-mono text-purple-300">Procesando WebP...</span>
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
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Subir / Reemplazar Imagen</span>
              </button>

              <button
                type="button"
                onClick={openGalleryModal}
                className="px-3.5 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📁 Galería de Medios</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>ℹ️</span>
              <span>{description}</span>
            </p>
          </div>

          {/* Direct URL text field */}
          <div className="flex items-center bg-[#161B22] border border-[#30363D] rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-500 font-mono text-[10px] mr-2 shrink-0">Ruta / URL:</span>
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
            className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl cursor-default overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#30363D] flex justify-between items-center bg-[#0D1117]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📁</span> Galería Multimedia del Sitio
                </h3>
                <p className="text-[11px] text-slate-400">
                  Selecciona una imagen previamente subida o haz clic para insertarla.
                </p>
              </div>
              <button
                onClick={() => setGalleryOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {loadingGallery ? (
                <div className="py-16 text-center text-slate-400 font-mono text-xs animate-pulse">
                  Cargando archivos multimedia...
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  No hay imágenes en la galería aún. Sube una imagen directamente.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onChange(item.url);
                        setGalleryOpen(false);
                      }}
                      className="group relative bg-[#0D1117] border border-[#30363D] hover:border-purple-500 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] flex flex-col"
                    >
                      <div className="h-28 w-full bg-black relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 flex flex-col gap-0.5 bg-[#161B22]">
                        <span className="text-[10px] text-slate-300 font-mono truncate">
                          {item.originalName}
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                          <span>{(item.sizeBytes / 1024).toFixed(0)} KB</span>
                          {item.width && item.height && (
                            <span className="text-purple-400 font-bold">{item.width}×{item.height}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#30363D] bg-[#0D1117] flex justify-end">
              <button
                onClick={() => setGalleryOpen(false)}
                className="px-4 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-white text-xs font-bold rounded-lg"
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
