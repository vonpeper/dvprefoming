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
    { id: "prog_teatro_musical", name: "Teatro Musical Integral" },
    { id: "prog_danza_urbana", name: "Danza Urbana & Hip Hop" },
    { id: "prog_canto_vocal", name: "Canto & Técnica Vocal" },
    { id: "prog_actuacion_escenica", name: "Actuación Escénica" },
  ];

  const scheduleOptions = [
    "Turno Vespertino (16:00 - 20:00)",
    "Turno Sabatino (10:00 - 15:00)",
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
      setErrorMessage("Error de conexión. Puedes escribirnos por WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="audiciones" className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-audiciones">
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        
        {/* ================= URBAN STREET DANCE BRUSH HEADER ================= */}
        <div className="flex flex-col items-center text-center mb-12 relative select-none">
          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-600/15 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-300 mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span className="tracking-wide uppercase text-[11px]">CONVOCATORIA DE TALENTO &bull; TEMPORADA 2026</span>
          </div>

          {/* Urban Brush Title with Drips & Paint Splatters (Reference Style) */}
          <div className="relative inline-block my-3 px-8 py-3">
            {/* Background Energetic Purple/Magenta Street Brush Stroke with Dynamic Skew */}
            <div className="absolute inset-0 -inset-x-6 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-600 rounded-3xl transform -rotate-1 skew-x-[-5deg] opacity-95 shadow-[0_12px_35px_rgba(168,85,247,0.4)] -z-10" />
            
            {/* Paint Drips Hanging Down */}
            <div className="absolute -bottom-6 left-12 w-1.5 h-7 bg-white rounded-full opacity-90 shadow-sm" />
            <div className="absolute -bottom-9 left-20 w-1 h-9 bg-white rounded-full opacity-80" />
            <div className="absolute -bottom-5 right-14 w-1.5 h-6 bg-white rounded-full opacity-85" />
            <div className="absolute -bottom-8 right-28 w-1 h-8 bg-white rounded-full opacity-75" />
            
            {/* Paint Splatter Dots */}
            <span className="absolute -top-3 right-8 w-2 h-2 rounded-full bg-white opacity-85 shadow" />
            <span className="absolute -bottom-3 left-8 w-1.5 h-1.5 rounded-full bg-white opacity-75" />
            <span className="absolute top-2 -left-4 w-2 h-2 rounded-full bg-purple-300 opacity-90" />
            <span className="absolute -top-2 -right-3 w-2.5 h-2.5 rounded-full bg-fuchsia-300 opacity-90" />

            {/* Spray Halo ring above title */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-3.5 border-2 border-white/90 rounded-full transform -rotate-6 shadow-sm pointer-events-none" />

            {/* The Main Urban Brush Title */}
            <h2
              className="font-urban-brush text-white tracking-wider uppercase leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] transform -rotate-[1deg]"
              style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
            >
              AUDICIONES
            </h2>
          </div>

          <p className="text-zinc-300 text-sm sm:text-base text-center max-w-xl mt-5 font-normal leading-relaxed">
            Inicia tu registro oficial para formar parte de nuestras producciones en León, Gto. Te asignamos tu folio y confirmamos tu cita al instante por WhatsApp.
          </p>
        </div>

        {/* ================= SMARTPHONE CHAT & REGISTRATION SIMULATION ================= */}
        <div className="w-full max-w-[460px] bg-[#121218]/90 backdrop-blur-xl border-4 border-[#252532] rounded-[2.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-4 sm:p-6 relative overflow-hidden ring-1 ring-white/10">
          
          {/* Speaker / Camera Notch */}
          <div className="w-28 h-4 bg-black/80 rounded-full mx-auto mb-4 border border-white/5 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20202A]" />
          </div>

          {/* Chat Header inside Phone */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252532] px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-lg font-bold shadow-inner">
                🎭
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white font-display">DV Performing Arts</span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  En línea &bull; Audiciones 2026
                </span>
              </div>
            </div>
            <span className="text-xs text-zinc-500 font-mono">León, GTO</span>
          </div>

          {/* Interactive Phone Content */}
          <div className="flex flex-col gap-3 min-h-[380px]">
            
            {/* Incoming Message 1 (Greeting) */}
            <div className="bg-[#1C1C26] border border-[#2B2B3A] rounded-2xl rounded-tl-sm p-4 text-xs text-zinc-200 leading-relaxed shadow-sm text-left">
              <p>
                ¡Hola! 🎭 Queremos conocer tu talento. Regístrate para audicionar para el elenco de nuestra próxima puesta en escena:
              </p>
              <div className="mt-2 p-2 bg-black/40 rounded-xl border border-rose-500/30 flex items-center gap-2">
                <span className="text-rose-400 font-bold">🎬 Obra Activa:</span>
                <span className="text-white font-semibold">{activeProduction?.title || "Si No Es Ahora (El Musical)"}</span>
              </div>
            </div>

            {submittedData ? (
              /* Success / WhatsApp-style Confirmation Screen */
              <div className="flex flex-col gap-3 animate-fade-in my-auto py-2">
                {/* Outgoing Message: User Confirmation */}
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl rounded-tr-sm p-3.5 text-xs text-rose-200 self-end max-w-[85%] text-left shadow-sm">
                  ✓ Envié mi registro de audición para <strong>{submittedData.productionName}</strong>.
                </div>

                {/* Incoming Message: Official Ticket & WhatsApp Dispatch */}
                <div className="bg-[#1C1C26] border border-[#2B2B3A] rounded-2xl rounded-tl-sm p-5 text-xs text-zinc-200 text-left flex flex-col gap-3 shadow-md">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</span>
                    <span>¡Tu registro ha sido exitoso!</span>
                  </div>

                  <p className="text-zinc-300 leading-relaxed">
                    ¡Felicidades, <strong>{submittedData.fullName}</strong>! Tu postulación ha quedado registrada con éxito.
                  </p>

                  {/* Folio Highlight Inside Phone */}
                  <div className="bg-black/60 border border-rose-500/50 rounded-xl p-3.5 text-center flex flex-col gap-1 my-1">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Tu Folio Oficial de Audición:</span>
                    <span className="font-mono text-xl font-black text-rose-400 tracking-widest">{submittedData.folio}</span>
                    <span className="text-[9px] text-zinc-400">Presenta este código al acudir a la academia</span>
                  </div>

                  <div className="text-[11px] text-zinc-300 leading-relaxed border-t border-[#2B2B3A] pt-2 flex items-center gap-2">
                    <span>📱</span>
                    <span>Hemos enviado los detalles y recomendaciones a tu WhatsApp <strong>{submittedData.phone}</strong>.</span>
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
              /* Interactive Form Card Inside Phone */
              <form onSubmit={handleSubmit} className="bg-[#161620] border border-[#2B2B3A] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-left shadow-inner">
                {errorMessage && (
                  <div className="p-2.5 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Obra */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-rose-300">
                    Obra / Convocatoria *
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
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {productions.map((prod) => (
                      <option key={prod.id} value={prod.id} className="bg-[#14141C] text-white">
                        {prod.title} ({prod.season || "2026"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Hernández"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                {/* WhatsApp & Edad */}
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
                      className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-300">
                      Edad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 19 años"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Disciplina */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
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
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {programOptions.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-[#14141C] text-white">
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Turno */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Turno preferido
                  </label>
                  <select
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3C] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {scheduleOptions.map((s, idx) => (
                      <option key={idx} value={s} className="bg-[#14141C] text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit button inside chat */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-950/50 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generando tu Folio...</span>
                    </>
                  ) : (
                    <span>Confirmar Registro de Audición ✨</span>
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
            className="px-8 py-3.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-lg shadow-rose-950/30"
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
