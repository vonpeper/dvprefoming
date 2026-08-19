"use client";

import React, { useState, useEffect } from "react";
import { Production } from "@/types/mock";

export default function AuditionFeature() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [activeProduction, setActiveProduction] = useState<Production | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    birthDate: "",
    productionId: "prod_si_no_es_ahora",
    productionName: "Si No Es Ahora (El Musical)",
    programId: "prog_teatro_musical",
    programName: "Teatro Musical Integral (Canto, Danza & Actuación)",
    preferredSchedule: "Turno Vespertino (Lunes a Viernes 16:00 - 20:00)",
    experienceNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    folio: string;
    fullName: string;
    productionName: string;
    programName: string;
    phone: string;
    preferredSchedule: string;
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
    { id: "prog_actuacion_escenica", name: "Actuación Escénica & Expresión Corporal" },
  ];

  const scheduleOptions = [
    "Turno Vespertino (Lunes a Viernes 16:00 - 20:00)",
    "Turno Sabatino (Sábados 10:00 - 15:00)",
    "Horario Flexible / Por Asignar en Cita",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Por favor escribe tu nombre completo.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Ingresa un número de WhatsApp válido (10 dígitos).");
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
        setErrorMessage(data.error || "Ocurrió un detalle al enviar el registro.");
        setLoading(false);
        return;
      }

      setSubmittedData({
        folio: data.audition.folio,
        fullName: data.audition.fullName,
        productionName: data.audition.productionName || formData.productionName,
        programName: data.audition.programName || formData.programName,
        phone: data.audition.phone,
        preferredSchedule: data.audition.preferredSchedule || formData.preferredSchedule,
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        age: "",
        birthDate: "",
        productionId: activeProduction ? activeProduction.id : "prod_si_no_es_ahora",
        productionName: activeProduction ? activeProduction.title : "Si No Es Ahora (El Musical)",
        programId: "prog_teatro_musical",
        programName: "Teatro Musical Integral (Canto, Danza & Actuación)",
        preferredSchedule: "Turno Vespertino (Lunes a Viernes 16:00 - 20:00)",
        experienceNotes: "",
      });
    } catch (err) {
      console.error("[FORM SUBMISSION ERROR]", err);
      setErrorMessage("Error de conexión al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="audiciones" className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-audiciones">
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        
        {/* ================= URBAN STREET DANCE BRUSH GRAFFITI HEADER ================= */}
        <div className="flex flex-col items-center text-center mb-12 relative select-none">
          
          {/* Top Stage Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-900/40 border border-purple-500/40 rounded-full text-xs font-semibold text-purple-300 mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span className="tracking-widest uppercase text-[11px] font-bold">CONVOCATORIA DE TALENTO &bull; TEMPORADA 2026</span>
          </div>

          {/* Urban Dance Brush Graffiti Title Box */}
          <div className="relative inline-flex items-center justify-center my-3 px-10 sm:px-14 py-4 sm:py-6">
            
            {/* The Authentic Purple / Magenta Street Brush Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 rounded-3xl transform -rotate-1 skew-x-[-6deg] shadow-[0_15px_45px_rgba(168,85,247,0.5)] border border-purple-400/30" />
            
            {/* Spray paint drips hanging down from the brush bottom */}
            <div className="absolute -bottom-6 left-12 w-2 h-8 bg-white rounded-full opacity-90 shadow-md" />
            <div className="absolute -bottom-10 left-24 w-1.5 h-12 bg-white rounded-full opacity-80" />
            <div className="absolute -bottom-5 right-16 w-2 h-7 bg-white rounded-full opacity-85" />
            <div className="absolute -bottom-9 right-32 w-1.5 h-10 bg-white rounded-full opacity-75" />
            
            {/* Paint Splatter & Spray Dots */}
            <span className="absolute -top-4 right-10 w-2.5 h-2.5 rounded-full bg-white opacity-90 shadow" />
            <span className="absolute -bottom-4 left-6 w-2 h-2 rounded-full bg-white opacity-80" />
            <span className="absolute top-2 -left-5 w-2 h-2 rounded-full bg-purple-300 opacity-90" />
            <span className="absolute -top-3 -right-4 w-3 h-3 rounded-full bg-fuchsia-300 opacity-90" />

            {/* Spray Halo ring above the title */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-4 border-[2.5px] border-white rounded-full transform -rotate-6 shadow-sm pointer-events-none" />

            {/* Main Urban Brush Title: AUDICIONES */}
            <h2
              className="font-urban-brush text-white tracking-wider uppercase leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] transform -rotate-[1deg] relative z-10"
              style={{ fontSize: "clamp(3.2rem, 8.5vw, 6.2rem)" }}
            >
              AUDICIONES
            </h2>
          </div>

          <p className="text-zinc-300 text-sm sm:text-base text-center max-w-xl mt-5 font-normal leading-relaxed">
            Inicia tu registro oficial para formar parte de nuestras producciones en León, Gto. Te asignamos tu folio y confirmamos tu cita al instante por WhatsApp.
          </p>
        </div>

        {/* ================= SMARTPHONE CHAT & REGISTRATION SIMULATION ================= */}
        <div className="w-full max-w-[480px] bg-[#121218]/95 backdrop-blur-2xl border-4 border-[#282838] rounded-[3rem] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-4 sm:p-6 relative overflow-hidden ring-1 ring-white/10">
          
          {/* Speaker / Dynamic Island Top Bar */}
          <div className="w-28 h-4 bg-black/90 rounded-full mx-auto mb-4 border border-white/10 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20202A]" />
          </div>

          {/* Phone Top Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252532] px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-lg font-bold shadow-inner">
                🎭
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white font-display">DV Performing Arts</span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  En línea &bull; Registro de Convocatoria
                </span>
              </div>
            </div>
            <span className="text-xs text-zinc-500 font-mono">León, GTO</span>
          </div>

          {/* Content Inside Smartphone */}
          <div className="flex flex-col gap-3 min-h-[420px]">
            
            {/* Incoming Message 1 (Greeting) */}
            <div className="bg-[#1C1C26] border border-[#2B2B3A] rounded-2xl rounded-tl-sm p-4 text-xs text-zinc-200 leading-relaxed shadow-sm text-left">
              <p>
                ¡Hola! 🎭 Queremos conocer tu talento. Completa tu ficha de registro para asignarte tu folio oficial y horario de audición:
              </p>
              <div className="mt-2 p-2 bg-black/50 rounded-xl border border-purple-500/30 flex items-center gap-2">
                <span className="text-purple-400 font-bold">🎬 Obra en Curso:</span>
                <span className="text-white font-semibold line-clamp-1">{activeProduction?.title || "Si No Es Ahora (El Musical)"}</span>
              </div>
            </div>

            {submittedData ? (
              /* Success / WhatsApp-style Confirmation Screen */
              <div className="flex flex-col gap-3 animate-fade-in my-auto py-2">
                {/* Outgoing Message from User */}
                <div className="bg-purple-950/50 border border-purple-500/40 rounded-2xl rounded-tr-sm p-3.5 text-xs text-purple-200 self-end max-w-[85%] text-left shadow-sm">
                  ✓ Envié mi registro de audición para <strong>{submittedData.productionName}</strong>.
                </div>

                {/* Incoming Message: Official Ticket & WhatsApp Dispatch */}
                <div className="bg-[#1C1C26] border border-[#2B2B3A] rounded-2xl rounded-tl-sm p-5 text-xs text-zinc-200 text-left flex flex-col gap-3 shadow-md">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">✓</span>
                    <span>¡Tu registro ha sido exitoso!</span>
                  </div>

                  <p className="text-zinc-300 leading-relaxed">
                    ¡Felicidades, <strong>{submittedData.fullName}</strong>! Tu postulación ha quedado registrada en la base de datos de audiciones de la academia.
                  </p>

                  {/* Folio Highlight Box */}
                  <div className="bg-black/70 border border-purple-500/50 rounded-xl p-4 text-center flex flex-col gap-1 my-1 shadow-inner">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Tu Folio Único Oficial:</span>
                    <span className="font-mono text-2xl font-black text-purple-300 tracking-widest">{submittedData.folio}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Presenta este código al presentarte en recepción</span>
                  </div>

                  <div className="text-[11px] text-zinc-300 leading-relaxed border-t border-[#2B2B3A] pt-2 flex items-center gap-2">
                    <span className="text-base">📱</span>
                    <span>Hemos enviado los detalles, hora y recomendaciones a tu WhatsApp <strong>{submittedData.phone}</strong>.</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="w-full mt-2 py-2.5 bg-[#252534] hover:bg-[#2E2E40] text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-[#353548]"
                  >
                    Registrar a otro aspirante
                  </button>
                </div>
              </div>
            ) : (
              /* Full Audition Registration Form inside Smartphone */
              <form onSubmit={handleSubmit} className="bg-[#161620] border border-[#2B2B3A] rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 text-left shadow-inner">
                {errorMessage && (
                  <div className="p-2.5 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* 1. Obra en Convocatoria */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-purple-300">
                    Obra / Puesta en Escena *
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
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-medium"
                  >
                    {productions.map((prod) => (
                      <option key={prod.id} value={prod.id} className="bg-[#14141C] text-white">
                        {prod.title} ({prod.season || "2026"}) {prod.isAuditionActive ? "★ Activa" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Nombre Completo */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Nombre completo del aspirante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Hernández Navarro"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                {/* 3. WhatsApp & Edad */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-300">
                      WhatsApp (10 dígitos) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 477 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-300">
                      Edad / Nacimiento
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 19 años o DD/MM/AAAA"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Correo Electrónico */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                {/* 5. Disciplina a Audicionar */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Disciplina a audicionar *
                  </label>
                  <select
                    value={formData.programId}
                    onChange={(e) => {
                      const selected = programOptions.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        programId: e.target.value,
                        programName: selected ? selected.name : "Teatro Musical Integral",
                      });
                    }}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-medium"
                  >
                    {programOptions.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-[#14141C] text-white">
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Turno Preferido */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Turno preferido de audición
                  </label>
                  <select
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-medium"
                  >
                    {scheduleOptions.map((s, idx) => (
                      <option key={idx} value={s} className="bg-[#14141C] text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Experiencia o Comentarios */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Experiencia o comentarios (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Cuéntanos brevemente si has tomado clases previas de canto, danza, teatro o si eres principiante..."
                    value={formData.experienceNotes}
                    onChange={(e) => setFormData({ ...formData, experienceNotes: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Submit button inside chat */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-950/60 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generando tu Folio y Notificación...</span>
                    </>
                  ) : (
                    <span>Enviar Registro de Audición ✨</span>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-32 h-1 bg-zinc-600 rounded-full mx-auto mt-4" />
        </div>

        {/* ================= ACTION PILL BUTTONS BELOW PHONE ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20quiero%20informes%20sobre%20las%20audiciones"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-lg shadow-purple-950/30"
          >
            <span>💬 Escríbenos en WhatsApp</span>
          </a>

          <a
            href="#producciones"
            className="px-8 py-3.5 bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          >
            Ver Obras en Cartelera
          </a>
        </div>

      </div>
    </section>
  );
}
