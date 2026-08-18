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

        {/* Contact column with neutral placeholders */}
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-semibold">
            Ubicación y Contacto
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
            <li className="italic">
              <strong>Dirección:</strong> León, Guanajuato (Calle y número pendientes de información).
            </li>
            <li className="italic">
              <strong>Teléfono:</strong> Teléfono de contacto pendiente de entrega.
            </li>
            <li className="italic">
              <strong>Email:</strong> Correo institucional pendiente de entrega.
            </li>
          </ul>
        </div>

        {/* Social Media column with placeholders */}
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] tracking-widest text-accent-red uppercase font-semibold">
            Redes Sociales
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-text-muted font-sans">
            <li className="italic">
              <span className="opacity-50">Instagram (Enlace por confirmar)</span>
            </li>
            <li className="italic">
              <span className="opacity-50">Facebook (Enlace por confirmar)</span>
            </li>
            <li className="italic">
              <span className="opacity-50">WhatsApp (Enlace por confirmar)</span>
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
