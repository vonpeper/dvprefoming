import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";

export const metadata: Metadata = {
  title: "Pago no completado | DV Performing Arts",
  description: "El proceso de pago fue cancelado o no se completó.",
};

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#07070A] text-text-main font-sans selection:bg-accent-red selection:text-text-main relative overflow-x-hidden">
      <TheatricalAuroraBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-16 md:py-24 px-4 sm:px-6 max-w-lg mx-auto w-full flex flex-col items-center text-center">
        
        {/* Cancelled Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center text-3xl shadow-xl mb-6">
          !
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
          Proceso de Pago Cancelado
        </h1>

        <p className="text-sm text-zinc-300 mt-3 leading-relaxed font-normal">
          No se realizó ningún cargo a tu tarjeta de crédito o débito. Puedes intentar de nuevo en cualquier momento o comunicarte con nosotros si tienes dudas.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/#programas"
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Intentar de Nuevo
          </Link>
          <a
            href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20tuve%20un%20problema%20al%20intentar%20pagar%20mi%20mensualidad"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#1C1C26] hover:bg-[#252535] text-zinc-300 rounded-xl text-xs font-semibold border border-[#303045] transition-colors"
          >
            Ayuda por WhatsApp
          </a>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
