import React, { useEffect } from "react";
import Link from "next/link";
import ButtonLink from "@/components/ui/button-link";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({
  isOpen,
  onClose,
}: MobileNavigationProps) {
  // Prevent page scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background-main flex flex-col p-6 animate-fade-in md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación móvil"
    >
      {/* Top Header inside overlay */}
      <div className="flex justify-between items-center pb-6 border-b border-border-editorial">
        <span className="font-display text-2xl tracking-tight text-text-main font-extrabold">
          DV PERFORMING ARTS
        </span>
        <button
          onClick={onClose}
          className="p-2 border border-border-editorial hover:border-text-main focus:outline-none focus:ring-2 focus:ring-accent-red text-text-main transition-colors cursor-pointer"
          aria-label="Cerrar menú"
        >
          {/* Close Icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 flex flex-col justify-center gap-8 py-12">
        <ul className="flex flex-col gap-6 text-center">
          <li>
            <Link
              href="#programas"
              onClick={onClose}
              className="font-display text-4xl sm:text-5xl hover:text-accent-red tracking-tighter text-text-main transition-colors block uppercase font-extrabold leading-[0.85]"
            >
              Programas Académicos
            </Link>
          </li>
          <li>
            <Link
              href="#producciones"
              onClick={onClose}
              className="font-display text-4xl sm:text-5xl hover:text-accent-red tracking-tighter text-text-main transition-colors block uppercase font-extrabold leading-[0.85]"
            >
              Cartelera y Producciones
            </Link>
          </li>
          <li>
            <Link
              href="#audiciones"
              onClick={onClose}
              className="font-display text-4xl sm:text-5xl hover:text-accent-red tracking-tighter text-text-main transition-colors block uppercase font-extrabold leading-[0.85]"
            >
              Convocatorias de Audición
            </Link>
          </li>
          <li>
            <Link
              href="#noticias"
              onClick={onClose}
              className="font-display text-4xl sm:text-5xl hover:text-accent-red tracking-tighter text-text-main transition-colors block uppercase font-extrabold leading-[0.85]"
            >
              Noticias & Novedades
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer / CTA inside overlay */}
      <div className="border-t border-border-editorial pt-6 flex flex-col gap-4">
        <a
          href="https://wa.me/524776558156?text=Hola,%20quiero%20una%20clase%20muestra"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl bg-accent-red text-text-main font-bold text-center uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <span>📱</span>
          <span>Solicitar Clase Muestra</span>
        </a>
        <div className="text-center font-mono text-[9px] text-text-muted uppercase tracking-widest">
          LEÓN, GUANAJUATO &bull; MÉXICO
        </div>
      </div>
    </div>
  );
}
