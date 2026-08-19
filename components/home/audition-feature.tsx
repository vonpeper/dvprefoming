"use client";

import React, { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/section-heading";
import { Production } from "@/types/mock";

export default function AuditionFeature() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [activeProduction, setActiveProduction] = useState<Production | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    productionId: "prod_si_no_es_ahora",
    productionName: "Si No Es Ahora (El Musical)",
    programId: "prog_teatro_musical",
    programName: "Teatro Musical Integral",
    preferredSchedule: "Turno Vespertino (16:00 - 20:00)",
    experienceNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    folio: string;
    fullName: string;
    productionName: string;
    programName: string;
    phone: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/productions")
      .then((res) => res.json())
      .then((data) => {
        if (data?.productions && data.productions.length > 0) {
          setProductions(data.productions);
          const active = data.activeAudition || data.productions[0];
          setActiveProduction(active);
          setFormData((prev) => ({
            ...prev,
            productionId: active.id,
            productionName: active.title,
          }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const programOptions = [
    { id: "prog_teatro_musical", name: "Teatro Musical Integral (Canto, Danza & Actuación)" },
    { id: "prog_danza_urbana", name: "Danza Urbana & Hip Hop" },
    { id: "prog_canto_vocal", name: "Canto & Técnica Vocal" },
    { id: "prog_actuacion_escenica", name: "Actuación & Presencia Escénica" },
  ];

  const scheduleOptions = [
    "Turno Vespertino (Lunes a Viernes 16:00 - 20:00)",
    "Turno Sabatino (Sábados 10:00 - 15:00)",
    "Horario Flexible / Por Definir en Cita",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Por favor escribe tu nombre completo.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Por favor ingresa un número de WhatsApp válido (10 dígitos).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auditions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Ocurrió un detalle al enviar el formulario. Intenta nuevamente.");
        setLoading(false);
        return;
      }

      setSubmittedData({
        folio: data.audition.folio,
        fullName: data.audition.fullName,
        productionName: data.audition.productionName || formData.productionName,
        programName: data.audition.programName || formData.programName,
        phone: data.audition.phone,
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        age: "",
        productionId: activeProduction ? activeProduction.id : "prod_si_no_es_ahora",
        productionName: activeProduction ? activeProduction.title : "Si No Es Ahora (El Musical)",
        programId: "prog_teatro_musical",
        programName: "Teatro Musical Integral",
        preferredSchedule: "Turno Vespertino (16:00 - 20:00)",
        experienceNotes: "",
      });
    } catch (err) {
      console.error("[FORM SUBMISSION ERROR]", err);
      setErrorMessage("Hubo un problema de conexión. Puedes escribirnos directamente por WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="audiciones" className="relative w-full py-20 px-6 border-b-4 border-border-editorial bg-background-main" aria-labelledby="heading-audiciones">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Heading */}
        <SectionHeading
          number="03"
          label="Admisiones & Convocatorias"
          title="Registro de Audiciones"
        />

        {/* Peaceful, Urban Studio Feature Card */}
        <div className="bg-[#0F0F14] border border-[#242430] rounded-3xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row gap-12 items-start shadow-xl relative overflow-hidden">
          
          {/* Subtle warm glow background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-red/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left Column: Peaceful & Friendly Information */}
          <div className="flex-1 flex flex-col justify-between gap-8 z-10">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-red/10 border border-accent-red/30 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                <span className="text-xs font-semibold text-rose-300">
                  Convocatoria {activeProduction?.season || "2026"} &bull; León, Gto.
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Audiciones para &ldquo;{activeProduction?.title || "Si No Es Ahora"}&rdquo;
              </h3>

              <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
                Queremos conocer tu talento y energía. No necesitas tener experiencia profesional previa para audicionar; buscamos personas con pasión por el teatro musical, el canto y la danza urbana, con ganas de aprender y subir al escenario.
              </p>
            </div>

            {/* Friendly Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#15151D] border border-[#282836] rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-semibold text-rose-400">🎭 Obra en Convocatoria</span>
                <span className="text-sm font-bold text-white">{activeProduction?.title || "Si No Es Ahora (El Musical)"}</span>
                <span className="text-xs text-zinc-400">{activeProduction?.auditionDates || "Convocatoria Abierta 2026"}</span>
              </div>

              <div className="p-4 bg-[#15151D] border border-[#282836] rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-semibold text-rose-400">💃 Disciplinas</span>
                <span className="text-sm font-bold text-white">Danza Urbana, Canto & Teatro</span>
                <span className="text-xs text-zinc-400">Formación escénica integral</span>
              </div>

              <div className="p-4 bg-[#15151D] border border-[#282836] rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-semibold text-rose-400">📍 Sede de la Academia</span>
                <span className="text-sm font-bold text-white">Paseo de los Insurgentes #1506</span>
                <span className="text-xs text-zinc-400">Jardines del Moral, León, Gto.</span>
              </div>

              <div className="p-4 bg-[#15151D] border border-[#282836] rounded-2xl flex flex-col gap-1">
                <span className="text-xs font-semibold text-rose-400">📱 Confirmación Inmediata</span>
                <span className="text-sm font-bold text-white">Folio por WhatsApp</span>
                <span className="text-xs text-zinc-400">Detalles de horario y cita al instante</span>
              </div>
            </div>

            {/* Friendly Help Line */}
            <div className="p-4 bg-[#15151D]/60 rounded-2xl border border-[#282836]/60 flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>¿Tienes dudas antes de registrarte? Escríbenos:</span>
              </div>
              <a
                href="https://wa.me/524776558156"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-rose-400 hover:text-rose-300 underline"
              >
                477 655 8156
              </a>
            </div>
          </div>

          {/* Right Column: Peaceful, User-Friendly Form */}
          <div className="w-full lg:w-[480px] bg-[#14141C] border border-[#282836] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
            
            {submittedData ? (
              /* Success / Confirmation Screen */
              <div className="flex flex-col items-center text-center gap-5 animate-fade-in py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-3xl shadow-lg">
                  ✓
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ¡Registro completado con éxito!
                  </span>
                  <h4 className="text-2xl font-bold text-white font-display">
                    {submittedData.fullName}
                  </h4>
                  <span className="text-xs text-zinc-400">
                    {submittedData.productionName} &bull; {submittedData.programName}
                  </span>
                </div>

                {/* Folio Highlight Card */}
                <div className="w-full bg-[#0D0D12] border border-rose-500/40 rounded-2xl p-5 flex flex-col gap-1 my-1 shadow-inner">
                  <span className="text-xs text-zinc-400 font-medium">Tu Folio de Audición:</span>
                  <span className="font-mono text-2xl font-black text-rose-400 tracking-wider">
                    {submittedData.folio}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1">
                    Presenta este folio en recepción al llegar a tu cita.
                  </span>
                </div>

                <div className="p-4 bg-[#181822] border border-[#2A2A38] rounded-xl text-left w-full flex items-start gap-3 text-xs text-zinc-300">
                  <span className="text-lg">📱</span>
                  <p className="leading-relaxed">
                    Hemos enviado los detalles y recomendaciones de tu audición a tu WhatsApp <strong>{submittedData.phone}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedData(null)}
                  className="w-full py-3 bg-[#1C1C26] hover:bg-[#252533] text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-[#303040]"
                >
                  Registrar a otro aspirante
                </button>
              </div>
            ) : (
              /* Peaceful Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="border-b border-[#252532] pb-3 mb-1">
                  <h4 className="text-lg font-bold text-white font-display">Formulario de Postulación</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Llena tus datos con calma. Nos comunicaremos contigo de inmediato.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Obra en Convocatoria */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <span>🎭 Obra a la que deseas audicionar *</span>
                  </label>
                  <select
                    value={formData.productionId}
                    onChange={(e) => {
                      const selected = productions.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        productionId: e.target.value,
                        productionName: selected ? selected.title : "Si No Es Ahora",
                      });
                    }}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] hover:border-rose-500/60 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:outline-none transition-colors cursor-pointer"
                  >
                    {productions.map((prod) => (
                      <option key={prod.id} value={prod.id} className="bg-[#14141C] text-white">
                        {prod.title} ({prod.season || "2026"}) {prod.isAuditionActive ? "★ Convocatoria Activa" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre Completo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Nombre completo del aspirante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Hernández Navarro"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#282836] focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Teléfono WhatsApp & Edad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      WhatsApp (10 dígitos) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 477 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0D0D12] border border-[#282836] focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Edad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 19 años"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-[#0D0D12] border border-[#282836] focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Correo electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#282836] focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Disciplina de Mayor Interés */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Disciplina de mayor interés *
                  </label>
                  <select
                    value={formData.programId}
                    onChange={(e) => {
                      const selected = programOptions.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        programId: e.target.value,
                        programName: selected ? selected.name : "Teatro Musical",
                      });
                    }}
                    className="w-full bg-[#0D0D12] border border-[#282836] focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    {programOptions.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-[#14141C] text-white">
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Turno Preferido */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Turno de tu preferencia
                  </label>
                  <select
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#282836] focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    {scheduleOptions.map((s, idx) => (
                      <option key={idx} value={s} className="bg-[#14141C] text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experiencia o Comentarios */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    ¿Tienes experiencia previa o algún comentario? (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Cuéntanos brevemente si has tomado clases de danza, canto o teatro..."
                    value={formData.experienceNotes}
                    onChange={(e) => setFormData({ ...formData, experienceNotes: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#282836] focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-rose-950/40 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generando tu Folio y Notificación...</span>
                    </>
                  ) : (
                    <span>Enviar Registro de Audición ✨</span>
                  )}
                </button>

                <p className="text-[11px] text-zinc-400 text-center mt-1">
                  🔒 Tus datos están seguros &bull; Recibirás un mensaje de confirmación por WhatsApp
                </p>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
