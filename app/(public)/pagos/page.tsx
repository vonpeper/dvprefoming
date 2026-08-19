"use client";

import React, { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";
import { mockPrograms } from "@/data/mock";
import { Program } from "@/types/mock";
import StripeCheckoutModal from "@/components/payments/stripe-checkout-modal";

export default function PaymentsPortalPage() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#07070A] text-text-main font-sans selection:bg-accent-red selection:text-text-main relative overflow-x-hidden">
      <TheatricalAuroraBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-mono">
          <Link href="/" className="hover:text-rose-400 transition-colors">
            Inicio
          </Link>
          <span>&rsaquo;</span>
          <span className="text-zinc-300 font-semibold">Portal de Pagos & Suscripciones</span>
        </nav>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold uppercase mb-4">
            <span>🔒 Pagos Seguros con Stripe</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase leading-tight">
            Mensualidades e Inscripciones
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 mt-3 leading-relaxed">
            Realiza el pago seguro de tu colegiatura mensual o inscripción en línea con tarjeta de débito, crédito o Apple Pay / Google Pay.
          </p>
        </div>

        {/* Programs Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {mockPrograms.map((prog) => {
            const price = prog.monthlyPrice || 2400;

            return (
              <div
                key={prog.id}
                className="bg-[#0D0D12]/95 backdrop-blur-md border-2 border-[#22222E] hover:border-purple-500/70 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-xl transition-all hover:-translate-y-1.5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                      {prog.ageGroup}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold rounded-full">
                      Suscripción Activa
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-white uppercase tracking-tight">
                    {prog.name}
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1 border-b border-[#20202A] pb-4">
                    <span className="text-3xl sm:text-4xl font-black text-white font-display">
                      ${price.toLocaleString("es-MX")}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">MXN / mes</span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {prog.description}
                  </p>

                  {/* Features */}
                  {prog.features && (
                    <ul className="flex flex-col gap-2 text-xs text-zinc-300 mt-2">
                      {prog.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-[#20202A] flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProgram(prog)}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>💳</span>
                    <span>Pagar con Stripe &rarr;</span>
                  </button>
                  <span className="text-[10px] text-zinc-500 text-center font-mono">
                    Cancela o pausa en cualquier momento sin penalizaciones.
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security FAQ Banner */}
        <div className="bg-[#12121A] border border-[#252535] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-4xl sm:text-5xl">🔒</div>
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h4 className="text-base font-bold text-white">
              Pagos 100% Seguros y Cifrados por Stripe
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              DV Performing Arts no almacena los datos de tu tarjeta de crédito o débito. Toda la transacción se procesa directamente a través de la infraestructura bancaria certificada PCI-DSS Nivel 1 de Stripe.
            </p>
          </div>
        </div>

      </main>

      <SiteFooter />

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        program={selectedProgram}
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
      />
    </div>
  );
}
