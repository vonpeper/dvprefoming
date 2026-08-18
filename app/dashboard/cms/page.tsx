"use client";

import React, { useState, useEffect } from "react";
import { CMSBlock, CMSBlockType } from "@/features/cms/types";
import { initialCMSBlocks } from "@/features/cms/data/mock-cms";
import CMSRenderer from "@/features/cms/components/cms-renderer";
import Link from "next/link";

export default function CMSDashboardPage() {
  const [blocks, setBlocks] = useState<CMSBlock[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load from localStorage or fall back to mock data
  useEffect(() => {
    const saved = localStorage.getItem("dv_cms_blocks");
    let loadedBlocks = initialCMSBlocks;
    if (saved) {
      try {
        loadedBlocks = JSON.parse(saved);
      } catch {
        loadedBlocks = initialCMSBlocks;
      }
    }
    Promise.resolve().then(() => {
      setBlocks(loadedBlocks);
    });
  }, []);

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      localStorage.setItem("dv_cms_blocks", JSON.stringify(blocks));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  const handleUpdateBlockContent = (id: string, field: string, value: string) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;
        return {
          ...block,
          content: {
            ...block.content,
            [field]: value,
          },
        };
      })
    );
  };

  const handleUpdateBlockOrder = (id: string, newOrder: number) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;
        return { ...block, order: newOrder };
      })
    );
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const handleAddBlock = (type: CMSBlockType) => {
    const newId = `block_${Date.now()}`;
    const newOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.order)) + 10 : 10;
    
    let defaultContent = {};
    if (type === "HEADING") {
      defaultContent = { text: "NUEVO TÍTULO", accentText: "ACENTO DE TÍTULO" };
    } else if (type === "PARAGRAPH") {
      defaultContent = { text: "Escribe aquí el contenido del párrafo..." };
    } else if (type === "WARNING_BANNER") {
      defaultContent = { text: "AVISO DE BACKSTAGE IMPORTANTE", variant: "red" };
    } else if (type === "IMAGE_GRID") {
      defaultContent = { images: ["SALA DE ENSAYO", "FESTIVAL TEATRAL"], variant: "concrete" };
    }

    const newBlock: CMSBlock = {
      id: newId,
      type,
      content: defaultContent,
      order: newOrder,
    };

    setBlocks((prev) => [...prev, newBlock]);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-text-main flex flex-col font-sans select-none">
      
      {/* Dashboard Top Header */}
      <header className="w-full border-b-2 border-border-editorial bg-background-sec px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-3 py-1.5 border border-border-editorial hover:border-accent-red font-mono text-[9px] uppercase tracking-widest text-text-main hover:text-accent-red transition-colors"
          >
            [ VOLVER AL INICIO ]
          </Link>
          <span className="font-display text-2xl font-extrabold tracking-tight">
            DV PERFORMING ARTS CMS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] text-text-muted">
            STATUS: {saveStatus === "saving" ? "SINCRONIZANDO..." : saveStatus === "saved" ? "GUARDADO CON ÉXITO" : "CAMBIOS PENDIENTES"}
          </span>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="px-6 py-2 bg-accent-red hover:bg-text-main hover:text-accent-red text-text-main border-2 border-accent-red font-sans text-[11px] uppercase tracking-widest font-bold cursor-pointer transition-all duration-200"
          >
            {saveStatus === "saving" ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </header>

      {/* Main Workspace split panel */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch">
        
        {/* Left Panel: Block List / Editor Cockpit */}
        <div className="w-full lg:w-1/2 border-r-2 border-border-editorial p-6 flex flex-col gap-6 overflow-y-auto max-h-[85vh] lg:max-h-none">
          <div className="flex justify-between items-center border-b border-border-editorial-light pb-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-accent-red font-bold uppercase">
              Lista de Bloques en Pantalla
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddBlock("HEADING")}
                className="px-2 py-1 bg-background-main border border-border-editorial hover:border-text-main font-mono text-[8px] uppercase tracking-widest text-text-muted hover:text-text-main"
              >
                + TÍTULO
              </button>
              <button
                onClick={() => handleAddBlock("PARAGRAPH")}
                className="px-2 py-1 bg-background-main border border-border-editorial hover:border-text-main font-mono text-[8px] uppercase tracking-widest text-text-muted hover:text-text-main"
              >
                + PÁRRAFO
              </button>
              <button
                onClick={() => handleAddBlock("WARNING_BANNER")}
                className="px-2 py-1 bg-background-main border border-border-editorial hover:border-text-main font-mono text-[8px] uppercase tracking-widest text-text-muted hover:text-text-main"
              >
                + ALERTA
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="border-2 border-border-editorial-light bg-background-sec p-4 flex flex-col gap-4 relative"
              >
                <div className="flex justify-between items-center border-b border-border-editorial pb-2">
                  <span className="font-mono text-[9px] text-accent-yellow uppercase font-bold">
                    {block.type} &bull; ID: {block.id}
                  </span>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="font-mono text-[8px] text-accent-red hover:text-text-main uppercase cursor-pointer"
                  >
                    [ Eliminar ]
                  </button>
                </div>

                {/* Content Editors based on type */}
                {block.type === "HEADING" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-text-muted uppercase">Texto Principal</label>
                      <input
                        type="text"
                        value={block.content.text || ""}
                        onChange={(e) => handleUpdateBlockContent(block.id, "text", e.target.value)}
                        className="bg-background-main border border-border-editorial-light p-2 text-xs font-mono text-text-main focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-text-muted uppercase">Acento Destacado</label>
                      <input
                        type="text"
                        value={block.content.accentText || ""}
                        onChange={(e) => handleUpdateBlockContent(block.id, "accentText", e.target.value)}
                        className="bg-background-main border border-border-editorial-light p-2 text-xs font-mono text-text-main focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {block.type === "PARAGRAPH" && (
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-text-muted uppercase">Texto del Párrafo</label>
                    <textarea
                      value={block.content.text || ""}
                      onChange={(e) => handleUpdateBlockContent(block.id, "text", e.target.value)}
                      rows={3}
                      className="bg-background-main border border-border-editorial-light p-2 text-xs font-mono text-text-main focus:outline-none resize-none"
                    />
                  </div>
                )}

                {block.type === "WARNING_BANNER" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-text-muted uppercase">Texto de Aviso</label>
                      <input
                        type="text"
                        value={block.content.text || ""}
                        onChange={(e) => handleUpdateBlockContent(block.id, "text", e.target.value)}
                        className="bg-background-main border border-border-editorial-light p-2 text-xs font-mono text-text-main focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-text-muted uppercase">Variante de Color</label>
                      <select
                        value={block.content.variant || "red"}
                        onChange={(e) => handleUpdateBlockContent(block.id, "variant", e.target.value)}
                        className="bg-background-main border border-border-editorial-light p-2 text-xs font-mono text-text-main focus:outline-none"
                      >
                        <option value="red">Rojo Alerta</option>
                        <option value="dark">Carbón Oscuro</option>
                        <option value="concrete">Gris Concreto</option>
                      </select>
                    </div>
                  </div>
                )}

                {block.type === "IMAGE_GRID" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[8px] text-text-muted uppercase">Etiquetas de Imágenes (Separadas por comas)</label>
                    <input
                      type="text"
                      value={block.content.images ? block.content.images.join(", ") : ""}
                      onChange={(e) => {
                        const arr = e.target.value.split(",").map((s) => s.trim());
                        setBlocks((prev) =>
                          prev.map((b) => {
                            if (b.id !== block.id) return b;
                            return { ...b, content: { ...b.content, images: arr } };
                          })
                        );
                      }}
                      className="bg-background-main border border-border-editorial-light p-2 text-xs font-mono text-text-main focus:outline-none"
                    />
                  </div>
                )}

                {/* Common order settings */}
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] text-text-muted uppercase">Orden de Visualización</span>
                    <input
                      type="number"
                      value={block.order}
                      onChange={(e) => handleUpdateBlockOrder(block.id, parseInt(e.target.value) || 0)}
                      className="w-16 bg-background-main border border-border-editorial-light p-1.5 text-xs font-mono text-text-main text-center focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: High-fidelity visual preview */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col gap-6 bg-background-main overflow-y-auto max-h-[85vh] lg:max-h-none border-t-2 lg:border-t-0 border-border-editorial">
          <div className="border-b border-border-editorial pb-2 mb-4">
            <span className="font-mono text-[10px] tracking-[0.2em] text-text-muted uppercase block">
              &bull; PREVISUALIZACIÓN DE COMPOSICIÓN EDITORIAL EN VIVO
            </span>
          </div>

          <div className="border-4 border-dashed border-border-editorial p-6 bg-background-sec/20">
            <CMSRenderer blocks={blocks} />
          </div>
        </div>

      </div>

    </div>
  );
}
