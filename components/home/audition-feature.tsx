"use client";

import React, { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/section-heading";
import EditorialLabel from "@/components/ui/editorial-label";
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
    { id: "prog_canto_vocal", name: "Canto & Técnica Vocal (Speech Level Singing)" },
    { id: "prog_danza_urbana", name: "Danza Urbana & Hip Hop" },
    { id: "prog_actuacion_escenica", name: "Actuación & Dirección Escénica" },
  ];

  const scheduleOptions = [
    "Turno Vespertino (Lunes a Viernes 16:00 - 20:00)",
    "Turno Sabatino (Sábados 10:00 - 15:00)",
    "Taller de Alto Rendimiento (Horario Especial)",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Por favor ingresa un número de teléfono / WhatsApp válido (10 dígitos).");
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
        setErrorMessage(data.error || "Ocurrió un error al enviar el formulario.");
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
      setErrorMessage("Error de conexión. Intenta nuevamente o contáctanos por teléfono.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="audiciones" className="relative w-full py-20 px-6 border-b-4 border-border-editorial bg-background-main" aria-labelledby="heading-audiciones">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Title */}
        <SectionHeading
          number="03"
          label="Admisiones Oficiales"
          title="Registro de Audiciones"
        />

        {/* Feature Box with structural red accents */}
        <div className="border-4 border-accent-red bg-[#0A0A0C] p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row gap-10 justify-between items-stretch relative overflow-hidden shadow-2xl">
          
          {/* Signal graphic tag */}
          <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-accent-red text-text-main px-3 py-1 font-mono text-[9px] uppercase tracking-widest font-bold z-10">
            CONVOCATORIA ACTIVA &bull; {activeProduction?.season || "TEMPORADA 2026"}
          </div>

          {/* Left Column: Information & Requirements */}
          <div className="flex-1 flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <EditorialLabel text="Convocatoria Abierta" variant="accent" />
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.2em]">
                  {activeProduction?.auditionDates || "dvperformingarts.com/contacto"}
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tighter text-text-main leading-[0.82]">
                Audiciones: &ldquo;{activeProduction?.title || "Si No Es Ahora"}&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans font-bold uppercase tracking-widest max-w-xl">
                {activeProduction?.synopsis || "Buscamos cantantes, actores y bailarines apasionados para formar parte del elenco y ensamble de nuestras producciones en León, Gto."}
              </p>
            </div>

            {/* Quick checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9px] font-mono uppercase tracking-widest text-text-muted border-t border-b border-border-editorial-light py-6">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 bg-accent-red mt-0.5 shrink-0" />
                <span><strong>Obra:</strong> {activeProduction?.title || "Si No Es Ahora"}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 bg-accent-red mt-0.5 shrink-0" />
                <span><strong>Disciplinas:</strong> Teatro Musical, Canto, Danza Urbana y Actuación</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 bg-accent-red mt-0.5 shrink-0" />
                <span><strong>Sede:</strong> Paseo de los Insurgentes #1506, León, Gto.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 bg-accent-red mt-0.5 shrink-0" />
                <span><strong>WhatsApp:</strong> Notificación con folio y cita automática</span>
              </div>
            </div>

            <div className="font-mono text-[9px] text-text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="text-accent-red font-bold">● ATENCIÓN TELEFÓNICA:</span>
              <span>477 655 8156 | L-V 16:00 - 20:00</span>
            </div>
          </div>

          {/* Right Column: Interactive Registration Form */}
          <div className="w-full lg:w-[480px] bg-[#121215] border-2 border-border-editorial-light p-6 sm:p-8 flex flex-col justify-center relative">
            
            {submittedData ? (
              /* Success / Confirmation Screen */
              <div className="flex flex-col items-center text-center gap-5 animate-fade-in py-4">
                <div className="w-16 h-16 rounded-full bg-accent-red/20 border-2 border-accent-red flex items-center justify-center text-accent-red text-3xl">
                  ✓
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-accent-red uppercase tracking-widest font-bold">
                    ¡REGISTRO COMPLETADO CON ÉXITO!
                  </span>
                  <h4 className="font-display text-2xl font-extrabold uppercase tracking-tight text-text-main">
                    {submittedData.fullName}
                  </h4>
                  <span className="font-mono text-xs text-text-muted">
                    Obra: {submittedData.productionName} &bull; {submittedData.programName}
                  </span>
                </div>

                {/* Folio Highlight Card */}
                <div className="w-full bg-black/60 border-2 border-accent-red p-4 flex flex-col gap-1.5 my-2">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">
                    FOLIO ÚNICO DE AUDICIÓN
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-text-main tracking-widest">
                    {submittedData.folio}
                  </span>
                  <span className="font-mono text-[8px] text-accent-red uppercase">
                    Presenta este código en recepción al acudir a tu cita
                  </span>
                </div>

                <div className="p-3.5 bg-[#0A0A0C] border border-border-editorial text-left w-full flex flex-col gap-1.5 font-sans text-xs text-text-muted">
                  <div className="flex items-center gap-2 text-text-main font-bold font-mono text-[10px] uppercase text-green-400">
                    <span>📱 Confirmación Enviada por WhatsApp</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Hemos enviado los detalles de tu cita y las recomendaciones a tu número <strong>{submittedData.phone}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedData(null)}
                  className="w-full py-3 bg-transparent border-2 border-border-editorial hover:border-accent-red text-text-main font-mono text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
                >
                  Registrar a otro aspirante
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-border-editorial pb-3 mb-1">
                  <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-bold">
                    [ FORMULARIO DE POSTULACIÓN ]
                  </span>
                  <span className="font-mono text-[8px] text-text-muted uppercase">
                    PASO 1 DE 1
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/60 border border-red-500 text-red-200 text-xs font-mono uppercase">
                    {errorMessage}
                  </div>
                )}

                {/* Obra en Convocatoria (Selector Dinámico) */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-accent-red font-bold flex items-center gap-1.5">
                    <span>🎭 Obra / Puesta en Escena *</span>
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
                    className="w-full bg-[#08080A] border-2 border-accent-red/60 px-3 py-2.5 text-xs text-text-main font-bold focus:outline-none focus:border-accent-red transition-colors font-sans cursor-pointer"
                  >
                    {productions.map((prod) => (
                      <option key={prod.id} value={prod.id} className="bg-[#121215] text-text-main font-bold">
                        {prod.title} ({prod.season || "2026"}) {prod.isAuditionActive ? "★ Convocatoria Activa" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre Completo */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold">
                    Nombre Completo del Aspirante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Hernández Navarro"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#08080A] border border-border-editorial px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-accent-red transition-colors font-sans"
                  />
                </div>

                {/* Teléfono WhatsApp & Edad en 2 columnas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold">
                      WhatsApp (10 dígitos) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 4771234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#08080A] border border-border-editorial px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-accent-red transition-colors font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold">
                      Edad o Fecha de Nacimiento
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 19 años o DD/MM/AAAA"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-[#08080A] border border-border-editorial px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-accent-red transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#08080A] border border-border-editorial px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-accent-red transition-colors font-sans"
                  />
                </div>

                {/* Disciplina de Interés */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold">
                    Disciplina a Audicionar *
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
                    className="w-full bg-[#08080A] border border-border-editorial px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-accent-red transition-colors font-sans cursor-pointer"
                  >
                    {programOptions.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-[#121215] text-text-main">
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horario Preferido */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold">
                    Turno Preferido de Audición
                  </label>
                  <select
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    className="w-full bg-[#08080A] border border-border-editorial px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-accent-red transition-colors font-sans cursor-pointer"
                  >
                    {scheduleOptions.map((s, idx) => (
                      <option key={idx} value={s} className="bg-[#121215] text-text-main">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experiencia Previa */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold">
                    Experiencia o Comentarios (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Cuéntanos brevemente si has tomado clases previas o participado en montajes..."
                    value={formData.experienceNotes}
                    onChange={(e) => setFormData({ ...formData, experienceNotes: e.target.value })}
                    className="w-full bg-[#08080A] border border-border-editorial px-3 py-2 text-xs text-text-main focus:outline-none focus:border-accent-red transition-colors font-sans resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 bg-accent-red text-text-main border-2 border-accent-red hover:bg-transparent hover:text-accent-red transition-colors font-sans text-xs uppercase tracking-[0.2em] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-text-main border-t-transparent rounded-full animate-spin" />
                      <span>Procesando Folio y Notificación...</span>
                    </>
                  ) : (
                    <span>Enviar Registro de Audición</span>
                  )}
                </button>

                <span className="font-mono text-[8px] text-text-muted uppercase text-center tracking-wider block mt-1">
                  🔒 Tus datos están protegidos &bull; Confirmación instantánea por WhatsApp
                </span>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
