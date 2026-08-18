"use client";

import React, { useState } from "react";
import Link from "next/link";
import ButtonLink from "@/components/ui/button-link";
import MobileNavigation from "./mobile-navigation";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-red focus:text-text-main focus:ring-2 focus:ring-border-focus font-sans text-xs uppercase tracking-widest font-semibold"
      >
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-border-editorial bg-background-main/90 backdrop-blur-md">
        <div className="mx-auto max-w-container-max px-6 h-20 flex items-center justify-between">
          
          {/* Logo / Identity */}
          <Link
            href="/"
            className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-text-main hover:text-accent-red transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red px-1"
            aria-label="Página de inicio de DV Performing Arts"
          >
            DV PERFORMING ARTS
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" aria-label="Navegación principal">
            <ul className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
              <li>
                <Link
                  href="#programas"
                  className="text-text-muted hover:text-text-main transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red px-1"
                >
                  Programas
                </Link>
              </li>
              <li>
                <Link
                  href="#producciones"
                  className="text-text-muted hover:text-text-main transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red px-1"
                >
                  Producciones
                </Link>
              </li>
              <li>
                <Link
                  href="#audiciones"
                  className="text-text-muted hover:text-text-main transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red px-1"
                >
                  Audiciones
                </Link>
              </li>
              <li>
                <Link
                  href="#revista"
                  className="text-text-muted hover:text-text-main transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red px-1"
                >
                  Revista
                </Link>
              </li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            <ButtonLink
              href="#contacto"
              variant="secondary"
              className="hidden md:inline-flex"
            >
              Clase Muestra
            </ButtonLink>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="p-2 border border-border-editorial hover:border-text-main focus:outline-none focus:ring-2 focus:ring-border-focus text-text-main transition-colors cursor-pointer md:hidden"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay Navigation for Mobile */}
      <MobileNavigation isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}
