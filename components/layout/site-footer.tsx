import React from "react";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-border-editorial bg-[#07070A] py-14 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mx-auto max-w-container-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand identity column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/logo-white.png"
              alt="DV Performing Arts"
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">
            Academia de formación integral en Teatro Musical, Danza Urbana, Canto y Actuación en León, Guanajuato.
          </p>
          <div className="font-mono text-[10px] text-zinc-500 mt-2 uppercase">
            &copy; 2026 DV PERFORMING ARTS.
          </div>
        </div>

        {/* Navigation column */}
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-widest text-rose-400 uppercase font-bold">
            Navegación
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-zinc-400 font-sans font-medium">
            <li>
              <Link href="/#programas" className="hover:text-white transition-colors">
                Programas Académicos
              </Link>
            </li>
            <li>
              <Link href="/#producciones" className="hover:text-white transition-colors">
                Cartelera & Obras
              </Link>
            </li>
            <li>
              <Link href="/#audiciones" className="hover:text-white transition-colors">
                Registro de Audiciones
              </Link>
            </li>
            <li>
              <Link href="/noticias" className="hover:text-white transition-colors">
                Noticias & Novedades
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-widest text-rose-400 uppercase font-bold">
            Ubicación & Atención
          </span>
          <ul className="flex flex-col gap-2 text-xs text-zinc-400 font-sans">
            <li>
              <strong className="text-zinc-200">Sede:</strong> Paseo de los Insurgentes #1506, Col. Jardines del Moral, CP 37160, León, Gto.
            </li>
            <li>
              <strong className="text-zinc-200">WhatsApp / Tel:</strong>{" "}
              <a
                href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20me%20gustar%C3%ADa%20solicitar%20informes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-400 hover:underline font-semibold"
              >
                477 655 8156
              </a>
            </li>
            <li>
              <strong className="text-zinc-200">Horarios:</strong> Lunes a Viernes 16:00 - 20:00 | Sábados 10:00 - 15:00
            </li>
          </ul>
        </div>

        {/* Direct Channels */}
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-widest text-rose-400 uppercase font-bold">
            Canales Directos
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-zinc-400 font-sans">
            <li>
              <a
                href="https://wa.me/524776558156?text=Hola%20DV%20Performing%20Arts,%20quiero%20informes%20de%20audiciones"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all font-semibold flex items-center gap-2 w-fit"
              >
                <span>💬</span>
                <span>WhatsApp: 477 655 8156</span>
              </a>
            </li>
            <li className="mt-1">
              <Link href="/#audiciones" className="text-zinc-400 hover:text-white transition-colors">
                ★ Convocatoria: &ldquo;Si No Es Ahora (El Musical)&rdquo;
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal & Policies bar */}
      <div className="mx-auto max-w-container-max border-t border-[#20202B] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500 font-mono">
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link href="/aviso-de-privacidad" className="hover:text-rose-400 transition-colors">
            Aviso de Privacidad
          </Link>
          <Link href="/terminos-y-condiciones" className="hover:text-rose-400 transition-colors">
            Términos y Condiciones
          </Link>
        </div>
        <div className="text-zinc-600 text-[10px]">
          DV PERFORMING ARTS &bull; LEÓN, GUANAJUATO
        </div>
      </div>
    </footer>
  );
}
