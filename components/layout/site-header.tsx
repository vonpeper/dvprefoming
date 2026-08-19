"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ButtonLink from "@/components/ui/button-link";
import MobileNavigation from "./mobile-navigation";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-red focus:text-text-main focus:ring-2 focus:ring-border-focus font-sans text-xs uppercase tracking-widest font-semibold"
      >
        Saltar al contenido principal
      </a>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#07070A]/95 backdrop-blur-xl border-b border-[#252535] shadow-[0_10px_35px_rgba(0,0,0,0.8)] py-1"
            : "bg-transparent border-b border-[#1E1E28] py-2"
        }`}
      >
        <div className="mx-auto max-w-container-max px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          
          {/* Logo / Identity */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 font-display text-sm sm:text-xl md:text-2xl font-extrabold tracking-tight text-text-main hover:text-rose-400 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 px-1 group min-w-0"
            aria-label="Página de inicio de DV Performing Arts"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/logo-badge.png"
              alt="DV Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            />
            <span className="font-display truncate font-black tracking-tighter">
              DV PERFORMING ARTS
            </span>
          </Link>

          {/* Desktop Navigation (Visible on md and above) */}
          <nav className="hidden md:block" aria-label="Navegación principal">
            <ul className="flex items-center gap-6 lg:gap-8 text-[11px] font-bold uppercase tracking-widest font-mono">
              <li>
                <Link
                  href="/#programas"
                  className="text-zinc-400 hover:text-white hover:text-rose-400 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 px-1 py-1"
                >
                  Programas
                </Link>
              </li>
              <li>
                <Link
                  href="/#producciones"
                  className="text-zinc-400 hover:text-white hover:text-rose-400 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 px-1 py-1"
                >
                  Cartelera
                </Link>
              </li>
              <li>
                <Link
                  href="/#audiciones"
                  className="text-rose-400 hover:text-rose-300 font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 px-1 py-1 flex items-center gap-1"
                >
                  <span>★</span>
                  <span>Audiciones</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/noticias"
                  className="text-zinc-400 hover:text-white hover:text-rose-400 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 px-1 py-1"
                >
                  Noticias
                </Link>
              </li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ButtonLink
              href="/#audiciones"
              variant="primary"
              className="hidden sm:inline-flex text-xs py-2.5 px-5 rounded-full"
            >
              Audicionar 2026
            </ButtonLink>

            {/* Mobile / Tablet Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="p-2 sm:p-2.5 border border-[#2A2A38] hover:border-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-white rounded-xl transition-colors cursor-pointer md:hidden bg-[#121218]"
              aria-expanded={isMenuOpen}
              aria-label="Abrir menú de navegación"
            >
              {/* Menu Toggle Icon */}
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
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNavigation isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}
