import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";

export const metadata: Metadata = {
  title: "¡Pago Exitoso! | DV Performing Arts",
  description: "Confirmación de pago de mensualidad o suscripción en DV Performing Arts.",
};

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
    program?: string;
    student?: string;
    amount?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { session_id, program, student, amount } = await searchParams;

  return (
    <div className="flex flex-col min-h-screen bg-[#07070A] text-text-main font-sans selection:bg-accent-red selection:text-text-main relative overflow-x-hidden">
      <TheatricalAuroraBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-16 md:py-24 px-4 sm:px-6 max-w-2xl mx-auto w-full flex flex-col items-center text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-4xl shadow-2xl mb-6 animate-bounce">
          ✓
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase mb-4">
          <span>Pago Procesado Correctamente con Stripe</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
          ¡Gracias por tu Pago!
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 mt-3 leading-relaxed max-w-lg font-normal">
          Tu mensualidad de formación artística ha sido confirmada exitosamente en el sistema de DV Performing Arts.
        </p>

        {/* Receipt Box */}
        <div className="w-full bg-[#101017]/95 border border-[#252535] rounded-3xl p-6 sm:p-8 mt-8 flex flex-col gap-3.5 text-xs text-zinc-300 text-left font-mono shadow-2xl">
          <div className="flex justify-between items-center pb-3 border-b border-[#20202C]">
            <span className="text-zinc-400 uppercase">Concepto:</span>
            <strong className="text-white text-sm">{program || "Mensualidad Académica"}</strong>
          </div>

          {student && (
            <div className="flex justify-between items-center pb-3 border-b border-[#20202C]">
              <span className="text-zinc-400 uppercase">Alumno:</span>
              <strong className="text-white">{student}</strong>
            </div>
          )}

          {amount && (
            <div className="flex justify-between items-center pb-3 border-b border-[#20202C]">
              <span className="text-zinc-400 uppercase">Monto Pagado:</span>
              <strong className="text-emerald-400 font-black text-sm">${amount} MXN</strong>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-zinc-400 uppercase">ID de Transacción:</span>
            <span className="text-purple-300 truncate max-w-[180px] sm:max-w-xs">{session_id || "stripe_tx_completed"}</span>
          </div>
        </div>

        {/* WhatsApp Notice */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 mt-6 text-center max-w-lg">
          📱 Hemos registrado tu pago. Si requieres factura o comprobante impreso, envíanos un mensaje a nuestro WhatsApp oficial: <strong>477 655 8156</strong>.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50"
          >
            Volver al Inicio
          </Link>
          <a
            href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20acabo%20de%20realizar%20mi%20pago%20de%20mensualidad"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#1C1C26] hover:bg-[#252535] text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>💬</span>
            <span>Notificar por WhatsApp</span>
          </a>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
