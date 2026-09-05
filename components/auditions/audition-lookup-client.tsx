"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";
import CelebrationConfetti from "@/components/ui/celebration-confetti";

interface AuditionLookupResult {
  folio: string;
  studentFolio?: string;
  auditionNumber: string | number;
  fullName: string;
  headshotUrl?: string;
  productionName: string;
  programName: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CONFIRMED" | "DRAFT";
  assignedRole?: string;
  overallScore?: number;
  cantoAverage?: number;
  danceAverage?: number;
  actingAverage?: number;
  preferredSchedule: string;
  createdAt: string;
  venue: {
    name: string;
    address: string;
    mapsUrl: string;
  };
  driveMaterialUrl: string;
  tips: string[];
}

function AuditionLookupContent() {
  const searchParams = useSearchParams();
  const initialFolio = searchParams.get("folio") || searchParams.get("q") || "";
  const [query, setQuery] = useState(initialFolio);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditionLookupResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (folioToSearch: string) => {
    if (!folioToSearch.trim()) {
      setErrorMsg("Por favor ingresa tu número de folio o teléfono.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch(`/api/auditions/lookup?folio=${encodeURIComponent(folioToSearch.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.audition) {
        setResult(data.audition);
      } else {
        setErrorMsg(data.error || "No se encontró ningún registro con esos datos. Revisa tu folio e intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión al consultar el folio. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFolio) {
      setQuery(initialFolio);
      handleSearch(initialFolio);
    }
  }, [initialFolio]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const isApproved = result?.status === "APPROVED";
  const isRejected = result?.status === "REJECTED";
  const isPending = !isApproved && !isRejected;

  return (
    <div className="relative min-h-screen bg-[#07070A] text-white flex flex-col font-sans overflow-hidden">
      {/* Theatrical Background */}
      <TheatricalAuroraBackground />

      {/* Trigger celebratory confetti ONLY when approved */}
      {isApproved && <CelebrationConfetti />}

      {/* Navigation Header */}
      <header className="relative z-30 border-b border-[#1F1F2C] bg-[#07070A]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🎭</span>
          <span className="font-display font-black text-sm tracking-wider uppercase bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
            DV Performing Arts
          </span>
        </Link>
        <Link
          href="/#audiciones"
          className="text-xs text-zinc-400 hover:text-white transition-colors font-mono"
        >
          ← Volver a Convocatoria
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-20 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
        
        {/* Page Title Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full">
            Plataforma de Casting &bull; Consulta Oficial
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Consulta de Folio & Estatus de Audición
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
            Ingresa tu número de folio corto (ej. <code className="text-rose-400 font-mono font-bold">DV-585</code> o simplemente <code className="text-rose-400 font-mono font-bold">585</code>) o tu teléfono para consultar tu resultado de casting.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={onSubmit} className="max-w-xl w-full mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ej. DV-585, 585 o 4771234567..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#12121A]/90 border-2 border-[#2A2A3E] focus:border-rose-500 rounded-2xl px-5 py-4 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner font-mono font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <span>🔍 Consultar Estatus</span>
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {errorMsg && (
          <div className="max-w-xl w-full mx-auto p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl text-rose-300 text-xs font-mono flex items-start gap-3 animate-fade-in">
            <span className="text-base">⚠️</span>
            <div className="flex flex-col">
              <span className="font-bold">Registro no encontrado</span>
              <span className="text-zinc-400 mt-0.5">{errorMsg}</span>
            </div>
          </div>
        )}

        {/* ================= RESULTS CARD ================= */}
        {result && (
          <div className="bg-[#0E0E14]/95 backdrop-blur-2xl border-2 border-[#28283C] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative">
            
            {/* ================= STATE 1: APPROVED (CELEBRATORY WITH ANIMATIONS) ================= */}
            {isApproved && (
              <div className="flex flex-col gap-4">
                <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-[#0E0E14] to-emerald-950/80 border-2 border-emerald-400 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xl shadow-emerald-950/60 animate-bounce-short">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl animate-spin-slow">🎉</span>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs uppercase font-black text-emerald-400 tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                        <span className="animate-ping inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />
                        RESULTADO OFICIAL DE CASTING
                      </span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
                        ¡AUDICIÓN APROBADA &bull; SELECCIONADO(A)!
                      </h2>
                    </div>
                  </div>
                  <span className="px-5 py-2 bg-emerald-500 text-white font-mono text-xs uppercase font-black rounded-full shadow-lg shadow-emerald-950/50">
                    Aprobado ✅
                  </span>
                </div>

                {/* Assigned Role / Character Reveal Card */}
                {result.assignedRole && (
                  <div className="p-6 bg-gradient-to-r from-amber-950/60 via-[#161B22] to-amber-950/60 border-2 border-amber-400 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">🎭</span>
                      <div className="flex flex-col text-center sm:text-left">
                        <span className="font-mono text-xs uppercase font-black text-amber-300 tracking-widest">
                          ★ TU PERSONAJE ASIGNADO EN LA OBRA
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">
                          {result.assignedRole}
                        </span>
                      </div>
                    </div>

                    {result.overallScore !== undefined && result.overallScore > 0 && (
                      <div className="bg-black/80 border-2 border-amber-400/70 px-5 py-2.5 rounded-2xl font-mono text-center shrink-0 shadow-lg">
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">Puntaje Jurado</span>
                        <span className="text-lg font-black text-amber-400">{result.overallScore} / 10 ⭐</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= STATE 2: PENDING REVIEW / IN DELIBERATION ================= */}
            {isPending && (
              <div className="p-5 bg-purple-950/40 border-2 border-purple-500/50 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
                <div className="flex items-center gap-4">
                  <span className="text-3xl animate-pulse">⏳</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs uppercase font-bold text-purple-300 tracking-wider">
                      Estatus de Convocatoria
                    </span>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-white mt-0.5">
                      AUDICIÓN EN PROCESO DE EVALUACIÓN & DELIBERACIÓN
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      El panel de jurados (Canto, Coreografía y Actuación) se encuentra evaluando las audiciones. Los resultados finales se publicarán aquí en cuanto concluya el proceso.
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-purple-600 text-white font-mono text-xs uppercase font-bold rounded-full shrink-0">
                  En Proceso
                </span>
              </div>
            )}

            {/* ================= STATE 3: REJECTED (STATIC, NO ANIMATIONS, SOBRIO Y RESPETUOSO) ================= */}
            {isRejected && (
              <div className="p-6 bg-[#14141E] border border-[#30363D] rounded-3xl flex flex-col gap-4 text-left shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🎭</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-400 tracking-wider">
                      Resultado de Casting &bull; Convocatoria Concluida
                    </span>
                    <h2 className="font-display font-black text-xl text-white">
                      Estimadx {result.fullName}, gracias por tu entrega en el escenario.
                    </h2>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                      Agradecemos profundamente tu tiempo, preparación y pasión durante tu audición para la producción de <strong>"{result.productionName}"</strong>.
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      En esta ocasión tu perfil no fue seleccionado para el elenco final de este montaje. La Dirección Artística te felicita por dar el paso y te anima a seguir entrenando tu técnica vocal, dancística y actoral para formar parte de nuestras próximas convocatorias y producciones.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#262638] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">
                    Sigue formándote en DV Performing Arts
                  </span>
                  <Link
                    href="/#talleres"
                    className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-white rounded-xl font-bold transition-colors"
                  >
                    Ver Talleres & Masterclasses ↗
                  </Link>
                </div>
              </div>
            )}

            {/* Candidate & Production Spec Card */}
            <div className="flex flex-col sm:flex-row gap-5 p-5 bg-[#14141E] border border-[#262638] rounded-2xl items-start sm:items-center">
              {/* Candidate Headshot */}
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-purple-500/60 overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
                {result.headshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.headshotUrl} alt={result.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                    👤 Aspirante Registrado:
                  </span>
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{result.fullName}</span>
                    {result.studentFolio && (
                      <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-bold">
                        🎓 {result.studentFolio}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                    📋 Folio & Número de Audición:
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    #{result.auditionNumber} <span className="text-xs text-zinc-400">({result.folio})</span>
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                    🎭 Obra / Montaje:
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {result.productionName}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                    🎓 Disciplina / Turno:
                  </span>
                  <span className="text-sm font-semibold text-zinc-300">
                    {result.programName} &bull; {result.preferredSchedule}
                  </span>
                </div>
              </div>
            </div>

            {/* Venue & Location */}
            <div className="p-5 bg-[#101018] border border-[#2B2B3E] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🏛️</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-purple-300 font-bold tracking-wider">
                    Recinto Oficial de la Academia
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5">
                    {result.venue.name}
                  </span>
                  <span className="text-xs text-zinc-400 mt-0.5">
                    {result.venue.address}
                  </span>
                </div>
              </div>

              {result.venue.mapsUrl && (
                <a
                  href={result.venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1A1A28] hover:bg-[#252538] text-rose-300 border border-rose-500/30 rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>📍 Ver en Google Maps ↗</span>
                </a>
              )}
            </div>

            {/* Call to Actions for Approved */}
            {isApproved && (
              <div className="p-6 bg-gradient-to-r from-purple-950/60 to-rose-950/60 border-2 border-purple-500/60 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col text-center sm:text-left">
                  <span className="font-bold text-sm text-white">
                    📖 Material, Libreto y Partituras Oficiales
                  </span>
                  <span className="text-xs text-zinc-300 mt-0.5">
                    Descarga el material para tu primera lectura de libreto en el Google Drive de la producción.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href={result.driveMaterialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50"
                  >
                    📁 Abrir Google Drive ↗
                  </a>

                  <a
                    href={`https://wa.me/524776558156?text=${encodeURIComponent(`Hola DV Performing Arts, consulto mi resultado de audición para ${result.productionName} (Folio: ${result.folio}) y confirmo mi participación para el personaje de ${result.assignedRole || "elenco"}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>💬 Confirmar por WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Director's Signature */}
            <div className="pt-4 border-t border-[#262638] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400 italic">Dirección Artística:</span>
                <span className="font-display font-bold text-sm text-white">Diego Vieyra</span>
                <span className="text-[11px] text-rose-400 font-mono">DV Performing Arts &bull; León, Gto.</span>
              </div>

              <span className="text-[10px] font-mono text-zinc-500">
                Registro emitido el {new Date(result.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default function AuditionLookupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070A] flex items-center justify-center text-white font-mono text-xs">Cargando plataforma de consulta...</div>}>
      <AuditionLookupContent />
    </Suspense>
  );
}
