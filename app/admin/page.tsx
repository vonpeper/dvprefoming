"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";
import TurnstileWidget from "@/components/ui/turnstile-widget";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";

  const [username, setUsername] = useState("admin@dvperformingarts.com");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, turnstileToken }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user?.role === "DOCENTE_JUEZ") {
          router.push("/jueces");
        } else if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      } else {
        setErrorMsg(data.error || "Credenciales incorrectas.");
        if (data.isLocked) {
          setIsLocked(true);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 max-w-md w-full bg-[#0E0E14]/95 backdrop-blur-2xl border-2 border-[#20202E] rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-6">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/logo-badge.png"
          alt="DV Performing Arts"
          className="h-14 w-auto object-contain drop-shadow-xl"
        />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-widest text-rose-400 font-bold">
            ● SISTEMA DE ADMINISTRACIÓN
          </span>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-white mt-0.5">
            DV PERFORMING ARTS
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Ingresa tus credenciales para acceder al Panel de Control y CMS.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-zinc-300">
            Usuario / Correo Electrónico
          </label>
          <input
            type="text"
            required
            disabled={loading || isLocked}
            placeholder="admin@dvperformingarts.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#08080C] border border-[#262636] focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder:text-zinc-600 font-mono transition-colors disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-zinc-300 flex justify-between items-center">
            <span>Contraseña</span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-zinc-400 hover:text-white font-mono cursor-pointer"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={loading || isLocked}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#08080C] border border-[#262636] focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none placeholder:text-zinc-600 font-mono transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Cloudflare Turnstile Bot Protection Widget */}
        <div className="pt-1">
          <TurnstileWidget
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
            theme="dark"
          />
        </div>

        {/* Error message / Anti-Brute-Force Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-start gap-2 animate-fade-in">
            <span>⚠️</span>
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || isLocked}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
        >
          {loading ? (
            <span>Autenticando con Cloudflare...</span>
          ) : (
            <>
              <span>🔐</span>
              <span>Ingresar al Panel &rarr;</span>
            </>
          )}
        </button>
      </form>

      {/* Security Footer Notice */}
      <div className="pt-4 border-t border-[#1C1C28] flex flex-col gap-2 text-center text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Protegido por Cloudflare Turnstile & Anti-Fuerza Bruta</span>
        </div>
        <Link href="/" className="text-zinc-400 hover:text-white underline mt-1">
          &larr; Volver al Sitio Web Principal
        </Link>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#07070A] text-white font-sans selection:bg-rose-500 selection:text-white flex items-center justify-center p-4 relative overflow-hidden">
      <TheatricalAuroraBackground />
      <Suspense fallback={<div className="relative z-10 text-xs font-mono text-zinc-500">Cargando panel de acceso...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
