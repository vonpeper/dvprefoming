"use client";

import React, { useState, useEffect } from "react";
import { WebsiteContent } from "@/lib/storage";
import ImageUploader from "@/components/ui/image-uploader";

export default function WebsiteContentEditorPage() {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "manifesto" | "programs" | "teachers" | "productions" | "contact" | "footer">("hero");

  useEffect(() => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) setContent(data.content);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios de páginas.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <span className="animate-spin mr-2">⏳</span> Cargando contenidos del sitio web...
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "🌟 Hero & Portada" },
    { id: "manifesto", label: "📜 Manifiesto & Misión" },
    { id: "programs", label: "🎓 Programas & Clases" },
    { id: "teachers", label: "👨‍🏫 Planta Docente" },
    { id: "productions", label: "🎭 Cartelera & Obras" },
    { id: "contact", label: "📍 Contacto & Horarios" },
    { id: "footer", label: "🦶 Footer & Redes Sociales" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Editor de Contenidos & Secciones Web
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personaliza textos, reemplaza fotografías con optimización automática WebP y administra datos oficiales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
              <span>✓</span> Cambios guardados correctamente
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 bg-[#161B22] p-2 rounded-xl border border-[#30363D]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow"
                : "text-slate-300 hover:bg-[#21262D] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Image Resolution Guide Banner */}
      <div className="bg-[#161B22]/60 border border-purple-500/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-purple-300 font-bold">
          <span>📐</span>
          <span>Guía de Tamaños de Imagen en Pixeles:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="bg-[#0D1117] border border-[#30363D] px-2.5 py-1 rounded text-slate-300">
            <strong className="text-purple-400">Hero Portada:</strong> 800×1067 px (3:4)
          </span>
          <span className="bg-[#0D1117] border border-[#30363D] px-2.5 py-1 rounded text-slate-300">
            <strong className="text-purple-400">Manifiesto:</strong> 800×800 px (1:1)
          </span>
          <span className="bg-[#0D1117] border border-[#30363D] px-2.5 py-1 rounded text-slate-300">
            <strong className="text-purple-400">Talleres:</strong> 1200×675 px (16:9)
          </span>
          <span className="bg-[#0D1117] border border-[#30363D] px-2.5 py-1 rounded text-slate-300">
            <strong className="text-purple-400">Maestros:</strong> 600×800 px (3:4)
          </span>
          <span className="bg-[#0D1117] border border-[#30363D] px-2.5 py-1 rounded text-slate-300">
            <strong className="text-purple-400">Obras / Cartel:</strong> 800×1067 px (3:4)
          </span>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 sm:p-8 shadow-sm">
        {/* ================= HERO TAB ================= */}
        {activeTab === "hero" && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <h2 className="text-lg font-bold text-white border-b border-[#30363D] pb-3">
              Sección Hero (Portada Principal)
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Etiqueta Superior (Badge)</label>
              <input
                type="text"
                value={content.hero.badgeText}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, badgeText: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Titular Principal (Headline)</label>
              <textarea
                rows={3}
                value={content.hero.headline}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, headline: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none resize-none font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Subtítulo / Misión Breve</label>
              <textarea
                rows={3}
                value={content.hero.subtitle}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Texto Botón Primario</label>
                <input
                  type="text"
                  value={content.hero.primaryCtaText}
                  onChange={(e) =>
                    setContent({ ...content, hero: { ...content.hero, primaryCtaText: e.target.value } })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Texto Botón Secundario</label>
                <input
                  type="text"
                  value={content.hero.secondaryCtaText}
                  onChange={(e) =>
                    setContent({ ...content, hero: { ...content.hero, secondaryCtaText: e.target.value } })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Aviso de Convocatoria Activa</label>
              <input
                type="text"
                value={content.hero.auditionNotice}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, auditionNotice: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            {/* Reusable Image Uploader for Hero */}
            <ImageUploader
              label="Fotografía Principal de Escenario (Hero)"
              value={content.hero.heroImage}
              aspectRatio="3:4"
              recommendedSize="800 × 1067 px (o 1200 × 1600 px • 3:4 Vertical)"
              description="Fotografía vertical de alto impacto del escenario o elenco principal."
              onChange={(newUrl) =>
                setContent({ ...content, hero: { ...content.hero, heroImage: newUrl } })
              }
            />
          </div>
        )}

        {/* ================= MANIFESTO TAB ================= */}
        {activeTab === "manifesto" && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <h2 className="text-lg font-bold text-white border-b border-[#30363D] pb-3">
              Sección Manifiesto & Misión
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Etiqueta de Sección</label>
              <input
                type="text"
                value={content.manifesto.tag}
                onChange={(e) =>
                  setContent({ ...content, manifesto: { ...content.manifesto, tag: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Título de la Declaración</label>
              <input
                type="text"
                value={content.manifesto.title}
                onChange={(e) =>
                  setContent({ ...content, manifesto: { ...content.manifesto, title: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Descripción / Filosofía Educativa</label>
              <textarea
                rows={4}
                value={content.manifesto.description}
                onChange={(e) =>
                  setContent({ ...content, manifesto: { ...content.manifesto, description: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none resize-none"
              />
            </div>

            {/* Reusable Image Uploader for Manifesto */}
            <ImageUploader
              label="Fotografía de Ensayo en Backstage (Manifiesto)"
              value={content.manifesto.image}
              aspectRatio="1:1"
              recommendedSize="800 × 800 px (o 1000 × 1000 px • 1:1 Cuadrado)"
              description="Fotografía de ensayo en backstage, dirección artística o clases en aula."
              onChange={(newUrl) =>
                setContent({ ...content, manifesto: { ...content.manifesto, image: newUrl } })
              }
            />
          </div>
        )}

        {/* ================= PROGRAMS TAB ================= */}
        {activeTab === "programs" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white border-b border-[#30363D] pb-3">
              Oferta Académica & Talleres ({content.programs.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.programs.map((prog, idx) => (
                <div key={prog.id} className="p-5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-purple-400 font-bold uppercase">{prog.id}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">{prog.category || "Taller"}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Nombre del Programa</label>
                    <input
                      type="text"
                      value={prog.name}
                      onChange={(e) => {
                        const updated = [...content.programs];
                        updated[idx].name = e.target.value;
                        setContent({ ...content, programs: updated });
                      }}
                      className="bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Descripción</label>
                    <textarea
                      rows={3}
                      value={prog.description}
                      onChange={(e) => {
                        const updated = [...content.programs];
                        updated[idx].description = e.target.value;
                        setContent({ ...content, programs: updated });
                      }}
                      className="bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Reusable Image Uploader for Program */}
                  <ImageUploader
                    label="Póster / Portada del Taller"
                    value={prog.imageUrl || ""}
                    aspectRatio="16:9"
                    recommendedSize="1200 × 675 px (o 800 × 450 px • 16:9)"
                    description="Fotografía horizontal representativa de la clase (canto, danza o teatro integral)."
                    onChange={(newUrl) => {
                      const updated = [...content.programs];
                      updated[idx].imageUrl = newUrl;
                      setContent({ ...content, programs: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TEACHERS TAB ================= */}
        {activeTab === "teachers" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white border-b border-[#30363D] pb-3">
              Planta Docente & Maestros ({content.teachers.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {content.teachers.map((teacher, idx) => (
                <div key={teacher.id} className="p-5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Nombre del Docente</label>
                    <input
                      type="text"
                      value={teacher.fullName}
                      onChange={(e) => {
                        const updated = [...content.teachers];
                        updated[idx].fullName = e.target.value;
                        setContent({ ...content, teachers: updated });
                      }}
                      className="w-full bg-[#161B22] border border-[#30363D] rounded px-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Cargo / Disciplina</label>
                    <input
                      type="text"
                      value={teacher.title || ""}
                      onChange={(e) => {
                        const updated = [...content.teachers];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, teachers: updated });
                      }}
                      className="w-full bg-[#161B22] border border-[#30363D] rounded px-3 py-1.5 text-xs text-slate-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Biografía Resumida</label>
                    <textarea
                      rows={3}
                      value={teacher.bio}
                      onChange={(e) => {
                        const updated = [...content.teachers];
                        updated[idx].bio = e.target.value;
                        setContent({ ...content, teachers: updated });
                      }}
                      className="bg-[#161B22] border border-[#30363D] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Reusable Image Uploader for Teacher */}
                  <ImageUploader
                    label="Retrato Oficial del Maestro"
                    value={teacher.imageUrl || ""}
                    aspectRatio="3:4"
                    recommendedSize="600 × 800 px (3:4 Vertical)"
                    description="Retrato profesional o headshot del maestro con fondo escénico o limpio."
                    onChange={(newUrl) => {
                      const updated = [...content.teachers];
                      updated[idx].imageUrl = newUrl;
                      setContent({ ...content, teachers: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PRODUCTIONS TAB ================= */}
        {activeTab === "productions" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white border-b border-[#30363D] pb-3">
              Cartelera de Obras & Montajes ({content.productions.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {content.productions.map((prod, idx) => (
                <div key={prod.id} className="p-5 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Título de la Obra</label>
                    <input
                      type="text"
                      value={prod.title}
                      onChange={(e) => {
                        const updated = [...content.productions];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, productions: updated });
                      }}
                      className="bg-[#161B22] border border-[#30363D] rounded px-2.5 py-1.5 text-xs text-white font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Sinopsis</label>
                    <textarea
                      rows={3}
                      value={prod.synopsis}
                      onChange={(e) => {
                        const updated = [...content.productions];
                        updated[idx].synopsis = e.target.value;
                        setContent({ ...content, productions: updated });
                      }}
                      className="bg-[#161B22] border border-[#30363D] rounded px-2.5 py-1.5 text-xs text-slate-200 resize-none"
                    />
                  </div>

                  {/* Reusable Image Uploader for Production */}
                  <ImageUploader
                    label="Póster Oficial de la Obra"
                    value={prod.imageUrl || ""}
                    aspectRatio="3:4"
                    recommendedSize="800 × 1067 px (3:4 Vertical Cartel)"
                    description="Póster oficial con título, fecha y arte gráfico del montaje."
                    onChange={(newUrl) => {
                      const updated = [...content.productions];
                      updated[idx].imageUrl = newUrl;
                      setContent({ ...content, productions: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= CONTACT TAB ================= */}
        {activeTab === "contact" && (
          <div className="flex flex-col gap-6 max-w-2xl">
            <h2 className="text-lg font-bold text-white border-b border-[#30363D] pb-3">
              Información de Contacto & Horarios de Atención
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Dirección Oficial de la Academia</label>
              <input
                type="text"
                value={content.contact.address}
                onChange={(e) =>
                  setContent({ ...content, contact: { ...content.contact, address: e.target.value } })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  value={content.contact.phone}
                  onChange={(e) =>
                    setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) =>
                    setContent({ ...content, contact: { ...content.contact, email: e.target.value } })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Horario Lunes a Viernes</label>
                <input
                  type="text"
                  value={content.contact.hoursWeekday}
                  onChange={(e) =>
                    setContent({ ...content, contact: { ...content.contact, hoursWeekday: e.target.value } })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Horario Sábados</label>
                <input
                  type="text"
                  value={content.contact.hoursSaturday}
                  onChange={(e) =>
                    setContent({ ...content, contact: { ...content.contact, hoursSaturday: e.target.value } })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= FOOTER & REDES SOCIALES TAB ================= */}
        {activeTab === "footer" && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div>
              <h2 className="text-lg font-bold text-white border-b border-[#30363D] pb-3">
                Pie de Página (Footer) & Redes Sociales
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Personaliza los textos institucionales y los enlaces de redes sociales (Instagram, Facebook y TikTok) que se muestran en el pie de página de todo el sitio web.
              </p>
            </div>

            {/* Slogan / Descripción institucional */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Descripción Institucional / Slogan del Footer
              </label>
              <textarea
                rows={2}
                value={content.footer?.description || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: {
                      ...(content.footer || {
                        description: "",
                        copyright: "© 2026 DV PERFORMING ARTS. Todos los derechos reservados.",
                        socialLinks: { instagram: "", facebook: "", tiktok: "" },
                      }),
                      description: e.target.value,
                    },
                  })
                }
                placeholder="Academia de formación integral en Teatro Musical, Danza Urbana, Canto y Actuación en León, Guanajuato."
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none resize-none"
              />
            </div>

            {/* Copyright */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Texto de Derechos Reservados (Copyright)
              </label>
              <input
                type="text"
                value={content.footer?.copyright || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: {
                      ...(content.footer || {
                        description: "",
                        copyright: "© 2026 DV PERFORMING ARTS.",
                        socialLinks: { instagram: "", facebook: "", tiktok: "" },
                      }),
                      copyright: e.target.value,
                    },
                  })
                }
                placeholder="© 2026 DV PERFORMING ARTS. Todos los derechos reservados."
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
              />
            </div>

            {/* Redes Sociales Oficiales */}
            <div className="flex flex-col gap-4 border-t border-[#30363D] pt-5 mt-2">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <span>🌐</span> Redes Sociales Oficiales (Exclusivas)
              </h3>
              <p className="text-xs text-slate-400 -mt-2">
                Ingresa los perfiles oficiales. El sitio web mostrará sus respectivos iconos interactivos en el footer.
              </p>

              {/* Instagram */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>📸</span> Enlace a Instagram
                </label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/dvperformingarts"
                  value={content.footer?.socialLinks?.instagram || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {
                          description: "",
                          copyright: "© 2026 DV PERFORMING ARTS.",
                          socialLinks: { instagram: "", facebook: "", tiktok: "" },
                        }),
                        socialLinks: {
                          ...(content.footer?.socialLinks || { instagram: "", facebook: "", tiktok: "" }),
                          instagram: e.target.value,
                        },
                      },
                    })
                  }
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>

              {/* Facebook */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>📘</span> Enlace a Facebook
                </label>
                <input
                  type="url"
                  placeholder="https://www.facebook.com/dvperformingarts"
                  value={content.footer?.socialLinks?.facebook || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {
                          description: "",
                          copyright: "© 2026 DV PERFORMING ARTS.",
                          socialLinks: { instagram: "", facebook: "", tiktok: "" },
                        }),
                        socialLinks: {
                          ...(content.footer?.socialLinks || { instagram: "", facebook: "", tiktok: "" }),
                          facebook: e.target.value,
                        },
                      },
                    })
                  }
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>

              {/* TikTok */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>🎵</span> Enlace a TikTok
                </label>
                <input
                  type="url"
                  placeholder="https://www.tiktok.com/@dvperformingarts"
                  value={content.footer?.socialLinks?.tiktok || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {
                          description: "",
                          copyright: "© 2026 DV PERFORMING ARTS.",
                          socialLinks: { instagram: "", facebook: "", tiktok: "" },
                        }),
                        socialLinks: {
                          ...(content.footer?.socialLinks || { instagram: "", facebook: "", tiktok: "" }),
                          tiktok: e.target.value,
                        },
                      },
                    })
                  }
                  className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
