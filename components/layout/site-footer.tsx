"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FooterData {
  description: string;
  copyright: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}

interface ContactData {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hoursWeekday: string;
  hoursSaturday: string;
}

const DEFAULT_FOOTER: FooterData = {
  description: "Academia de formación integral en Teatro Musical, Danza Urbana, Canto y Actuación en León, Guanajuato.",
  copyright: "© 2026 DV PERFORMING ARTS. Todos los derechos reservados.",
  socialLinks: {
    instagram: "https://www.instagram.com/dvperformingarts",
    facebook: "https://www.facebook.com/dvperformingarts",
    tiktok: "https://www.tiktok.com/@dvperformingarts",
  },
};

const DEFAULT_CONTACT: ContactData = {
  address: "Paseo de los Insurgentes #1506, Col. Jardines del Moral, CP 37160, León, Gto.",
  phone: "477 655 8156",
  whatsapp: "477 655 8156",
  email: "contacto@dvperformingarts.com",
  hoursWeekday: "Lunes a Viernes 16:00 - 20:00",
  hoursSaturday: "Sábados 10:00 - 15:00",
};

export default function SiteFooter() {
  const [footer, setFooter] = useState<FooterData>(DEFAULT_FOOTER);
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);

  useEffect(() => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) {
          if (data.content.footer) {
            setFooter((prev) => ({
              ...prev,
              ...data.content.footer,
              socialLinks: {
                ...prev.socialLinks,
                ...(data.content.footer.socialLinks || {}),
              },
            }));
          }
          if (data.content.contact) {
            setContact((prev) => ({
              ...prev,
              ...data.content.contact,
            }));
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const socialLinks = footer.socialLinks || DEFAULT_FOOTER.socialLinks;
  const cleanPhone = (contact.phone || "477 655 8156").replace(/\D/g, "");

  return (
    <footer className="w-full border-t border-border-editorial bg-[#07070A] py-14 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mx-auto max-w-container-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* 1. Brand identity & Social Networks column */}
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
            {footer.description || DEFAULT_FOOTER.description}
          </p>

          {/* Social Media Links (Exclusively Instagram, Facebook, TikTok) */}
          <div className="flex flex-col gap-2 mt-2">
            <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold tracking-wider">
              Síguenos en Redes:
            </span>
            <div className="flex items-center gap-2.5">
              {/* Instagram */}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de DV Performing Arts"
                  className="w-9 h-9 rounded-xl bg-[#161622] hover:bg-gradient-to-tr hover:from-amber-600 hover:via-rose-600 hover:to-purple-600 border border-[#2B2B3E] hover:border-transparent text-zinc-300 hover:text-white flex items-center justify-center text-sm transition-all shadow-sm hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {/* Facebook */}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de DV Performing Arts"
                  className="w-9 h-9 rounded-xl bg-[#161622] hover:bg-[#1877F2] border border-[#2B2B3E] hover:border-transparent text-zinc-300 hover:text-white flex items-center justify-center text-sm transition-all shadow-sm hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>
              )}

              {/* TikTok */}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok de DV Performing Arts"
                  className="w-9 h-9 rounded-xl bg-[#161622] hover:bg-black border border-[#2B2B3E] hover:border-rose-500/80 text-zinc-300 hover:text-rose-400 flex items-center justify-center text-sm transition-all shadow-sm hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.25-1.51 3.28-3.32.05-4.37.01-8.74.02-13.11z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div className="font-mono text-[10px] text-zinc-500 mt-2 uppercase">
            {footer.copyright || DEFAULT_FOOTER.copyright}
          </div>
        </div>

        {/* 2. Navigation column */}
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-widest text-purple-400 uppercase font-bold">
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
              <Link href="/audiciones/consulta" className="text-purple-400 font-semibold hover:text-white transition-colors flex items-center gap-1">
                <span>🔍</span>
                <span>Consulta de Resultados de Audición</span>
              </Link>
            </li>
            <li>
              <Link href="/#maestros" className="hover:text-white transition-colors">
                Cuerpo Docente
              </Link>
            </li>
            <li>
              <Link href="/noticias" className="hover:text-white transition-colors">
                Noticias & Novedades
              </Link>
            </li>
            <li>
              <Link href="/pagos" className="hover:text-white transition-colors">
                Portal de Pagos & Mensualidades
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Contact & Location column */}
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-widest text-purple-400 uppercase font-bold">
            Ubicación & Atención
          </span>
          <ul className="flex flex-col gap-2 text-xs text-zinc-400 font-sans">
            <li>
              <strong className="text-zinc-200 block mb-0.5">Sede Oficial:</strong>
              <span>{contact.address || DEFAULT_CONTACT.address}</span>
            </li>
            <li>
              <strong className="text-zinc-200 block mb-0.5">WhatsApp / Tel:</strong>
              <a
                href={`https://wa.me/52${cleanPhone || "4776558156"}?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20informes`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2"
              >
                {contact.phone || DEFAULT_CONTACT.phone}
              </a>
            </li>
            {contact.email && (
              <li>
                <strong className="text-zinc-200 block mb-0.5">Correo Electrónico:</strong>
                <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors">
                  {contact.email}
                </a>
              </li>
            )}
            <li>
              <strong className="text-zinc-200 block mb-0.5">Horarios:</strong>
              <span>{contact.hoursWeekday || DEFAULT_CONTACT.hoursWeekday} | {contact.hoursSaturday || DEFAULT_CONTACT.hoursSaturday}</span>
            </li>
          </ul>
        </div>

        {/* 4. Direct Channels & Auditions */}
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[11px] tracking-widest text-purple-400 uppercase font-bold">
            Canales Directos
          </span>
          <ul className="flex flex-col gap-2.5 text-xs text-zinc-400 font-sans">
            <li>
              <a
                href={`https://wa.me/52${cleanPhone || "4776558156"}?text=Hola,%20quiero%20informes%20de%20audiciones`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all font-semibold flex items-center gap-2 w-fit"
              >
                <span>💬</span>
                <span>WhatsApp: {contact.phone || DEFAULT_CONTACT.phone}</span>
              </a>
            </li>
            <li className="mt-1">
              <Link href="/#audiciones" className="text-zinc-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                <span>★</span>
                <span>Convocatorias de Audición Activas</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal & Policies bar */}
      <div className="mx-auto max-w-container-max border-t border-[#20202B] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500 font-mono">
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link href="/aviso-de-privacidad" className="hover:text-purple-400 transition-colors">
            Aviso de Privacidad
          </Link>
          <Link href="/terminos-y-condiciones" className="hover:text-purple-400 transition-colors">
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
