import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | DV Performing Arts",
  description: "Aviso de privacidad integral para alumnos, aspirantes y usuarios de la academia de teatro musical DV Performing Arts.",
};

export default function PrivacyPolicyPage() {
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
          <span className="text-zinc-300 font-semibold">Aviso de Privacidad</span>
        </nav>

        {/* Document Header */}
        <header className="border-b border-[#20202B] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-mono font-bold uppercase mb-3">
            <span>🛡️ Legal & Protección de Datos</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase leading-tight">
            Aviso de Privacidad Integral
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-2">
            Última actualización: Enero 2026 &bull; DV Performing Arts (León, Guanajuato)
          </p>
        </header>

        {/* Policy Content */}
        <div className="flex flex-col gap-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight flex items-center gap-2 text-rose-400">
              <span>1. Identidad y Domicilio del Responsable</span>
            </h2>
            <p>
              <strong>DV Performing Arts</strong> (en lo sucesivo, &ldquo;la Academia&rdquo;), con domicilio físico ubicado en <strong>Paseo de los Insurgentes #1506, Col. Jardines del Moral, C.P. 37160, León, Guanajuato, México</strong>, es responsable del uso, tratamiento y protección de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight flex items-center gap-2 text-rose-400">
              <span>2. Datos Personales que Recabamos</span>
            </h2>
            <p>
              Para las finalidades descritas en el presente aviso, podemos recabar los siguientes datos de los aspirantes a audición, alumnos y tutores:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-1.5 text-zinc-300">
              <li><strong>Datos de Identificación:</strong> Nombre completo, edad, fecha de nacimiento.</li>
              <li><strong>Datos de Contacto:</strong> Número de teléfono / WhatsApp móvil, correo electrónico.</li>
              <li><strong>Datos Académicos y Artísticos:</strong> Disciplina de interés (Teatro Musical, Danza Urbana, Canto, Actuación), experiencia previa y horarios preferidos.</li>
              <li><strong>Folio Oficial de Audición:</strong> Código único generado automáticamente por nuestro sistema para seguimiento de citas.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight flex items-center gap-2 text-rose-400">
              <span>3. Finalidades del Tratamiento</span>
            </h2>
            <p>
              Sus datos personales serán utilizados para las siguientes finalidades primarias y necesarias:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-1.5 text-zinc-300">
              <li>Gestión y registro de audiciones para montajes escénicos y puestas en escena oficiales.</li>
              <li>Generación de folios de registro y asignación de citas y turnos de audición.</li>
              <li>Envío de confirmaciones, horarios y recomendaciones vía mensajería automatizada por WhatsApp.</li>
              <li>Inscripción académica y control escolar interno de la academia.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight flex items-center gap-2 text-rose-400">
              <span>4. Uso de Imagen, Fotografía y Video</span>
            </h2>
            <p>
              Al registrarse y participar en audiciones, ensayos, talleres y montajes escénicos de DV Performing Arts, el aspirante o alumno reconoce que podrán realizarse tomas fotográficas y grabaciones de video con fines exclusivamente educativos, artísticos, testimoniales y de difusión cultural de la Academia en medios impresos, página web y redes sociales oficiales.
            </p>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight flex items-center gap-2 text-rose-400">
              <span>5. Derechos ARCO</span>
            </h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información (Rectificación), su eliminación de nuestros registros (Cancelación), u oponerse al uso de los mismos para fines específicos (Oposición).
            </p>
            <p>
              Para ejercer cualquiera de sus derechos ARCO, puede comunicarse directamente vía WhatsApp al <strong>477 655 8156</strong> o presentarse en nuestras instalaciones de Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight flex items-center gap-2 text-rose-400">
              <span>6. Modificaciones al Aviso de Privacidad</span>
            </h2>
            <p>
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de requerimientos legales o de nuestras prácticas operativas. Cualquier modificación estará disponible para su consulta en este mismo portal web.
            </p>
          </section>

        </div>

        {/* Back Link */}
        <div className="border-t border-[#20202B] mt-12 pt-8 flex justify-between items-center text-xs">
          <Link href="/" className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
            &larr; Volver al Inicio
          </Link>
          <Link href="/terminos-y-condiciones" className="text-zinc-400 hover:text-white">
            Ver Términos y Condiciones &rarr;
          </Link>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
