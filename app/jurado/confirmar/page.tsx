"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function JurorConfirmationContent() {
  const searchParams = useSearchParams();
  const jurorId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [juror, setJuror] = useState<{
    id: string;
    fullName: string;
    title?: string;
    assignedDiscipline: string;
    attendanceStatus: string;
    phone?: string;
  } | null>(null);

  const [production, setProduction] = useState<{
    title: string;
    auditionDates?: string;
    venueName?: string;
    venueAddress?: string;
  } | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jurorId) {
      setLoading(false);
      setError("Enlace de confirmación incompleto. Falta el identificador del jurado.");
      return;
    }

    Promise.all([
      fetch(`/api/jurado/confirm?id=${jurorId}`).then((r) => r.json()),
      fetch("/api/productions").then((r) => r.json()),
    ])
      .then(([jurorData, prodData]) => {
        if (jurorData.success && jurorData.user) {
          setJuror(jurorData.user);
          if (jurorData.user.attendanceStatus === "CONFIRMED") {
            setConfirmed(true);
          }
        } else {
          setError(jurorData.error || "No se encontró el registro del jurado.");
        }

        if (prodData.productions && prodData.productions.length > 0) {
          const active = prodData.productions.find((p: any) => p.isAuditionActive) || prodData.productions[0];
          setProduction(active);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Error de conexión al cargar la invitación.");
      })
      .finally(() => setLoading(false));
  }, [jurorId]);

  const handleConfirm = async () => {
    if (!jurorId) return;
    setConfirming(true);
    setError("");

    try {
      const res = await fetch("/api/jurado/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jurorId, status: "CONFIRMED" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmed(true);
      } else {
        setError(data.error || "No se pudo registrar la confirmación.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al confirmar asistencia.");
    } finally {
      setConfirming(false);
    }
  };

  const disciplineLabels: Record<string, string> = {
    CANTO: "Canto & Técnica Vocal",
    COREOGRAFIA: "Danza, Coreografía & Expresión Corporal",
    ACTUACION: "Actuación & Texto Teatral",
    ALL: "Evaluación Integral (Dirección General)",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070A] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Cargando convocatoria de jurado...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-[#0E0E14] border border-[#262638] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 border-b border-[#262638] pb-6">
          <span className="text-xs font-mono font-bold tracking-widest text-purple-400 bg-purple-950/80 border border-purple-500/40 px-3 py-1 rounded-full uppercase">
            ★ PANEL DE JURADOS OFICIAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            DV PERFORMING ARTS
          </h1>
          <p className="text-xs text-slate-400">
            Convocatoria y Confirmación de Asistencia de Jueces
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-300 text-xs text-center flex flex-col gap-3">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
            <Link
              href="/jurado"
              className="mt-2 text-white bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl text-xs font-bold self-center transition-all"
            >
              Ir al Portal de Jueces &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Juror Info Box */}
            <div className="bg-[#141420] border border-[#303048] rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Docente Designado:
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-rose-600 flex items-center justify-center text-xl font-bold">
                  🎭
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{juror?.fullName}</h3>
                  <p className="text-xs text-purple-300 font-medium">{juror?.title || "Docente Titular"}</p>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-[#262638] flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Disciplina a Evaluar:</span>
                  <span className="font-bold text-amber-300 font-mono bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                    {disciplineLabels[juror?.assignedDiscipline || "CANTO"]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Producción:</span>
                  <span className="font-bold text-white">{production?.title || "Convocatoria 2026"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sede:</span>
                  <span className="text-slate-200">{production?.venueAddress || "Paseo de los Insurgentes #1506, León, Gto."}</span>
                </div>
              </div>
            </div>

            {/* Status & CTA */}
            {confirmed ? (
              <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-6 text-center flex flex-col items-center gap-3 animate-fade-in">
                <span className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center font-bold border border-emerald-500/40">
                  ✓
                </span>
                <h3 className="text-lg font-black text-emerald-300">
                  ¡Asistencia Confirmada!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                  Gracias, maestro(a). Tu confirmación ha quedado registrada en la Dirección General. Puedes ingresar directamente al sistema de calificación con tu número de WhatsApp y contraseña.
                </p>

                <Link
                  href="/jurado"
                  className="mt-3 w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-950/50 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Entrar al Portal de Calificaciones</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-300 text-center leading-relaxed">
                  Al confirmar tu asistencia, el sistema habilitará tus cédulas de evaluación y te asignará el turno de calificación para los aspirantes.
                </p>

                <button
                  type="button"
                  disabled={confirming}
                  onClick={handleConfirm}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-rose-600 to-purple-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {confirming ? (
                    <span>Registrando Confirmación...</span>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Confirmar mi Asistencia como Jurado</span>
                    </>
                  )}
                </button>

                <div className="text-center mt-2">
                  <Link href="/jurado" className="text-xs text-slate-400 hover:text-slate-200 underline">
                    ¿Ya habías confirmado? Entrar directamente al portal &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-[10px] font-mono text-slate-500 border-t border-[#262638] pt-4">
          DV Performing Arts &bull; Sistema de Casting & Jurados &bull; León, GTO.
        </div>
      </div>
    </div>
  );
}

export default function JurorConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JurorConfirmationContent />
    </Suspense>
  );
}
