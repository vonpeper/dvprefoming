import React from "react";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-border-editorial bg-background-main py-16 px-6">
      <div className="mx-auto max-w-container-max grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand identity column */}
        <div className="flex flex-col gap-4">
          <span className="font-display text-xl tracking-tight text-text-main font-extrabold">
            DV PERFORMING ARTS
          </span>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Plataforma en desarrollo para la academia de artes escénicas de León, Guanajuato. Proyecto de reconstrucción técnica.
          </p>
          <div className="font-mono text-[9px] text-text-muted mt-2 uppercase">
            &copy; 2026 DV PERFORMING ARTS.
          </div>
        </div>

        {/* Navigation column */}
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-semibold">
            Navegación
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
            <li>
              <Link href="#programas" className="hover:text-text-main transition-colors">
                Programas Académicos
              </Link>
            </li>
            <li>
              <Link href="#producciones" className="hover:text-text-main transition-colors">
                Cartelera de Obras
              </Link>
            </li>
            <li>
              <Link href="#audiciones" className="hover:text-text-main transition-colors">
                Audiciones Abiertas
              </Link>
            </li>
            <li>
              <Link href="#revista" className="hover:text-text-main transition-colors">
                Revista Editorial
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-semibold">
            Ubicación y Contacto
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
            <li>
              <strong className="text-text-main">Dirección:</strong> Paseo de los Insurgentes #1506, Col. Jardines del Moral, CP 37160, León, Gto.
            </li>
            <li>
              <strong className="text-text-main">Teléfono:</strong>{" "}
              <a href="tel:4776558156" className="hover:text-accent-red transition-colors">
                477 655 8156
              </a>
            </li>
            <li>
              <strong className="text-text-main">Email:</strong>{" "}
              <a href="mailto:contacto@dvperformingarts.com" className="hover:text-accent-red transition-colors">
                contacto@dvperformingarts.com
              </a>
            </li>
            <li>
              <strong className="text-text-main">Horarios:</strong> L-V 16:00 - 20:00 | Sáb 10:00 - 15:00
            </li>
          </ul>
        </div>

        {/* Social Media column */}
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-semibold">
            Canales Directos
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
            <li>
              <a
                href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20me%20gustaría%20solicitar%20informes"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-red transition-colors font-medium flex items-center gap-1.5"
              >
                <span>WhatsApp: 477 655 8156</span>
              </a>
            </li>
            <li>
              <a
                href="https://dvperformingarts.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-red transition-colors"
              >
                Sitio Web: dvperformingarts.com
              </a>
            </li>
            <li>
              <Link href="#audiciones" className="hover:text-accent-red transition-colors">
                Convocatoria: &ldquo;Si no es ahora&rdquo;
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal & Credits bar */}
      <div className="mx-auto max-w-container-max border-t border-border-editorial mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-text-muted font-mono uppercase tracking-wider">
        <div className="flex gap-6">
          <span className="italic">Aviso de Privacidad (Pendiente)</span>
          <span className="italic">Términos de Servicio (Pendiente)</span>
        </div>
        <div>
          MIGRACIÓN WORDPRESS A NEXT.JS &bull; BASE TÉCNICA LOCAL
        </div>
      </div>
    </footer>
  );
}
