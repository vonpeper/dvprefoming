"use client";

import React, { useState } from "react";
import { Program } from "@/types/mock";

interface StripeCheckoutModalProps {
  program: Program | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StripeCheckoutModal({
  program,
  isOpen,
  onClose,
}: StripeCheckoutModalProps) {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [paymentType, setPaymentType] = useState<"SUBSCRIPTION" | "REGISTRATION">("SUBSCRIPTION");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !program) return null;

  const price = paymentType === "SUBSCRIPTION" ? program.monthlyPrice || 2400 : program.registrationFee || 500;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg("Por favor ingresa el nombre del alumno.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program.id,
          programName: program.name,
          amountMxn: price,
          studentName,
          studentEmail,
          studentPhone,
          type: paymentType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        // Redirect to Stripe Checkout or Success
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || "No se pudo iniciar la sesión de pago.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión al procesar el pago.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-[#101016] border-2 border-purple-500/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950/80 via-[#151522] to-rose-950/60 p-6 border-b border-[#252535] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                Stripe Payments &bull; DV Performing Arts
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 border border-white/20 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <h3 className="font-display font-bold text-2xl text-white mt-3 uppercase tracking-tight">
            Suscripción & Mensualidad
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Disciplina: <strong className="text-white">{program.name}</strong>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCheckout} className="p-6 flex flex-col gap-5 text-xs">
          
          {/* Payment Type Selection */}
          <div className="grid grid-cols-2 gap-3 bg-[#09090D] p-1.5 rounded-2xl border border-[#20202E]">
            <button
              type="button"
              onClick={() => setPaymentType("SUBSCRIPTION")}
              className={`py-2.5 px-3 rounded-xl font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                paymentType === "SUBSCRIPTION"
                  ? "bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="text-[11px]">Mensualidad Recurrente</span>
              <span className="text-sm font-black">${program.monthlyPrice || 2400} MXN</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentType("REGISTRATION")}
              className={`py-2.5 px-3 rounded-xl font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                paymentType === "REGISTRATION"
                  ? "bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="text-[11px]">Inscripción Única</span>
              <span className="text-sm font-black">${program.registrationFee || 500} MXN</span>
            </button>
          </div>

          {/* Student Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-zinc-300">
              Nombre Completo del Alumno *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sofía Martínez Rodríguez"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="bg-[#09090D] border border-[#252535] focus:border-purple-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder:text-zinc-600"
            />
          </div>

          {/* Email for receipt */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-zinc-300">
              Correo Electrónico (Para envío de recibo Stripe)
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="bg-[#09090D] border border-[#252535] focus:border-purple-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder:text-zinc-600 font-mono"
            />
          </div>

          {/* WhatsApp Mobile */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-zinc-300">
              Teléfono / WhatsApp Móvil
            </label>
            <input
              type="tel"
              placeholder="477 123 4567"
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              className="bg-[#09090D] border border-[#252535] focus:border-purple-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder:text-zinc-600 font-mono"
            />
          </div>

          {/* Security & Supported Badges */}
          <div className="p-3 bg-[#09090D] border border-[#20202E] rounded-xl flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span>🔒</span>
              <span>Cifrado SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-zinc-300">
              <span>Powered by</span>
              <span className="text-purple-400">Stripe</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-[#1A1A24] text-zinc-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase tracking-wider text-xs shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Procesando solicitud...</span>
              ) : (
                <span>Adquirir &bull; ${price} MXN &rarr;</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
