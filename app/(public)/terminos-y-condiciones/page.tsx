import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";

export const metadata: Metadata = {
  title: "Términos y Condiciones | DV Performing Arts",
  description: "Términos y condiciones de servicio, admisión, audiciones y formación escénica de DV Performing Arts.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#07070A] text-text-main font-sans selection:bg-accent-red selection:text-text-main relative overflow-x-hidden">
      <TheatricalAuroraBackground />
      <SiteHeader />

      <main className="flex-1 relative z-10 py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-mono">
          <Link href="/" className="hover:text-rose-400 transition-colors">
            Inicio
          </Link>
          <span>&rsaquo;</span>
          <span className="text-zinc-300 font-semibold">Términos y Condiciones</span>
        </nav>

        {/* Document Header */}
        <header className="border-b border-[#20202B] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-mono font-bold uppercase mb-3">
            <span>📜 Reglamento & Normatividad</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase leading-tight">
            Términos y Condiciones de Servicio
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-2">
            Vigencia: Ciclo 2026 &bull; DV Performing Arts (León, Guanajuato)
          </p>
        </header>

        {/* Terms Content */}
        <div className="flex flex-col gap-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
          
          {/* Clause 1 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight text-rose-400">
              1. Aceptación de los Términos
            </h2>
            <p>
              El acceso, navegación y uso del portal web de <strong>DV Performing Arts</strong>, así como el llenado de formularios de registro de audición o inscripción a clases, implica la aceptación expresa y total de los presentes Términos y Condiciones por parte del usuario o de su padre/tutor legal en caso de menores de edad.
            </p>
          </section>

          {/* Clause 2 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight text-rose-400">
              2. Proceso de Audiciones y Asignación de Folios
            </h2>
            <p>
              El registro mediante el formulario digital genera un <strong>Folio Único de Audición</strong>. La asignación del folio confirma el turno de atención del aspirante para el proceso de casting de la obra seleccionada. La participación en la audición no garantiza la asignación de un rol protagónico ni la permanencia automática en el elenco final, decisiones que corresponden exclusivamente al criterio técnico y artístico de la Dirección de la Academia.
            </p>
          </section>

          {/* Clause 3 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight text-rose-400">
              3. Disciplina, Puntualidad y Asistencia a Ensayos
            </h2>
            <p>
              El teatro musical y la danza demandan rigor escénico y compromiso colectivo. Los alumnos seleccionados para montajes oficiales se comprometen a:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-1.5 text-zinc-300">
              <li>Asistir puntualmente a ensayos generales, clases de técnica vocal y pasadas coreográficas.</li>
              <li>Portar la vestimenta o calzado de ensayo requerido para cada disciplina (danza urbana, jazz, teatro).</li>
              <li>Mantener un código de respeto y trabajo en equipo con sus compañeros de elenco, docentes y equipo de producción.</li>
            </ul>
          </section>

          {/* Clause 4 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight text-rose-400">
              4. Pagos, Colegiaturas y Reservación de Lugares
            </h2>
            <p>
              Las cuotas de inscripción, talleres intensivos y mensualidades deben cubrirse en las fechas establecidas para garantizar la reserva del lugar en los salones y el acceso a las producciones de temporada. Los detalles de políticas de reembolso o transferencias de saldo son gestionados de forma presencial o vía canal oficial de atención.
            </p>
          </section>

          {/* Clause 5 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight text-rose-400">
              5. Propiedad Intelectual de Obras y Coreografías
            </h2>
            <p>
              Todos los libretos, adaptaciones escénicas, arreglos vocales, coreografías y material audiovisual desarrollado dentro de DV Performing Arts son propiedad intelectual protegida. Queda prohibida su reproducción o explotación comercial externa sin la autorización expresa y por escrito de la Dirección General.
            </p>
          </section>

          {/* Clause 6 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight text-rose-400">
              6. Jurisdicción y Ley Aplicable
            </h2>
            <p>
              Para la interpretación y cumplimiento de estos términos, las partes se someten a las leyes aplicables en el Estado de Guanajuato y a los tribunales competentes de la ciudad de León, Guanajuato, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
            </p>
          </section>

        </div>

        {/* Back Link */}
        <div className="border-t border-[#20202B] mt-12 pt-8 flex justify-between items-center text-xs">
          <Link href="/" className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
            &larr; Volver al Inicio
          </Link>
          <Link href="/aviso-de-privacidad" className="text-zinc-400 hover:text-white">
            Ver Aviso de Privacidad &rarr;
          </Link>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
