"use client";

import React from "react";

export default function TheatricalAuroraBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* ================= 1. DYNAMIC THEATRICAL AURORA SPOTLIGHTS ================= */}
      {/* Spotlight 1: Broadway Center Stage Flare (Crimson / Rose) */}
      <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[75vw] max-w-[1000px] h-[550px] bg-gradient-to-b from-rose-600/30 via-red-600/15 to-transparent rounded-full blur-[110px] animate-pulse duration-[6000ms]" />

      {/* Spotlight 2: Stage Left Aurora Glow (Urban Violet & Magenta) */}
      <div className="absolute top-[25%] -left-[10%] w-[55vw] max-w-[750px] h-[650px] bg-gradient-to-tr from-purple-700/25 via-fuchsia-600/15 to-transparent rounded-full blur-[120px] animate-pulse duration-[8000ms]" />

      {/* Spotlight 3: Stage Right Warm Backstage Glow (Amber / Gold) */}
      <div className="absolute top-[50%] -right-[10%] w-[50vw] max-w-[700px] h-[600px] bg-gradient-to-tl from-amber-500/20 via-rose-600/10 to-transparent rounded-full blur-[130px] animate-pulse duration-[7000ms]" />

      {/* Spotlight 4: Lower Stage Floor Atmosphere (Deep Crimson & Indigo) */}
      <div className="absolute top-[75%] left-[20%] w-[60vw] max-w-[850px] h-[500px] bg-gradient-to-r from-purple-900/20 via-rose-700/15 to-transparent rounded-full blur-[140px]" />

      {/* ================= 2. SVG THEATRICAL STAGE TEXTURE & GEOMETRY ================= */}
      {/* Repeating Stage Grid & Acoustic Mesh Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.14]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* 60x60 Architectural Stage Grid with Center Nodes */}
          <pattern id="theatre-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.75"
              strokeOpacity="0.45"
            />
            {/* Center crosshair node */}
            <path
              d="M 28 30 L 32 30 M 30 28 L 30 32"
              fill="none"
              stroke="#E11D48"
              strokeWidth="1.2"
              strokeOpacity="0.9"
            />
            {/* Corner micro dot */}
            <circle cx="0" cy="0" r="1.5" fill="#A855F7" fillOpacity="0.8" />
          </pattern>

          {/* Diagonal Stage Spotlight Beams */}
          <linearGradient id="beam-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#9333EA" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beam-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#E11D48" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Apply Grid Pattern */}
        <rect width="100%" height="100%" fill="url(#theatre-grid)" />

        {/* Diagonal Stage Spotlight Cones cutting through darkness */}
        <polygon points="0,0 450,0 200,800 0,600" fill="url(#beam-left)" />
        <polygon points="100%,0 calc(100% - 450px),0 calc(100% - 200px),800 100%,600" fill="url(#beam-right)" />
      </svg>

      {/* ================= 3. FLOATING STAGE DUST & SPARKLE NODES ================= */}
      <div className="absolute top-[12%] left-[15%] w-2 h-2 rounded-full bg-rose-400 opacity-60 blur-[0.5px] animate-ping duration-[3000ms]" />
      <div className="absolute top-[22%] right-[18%] w-1.5 h-1.5 rounded-full bg-fuchsia-300 opacity-70 blur-[0.5px] animate-pulse duration-[2500ms]" />
      <div className="absolute top-[48%] left-[8%] w-2.5 h-2.5 rounded-full bg-amber-300 opacity-50 blur-[1px] animate-pulse duration-[4000ms]" />
      <div className="absolute top-[65%] right-[12%] w-2 h-2 rounded-full bg-rose-300 opacity-60 blur-[0.5px] animate-ping duration-[5000ms]" />
      <div className="absolute top-[82%] left-[22%] w-1.5 h-1.5 rounded-full bg-purple-400 opacity-70 animate-pulse duration-[3500ms]" />

      {/* ================= 4. THEATRICAL STAGE MARKERS (FLOATING SUBTLE TAGS) ================= */}
      <div className="hidden lg:flex justify-between items-center px-12 absolute top-32 inset-x-0 text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase opacity-40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-rose-600 rounded-sm" />
          <span>STAGE-LEFT // LX-01</span>
        </div>
        <div className="flex items-center gap-2">
          <span>STAGE-RIGHT // LX-02</span>
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
