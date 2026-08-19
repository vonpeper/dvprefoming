"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";

interface AuditionLookupResult {
  folio: string;
  auditionNumber: string | number;
  fullName: string;
  productionName: string;
  programName: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CONFIRMED" | "DRAFT";
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
        setErrorMsg(data.error || "No se encontró ningún registro con ese folio. Verifica los datos.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión al consultar el estado de la audición.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFolio) {
      handleSearch(initialFolio);
    }
  }, [initialFolio]);

  return (
    <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center">
      <TheatricalAuroraBackground />

      <div className="relative z-10 max-w-2xl w-full flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-rose-400 font-bold bg-rose-950/40 border border-rose-500/40 px-3.5 py-1 rounded-full">
            ★ PORTAL DE ASPIRANTES &bull; SEGUIMIENTO DE AUDICIÓN
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
            Consulta el Estado de tu Audición
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg font-sans">
            Ingresa tu <strong>Número de Folio</strong> (asignado en tu registro o correo) para ver tu estatus oficial, material de casting en Google Drive y detalles del recinto.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="bg-[#0E0E14]/90 backdrop-blur-xl border-2 border-[#20202E] rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej. 585 o AUD-2026-DV-0042 o tu correo/teléfono..."
              className="w-full bg-[#07070A] border border-[#2B2B3E] focus:border-rose-500 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <span className="animate-pulse">Consultando...</span>
            ) : (
              <>
                <span>🔍</span>
                <span>Consultar Folio</span>
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl text-rose-300 text-xs font-mono flex items-start gap-3 animate-fade-in">
            <span className="text-base">⚠️</span>
            <div className="flex flex-col">
              <span className="font-bold">Registro no encontrado</span>
              <span className="text-zinc-400 mt-0.5">{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Results Card */}
        {result && (
          <div className="bg-[#0E0E14]/95 backdrop-blur-2xl border-2 border-[#28283C] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-fade-in relative">
            
            {/* Status Header Banner */}
            {result.status === "APPROVED" ? (
              <div className="p-4 bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg shadow-emerald-950/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎉</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Estatus Oficial del Casting
                    </span>
                    <span className="font-display font-black text-lg text-white">
                      ¡AUDICIÓN APROBADA / SELECCIONADO(A)!
                    </span>
                  </div>
                </div>
                <span className="px-3.5 py-1 bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold rounded-full">
                  Aprobado ✅
                </span>
              </div>
            ) : (
              <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                      Estatus de Convocatoria
                    </span>
                    <span className="font-display font-bold text-base text-white">
                      REGISTRO ACTIVO &bull; EN REVISIÓN / CITATORIO
                    </span>
                  </div>
                </div>
                <span className="px-3.5 py-1 bg-purple-600 text-white font-mono text-[10px] uppercase font-bold rounded-full">
                  En Proceso
                </span>
              </div>
            )}

            {/* Candidate & Production Spec Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-[#14141E] border border-[#262638] rounded-2xl">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                  👤 Aspirante Registrado:
                </span>
                <span className="text-sm font-bold text-white">
                  {result.fullName}
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

            {/* Venue & Google Maps Location */}
            <div className="p-4 sm:p-5 bg-[#101018] border border-[#2B2B3E] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🏛️</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-purple-300 font-bold tracking-wider">
                    Recinto Oficial de Audición
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
                  className="w-full sm:w-auto px-4 py-2 bg-[#20202E] hover:bg-[#2B2B3E] text-zinc-200 hover:text-white border border-[#3A3A50] rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 shadow"
                >
                  <span>📍</span>
                  <span>Abrir Google Maps</span>
                  <span>↗</span>
                </a>
              )}
            </div>

            {/* Drive Download CTA */}
            <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-[#1A0E2A] to-[#12081C] border-2 border-purple-500/50 rounded-2xl gap-3">
              <span className="text-xs font-mono uppercase text-purple-300 font-bold tracking-wider">
                📂 Material de Estudio, Libretos y Pistas
              </span>
              <p className="text-xs text-zinc-300 max-w-md font-sans">
                Descarga las pistas musicales, escenas de casting y referencias coreográficas preparadas por el equipo de dirección:
              </p>
              <a
                href={result.driveMaterialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-rose-950/50 flex items-center gap-2"
              >
                <span>📁</span>
                <span>Descargar Material en Google Drive ↗</span>
              </a>
            </div>

            {/* Tips for Audition Day */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-rose-400 font-bold tracking-wider">
                💡 Consejos Clave para tu Audición:
              </span>
              <ul className="flex flex-col gap-2 text-xs text-zinc-300 font-sans pl-1">
                {result.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp Support Button */}
            <div className="pt-4 border-t border-[#20202E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <span>¿Necesitas reagendar o tienes dudas sobre tu casting?</span>
              <a
                href={`https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20tengo%20una%20duda%20sobre%20mi%20audici%C3%B3n%20(Folio:%20${result.folio})`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                <span>💬</span>
                <span>WhatsApp de Atención: 477 655 8156</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}

export default function AuditionLookupClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070A] flex items-center justify-center text-white">Cargando datos de audición...</div>}>
      <AuditionLookupContent />
    </Suspense>
  );
}
