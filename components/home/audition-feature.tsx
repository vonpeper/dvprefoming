"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Production } from "@/types/mock";

export default function AuditionFeature() {
  const router = useRouter();
  const [quickFolioInput, setQuickFolioInput] = useState("");
  const [productions, setProductions] = useState<Production[]>([]);
  const [activeProduction, setActiveProduction] = useState<Production | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    birthDate: "",
    headshotUrl: "",
    productionId: "prod_si_no_es_ahora",
    productionName: "Si No Es Ahora (El Musical)",
    googleDriveUrl: "",
    programId: "prog_teatro_musical",
    programName: "Teatro Musical Integral (Canto, Danza & Actuación)",
    preferredSchedule: "Turno Vespertino (Lunes a Viernes 16:00 - 20:00)",
    experienceNotes: "",
  });

  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    folio: string;
    fullName: string;
    productionName: string;
    programName: string;
    phone: string;
    preferredSchedule: string;
    headshotUrl?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Helper to verify whether an audition call is temporal / valid
  const isAuditionValid = (p: Production) => {
    if (p.isAuditionActive === false) return false;
    if (p.productionStatus === "ARCHIVED") return false;
    if (p.auditionDeadline) {
      const deadline = new Date(p.auditionDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) return false; // Expired
    }
    return true;
  };

  useEffect(() => {
    fetch("/api/productions")
      .then((res) => res.json())
      .then((data) => {
        if (data?.productions && data.productions.length > 0) {
          const allProds: Production[] = data.productions;
          // Filter productions whose deadline has not expired and have active auditions
          const validProds = allProds.filter(isAuditionValid);
          const listToUse = validProds.length > 0 ? validProds : allProds;

          setProductions(listToUse);

          const defaultActive = listToUse.find((p) => p.isAuditionActive) || listToUse[0];
          setActiveProduction(defaultActive);

          if (defaultActive) {
            setFormData((prev) => ({
              ...prev,
              productionId: defaultActive.id,
              productionName: defaultActive.title,
              googleDriveUrl: defaultActive.driveFolderUrl || "",
            }));
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.success && data.file?.url) {
        setFormData((prev) => ({ ...prev, headshotUrl: data.file.url }));
      } else {
        alert(data.error || "No se pudo subir la foto.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir la fotografía.");
    } finally {
      setUploadingPhoto(false);
    }
  };

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
        headshotUrl: data.audition.headshotUrl || formData.headshotUrl,
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        age: "",
        birthDate: "",
        headshotUrl: "",
        productionId: activeProduction ? activeProduction.id : "prod_si_no_es_ahora",
        productionName: activeProduction ? activeProduction.title : "Si No Es Ahora (El Musical)",
        googleDriveUrl: activeProduction ? activeProduction.driveFolderUrl || "" : "",
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

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickFolioInput.trim()) return;
    const clean = quickFolioInput.trim().toUpperCase();
    router.push(`/audiciones/consulta?folio=${encodeURIComponent(clean)}`);
  };

  return (
    <section id="audiciones" className="relative w-full py-20 px-4 sm:px-6 border-b-4 border-border-editorial" aria-labelledby="heading-audiciones">
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        
        {/* ================= URBAN STREET DANCE BRUSH GRAFFITI HEADER ================= */}
        <div className="flex flex-col items-center text-center mb-8 relative select-none">
          
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

        {/* ================= CONSULTA DE RESULTADOS DIRECTA CON FOLIO / ID ================= */}
        <div className="w-full max-w-xl bg-gradient-to-r from-purple-950/80 via-[#151522] to-rose-950/80 border-2 border-purple-500/60 rounded-3xl p-5 sm:p-6 mb-12 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🔍</span>
              <div>
                <h3 className="text-base font-black text-white">¿Ya realizaste tu audición?</h3>
                <p className="text-xs text-zinc-300">Ingresa tu Folio o ID para ver tu resultado, estatus y rol asignado.</p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              ● Consulta en Vivo
            </span>
          </div>

          <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row gap-2 mt-1">
            <input
              type="text"
              placeholder="Ej. DV-585, DV-501 o tu teléfono..."
              value={quickFolioInput}
              onChange={(e) => setQuickFolioInput(e.target.value)}
              className="flex-1 bg-black/60 border border-purple-500/50 focus:border-purple-400 rounded-2xl px-4 py-3 text-sm text-white font-mono font-bold placeholder-zinc-500 focus:outline-none uppercase"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Consultar Estatus</span>
              <span>→</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>¿No recuerdas tu folio? Busca con tu WhatsApp.</span>
            <Link href="/audiciones/consulta" className="text-purple-400 hover:underline">
              Ir a portal de consulta ↗
            </Link>
          </div>
        </div>

        {/* ================= SMARTPHONE CHAT & REGISTRATION SIMULATION ================= */}
        <div className="w-full max-w-[490px] bg-[#111118] border-4 border-[#28283C] rounded-[3.2rem] shadow-[0_30px_90px_rgba(0,0,0,0.9)] p-3 sm:p-4 relative overflow-hidden ring-1 ring-white/10">
          
          {/* Speaker / Dynamic Island Top Bar */}
          <div className="w-28 h-4 bg-black rounded-full mx-auto mb-3 border border-white/10 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20202A]" />
          </div>

          {/* Clean White Phone Screen Body */}
          <div className="bg-[#F2F4F7] rounded-[2.5rem] p-4 sm:p-5 flex flex-col gap-3.5 border border-slate-300 shadow-inner">
            
            {/* Phone Top Header (Clean Light Theme) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/80 px-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                  🎭
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-slate-900 font-display">DV Performing Arts</span>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    En línea &bull; Registro Oficial
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold">León, GTO</span>
            </div>

            {/* Incoming Message 1 (Dynamic Greeting synced with selected production - Pure White) */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl rounded-tl-sm p-4 sm:p-5 text-xs text-slate-700 leading-relaxed shadow-md text-left">
              <p className="font-semibold text-slate-800">
                ¡Hola! 🎭 Queremos conocer tu talento. Completa tu ficha de registro para asignarte tu folio oficial y cita de audición:
              </p>
              
              {/* Dynamic Active Production Banner that reacts to dropdown selection (Pure Crisp White / Soft Slate) */}
              {activeProduction ? (
                <div className="mt-3 p-3.5 bg-[#F8F9FA] rounded-xl border-2 border-purple-200 flex flex-col gap-1.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-purple-800 font-bold flex items-center gap-1.5 text-[11px]">
                      <span>🎬 Convocatoria Activa:</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      ● Abierta
                    </span>
                  </div>
                  <span className="text-slate-900 font-black text-sm tracking-tight">{activeProduction.title}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono pt-1.5 border-t border-slate-200">
                    <span className="font-medium">{activeProduction.auditionDates || activeProduction.season || "Temporada 2026"}</span>
                    {activeProduction.auditionDeadline && (
                      <span className="text-purple-700 font-bold">Cierre: {activeProduction.auditionDeadline}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-semibold">
                  ★ Convocatoria General para Próximos Montajes
                </div>
              )}
            </div>

            {submittedData ? (
              /* Success / WhatsApp-style Confirmation Screen (Clean White Card) */
              <div className="flex flex-col gap-3 animate-fade-in my-auto py-2">
                {/* Outgoing Message from User */}
                <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm p-3.5 text-xs self-end max-w-[85%] text-left shadow-md font-medium">
                  ✓ Envié mi registro de audición para <strong>{submittedData.productionName}</strong>.
                </div>

                {/* Incoming Message: Official Ticket & WhatsApp Dispatch (Crisp White Form Container) */}
                <div className="bg-white border-2 border-emerald-300 rounded-3xl rounded-tl-sm p-5 sm:p-6 text-xs text-slate-800 text-left flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-sm">✓</span>
                    <span>¡Tu registro ha sido exitoso!</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    ¡Felicidades, <strong className="text-slate-900 font-bold">{submittedData.fullName}</strong>! Tu postulación ha quedado registrada en la base de datos oficial de DV Performing Arts.
                  </p>

                  {/* Folio Highlight Box in Light Theme */}
                  <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-50 border-2 border-purple-300 rounded-2xl p-4 sm:p-5 text-center flex flex-col gap-1.5 shadow-md">
                    <span className="text-[11px] text-purple-900 font-mono uppercase font-bold tracking-wider">Tu Folio Único Oficial:</span>
                    <span className="font-mono text-3xl font-black text-purple-700 tracking-widest">{submittedData.folio}</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">Presenta este código al llegar a recepción</span>
                  </div>

                  <div className="text-[11px] text-slate-700 leading-relaxed border-t border-slate-200 pt-3 flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    <span>Hemos enviado tu número de audición, material en Google Drive y recomendaciones a tu correo y WhatsApp <strong className="text-slate-900">{submittedData.phone}</strong>.</span>
                  </div>

                  <a
                    href={`/audiciones/consulta?folio=${submittedData.folio}`}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>🔍</span>
                    <span>Ver Ficha y Material de Audición ↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Registrar a otro aspirante &rarr;
                  </button>
                </div>
              </div>
            ) : (
              /* Full Audition Registration Form (Crisp Clean White Container) */
              <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs font-semibold">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Hidden native camera/file input */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />

                {/* 1. Obra en Convocatoria (Selector reactivo) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-purple-900 flex justify-between items-center">
                    <span>Obra / Puesta en Escena *</span>
                    <span className="text-[10px] text-purple-600 font-mono font-medium">Convocatorias vigentes</span>
                  </label>
                  <select
                    value={formData.productionId}
                    onChange={(e) => {
                      const selected = productions.find((p) => p.id === e.target.value) || null;
                      setActiveProduction(selected);
                      setFormData((prev) => ({
                        ...prev,
                        productionId: e.target.value,
                        productionName: selected ? selected.title : "Convocatoria General",
                        googleDriveUrl: selected ? selected.driveFolderUrl || "" : "",
                      }));
                    }}
                    className="w-full bg-[#F8F9FA] border-2 border-purple-200 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none cursor-pointer shadow-sm transition-all"
                  >
                    {productions.map((prod) => (
                      <option key={prod.id} value={prod.id} className="bg-white text-slate-900">
                        {prod.title} ({prod.season || "2026"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Fotografía / Headshot del Aspirante (Móvil / Cámara) */}
                <div className="p-3.5 bg-[#F8F9FA] border-2 border-dashed border-purple-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 border-2 border-purple-300 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                      {formData.headshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.headshotUrl} alt="Foto aspirante" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📸</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900">Foto o Selfie para Casting</span>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        {formData.headshotUrl ? "✓ Fotografía cargada con éxito" : "Tómate una foto o sube tu retrato desde tu celular"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {uploadingPhoto ? (
                      <span className="animate-pulse">Subiendo...</span>
                    ) : (
                      <>
                        <span>{formData.headshotUrl ? "Cambiar" : "Tomar Foto"}</span>
                        <span>📷</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Nombre Completo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Nombre completo del aspirante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Hernández Navarro"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-slate-300 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* 3. Teléfono / WhatsApp (10 dígitos) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Teléfono / WhatsApp (10 dígitos) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#EEF2F6] border border-slate-300 px-3 py-2.5 rounded-xl text-slate-700 font-mono text-xs font-bold">
                      🇲🇽 +52
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={14}
                      placeholder="477 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 bg-[#F8F9FA] border border-slate-300 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 4. Correo Electrónico */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="aspirante@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-slate-300 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* 5. Taller / Disciplina Principal */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Taller o Disciplina de Interés *
                  </label>
                  <select
                    value={formData.programId}
                    onChange={(e) => {
                      const selectedProg = programOptions.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        programId: e.target.value,
                        programName: selectedProg ? selectedProg.name : "Teatro Musical Integral",
                      });
                    }}
                    className="w-full bg-[#F8F9FA] border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none cursor-pointer transition-all"
                  >
                    {programOptions.map((prog) => (
                      <option key={prog.id} value={prog.id} className="bg-white text-slate-900">
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Horario Preferido */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Disponibilidad de Horario *
                  </label>
                  <select
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none cursor-pointer transition-all"
                  >
                    {scheduleOptions.map((sch, sIdx) => (
                      <option key={sIdx} value={sch} className="bg-white text-slate-900">
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Experiencia previa (opcional) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Experiencia previa o notas (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. 2 años en danza urbana, estudios de canto..."
                    value={formData.experienceNotes}
                    onChange={(e) => setFormData({ ...formData, experienceNotes: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-slate-300 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none resize-none transition-all"
                  />
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:to-fuchsia-500 text-white font-black uppercase tracking-wider text-xs shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? (
                    <span>Generando Folio Oficial...</span>
                  ) : (
                    <>
                      <span>★</span>
                      <span>Registrar Mi Audición &rarr;</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Phone Bottom Home Bar */}
          <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-3" />

        </div>

        {/* WhatsApp Direct Help & Audition Lookup Link */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-zinc-400">
          <a
            href="/audiciones/consulta"
            className="px-4 py-2 bg-[#161622] hover:bg-[#202030] text-rose-300 hover:text-white border border-rose-500/30 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🔍</span>
            <span>¿Ya te registraste? Consulta el estado de tu folio aquí</span>
            <span>&rarr;</span>
          </a>

          <span>
            ¿Dudas sobre el casting?{" "}
            <a
              href="https://wa.me/524776558156?text=Hola,%20tengo%20dudas%20sobre%20las%20audiciones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 inline-flex items-center gap-1"
            >
              <span>WhatsApp: 477 655 8156 &rarr;</span>
            </a>
          </span>
        </div>

      </div>
    </section>
  );
}
