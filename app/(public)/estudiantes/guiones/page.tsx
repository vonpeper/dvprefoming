"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Script, ScriptCharacter, ScriptLine } from "@/types/script";

interface AuthUser {
  username: string;
  fullName: string;
  role: string;
  studentFolio?: string;
  subscriptionStatus?: string;
  hasPaidSubscription?: boolean;
  betaAccess?: boolean;
}

export default function EstudiantesGuionesCatalogPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Scripts catalog state
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(true);

  // PDF / Script Uploader State
  const [showUploader, setShowUploader] = useState(false);
  const [uploadMode, setUploadMode] = useState<"PDF" | "TEXT">("PDF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  // Extracted Result State ("Obtener Personaje")
  const [extractedTitle, setExtractedTitle] = useState("");
  const [extractedCharacters, setExtractedCharacters] = useState<ScriptCharacter[]>([]);
  const [extractedLines, setExtractedLines] = useState<ScriptLine[]>([]);
  const [extractedPages, setExtractedPages] = useState<number>(1);
  const [selectedCharacterName, setSelectedCharacterName] = useState<string>("");
  const [isCreatingScript, setIsCreatingScript] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check current session
  const verifySession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const fetchScripts = async () => {
    try {
      const res = await fetch("/api/scripts");
      const data = await res.json();
      if (data.success) setScripts(data.scripts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScripts(false);
    }
  };

  useEffect(() => {
    verifySession();
    fetchScripts();
  }, []);

  const handleLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoginError("");

    const u = (customUser || loginUsername).trim();
    const p = (customPass || loginPassword).trim();

    if (!u || !p) {
      setLoginError("Ingresa tu usuario (correo o folio) y contraseña.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setLoginUsername("");
        setLoginPassword("");
        if (data.user.studentFolio) {
          localStorage.setItem("dv_student_folio", data.user.studentFolio);
        }
      } else {
        setLoginError(data.error || "Credenciales incorrectas.");
      }
    } catch {
      setLoginError("Error de conexión al iniciar sesión.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick 1-click test login as Alumno X
  const handleQuickDemoLogin = () => {
    handleLogin(undefined, "alumno.beta@dvperformingarts.com", "DV@Alumno2026");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem("dv_student_folio");
    router.refresh();
  };

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAnalyzeError("");
      // Reset previous extraction
      setExtractedCharacters([]);
      setExtractedLines([]);
      setSelectedCharacterName("");
    }
  };

  // Parse PDF or Text to extract characters and lines
  const handleAnalyzeScript = async () => {
    setAnalyzeError("");

    if (uploadMode === "PDF" && !selectedFile) {
      setAnalyzeError("Por favor selecciona un archivo PDF o de texto primero.");
      return;
    }

    if (uploadMode === "TEXT" && !rawText.trim()) {
      setAnalyzeError("Por favor ingresa o pega el texto del guion.");
      return;
    }

    setIsAnalyzing(true);
    try {
      let res: Response;

      if (uploadMode === "PDF" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        res = await fetch("/api/scripts/parse", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/scripts/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText }),
        });
      }

      const json = await res.json();
      if (json.success && json.data) {
        const characters = json.data.characters || [];
        const lines = json.data.lines || [];

        if (characters.length === 0 || lines.length === 0) {
          setAnalyzeError(
            "No se pudieron identificar diálogos de personajes en el archivo. Asegúrate de que tenga formato teatral (ej. 'PERSONAJE: Diálogo')."
          );
          return;
        }

        setExtractedCharacters(characters);
        setExtractedLines(lines);
        setExtractedPages(json.totalPages || 1);
        setExtractedTitle(
          json.inferredTitle ||
            selectedFile?.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ") ||
            "Guion de Ensayo"
        );

        // Pre-select first character with the most lines
        if (characters.length > 0) {
          const sorted = [...characters].sort((a, b) => b.totalLinesCount - a.totalLinesCount);
          setSelectedCharacterName(sorted[0].name);
        }
      } else {
        setAnalyzeError(json.error || "No se pudo procesar el guion.");
      }
    } catch (err: any) {
      setAnalyzeError("Error de conexión al procesar el archivo: " + (err.message || ""));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save the script and launch rehearsal directly for the selected character
  const handleLaunchRehearsal = async () => {
    if (!selectedCharacterName) {
      alert("Por favor selecciona qué personaje vas a estudiar.");
      return;
    }

    setIsCreatingScript(true);
    try {
      const titleToUse = extractedTitle.trim() || selectedFile?.name.replace(/\.[^/.]+$/, "") || "Guion de Ensayo";

      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToUse,
          productionTitle: "Estudio Personal",
          description: `Libreto cargado por ${currentUser?.fullName || "Alumno"} para estudio del personaje ${selectedCharacterName}.`,
          characters: extractedCharacters,
          lines: extractedLines,
        }),
      });

      const data = await res.json();
      if (data.success && data.script) {
        // Refresh catalog in background
        fetchScripts();
        // Redirect directly to the rehearsal teleprompter for the selected character!
        router.push(
          `/estudiantes/guion/${data.script.id}?char=${encodeURIComponent(selectedCharacterName)}`
        );
      } else {
        alert(data.error || "Error al guardar el guion.");
        setIsCreatingScript(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al iniciar el ensayo.");
      setIsCreatingScript(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 bg-[#161B22] border-b border-[#30363D] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/logo-badge.png" alt="DV Logo" className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
              DV PERFORMING ARTS
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                🎭 SALA DE ESTUDIO
              </span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{currentUser.fullName}</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {currentUser.role === "ADMIN" ? "Director / Admin" : `Folio: ${currentUser.studentFolio || "Alumno DV"}`}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-3 py-1.5 rounded-lg border border-[#30363D] transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#30363D] hover:bg-[#21262D] transition-colors"
            >
              Acceso Docente
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-[#161B22] to-purple-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl">🎙️</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Lectura & Aprendizaje de Guiones Teatrales
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  Voz Interactiva Activa
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Sube tu guion en PDF, obtén tus personajes y ensaya tus líneas con réplica de voz automática en tu navegador.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-[#21262D] text-amber-300 border border-[#30363D] px-2.5 py-1 rounded whitespace-nowrap self-end sm:self-auto">
            100% Nativo & Gratuito
          </span>
        </div>

        {/* 1. NOT AUTHENTICATED: Quick Login or Form */}
        {authChecked && !currentUser && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg mx-auto space-y-6 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
                🎭
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Acceso a Estudio de Guiones
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ingresa para subir tu PDF o ensayar los libretos de la escuela.
              </p>
            </div>

            {/* Quick 1-click test button */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-2.5">
              <span className="text-xs font-semibold text-amber-300 block">
                ¿Deseas probarlo inmediatamente?
              </span>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>⚡ Entrar con 1 Clic como Alumno X</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#30363D]"></div>
              <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                O con tus credenciales
              </span>
              <div className="flex-grow border-t border-[#30363D]"></div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Usuario / Correo o Folio (DV-XXXX)
                </label>
                <input
                  type="text"
                  placeholder="ej. alumno.beta@dvperformingarts.com o DV-0482"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Tu contraseña asignada"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>🔐 Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 2. AUTHENTICATED: Student Studio */}
        {authChecked && currentUser && (
          <div className="space-y-8 animate-fade-in">
            {/* Student Profile Bar */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-lg font-black">
                  👤
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Alumno en Sala de Estudio:</span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{currentUser.fullName}</span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                      {currentUser.studentFolio || "DV-0482"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowUploader(!showUploader)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{showUploader ? "Cerrar Subida de Guion" : "Subir mi Guion en PDF"}</span>
              </button>
            </div>

            {/* HERO: PDF UPLOADER & CHARACTER EXTRACTOR */}
            {(showUploader || scripts.length === 0) && (
              <div className="bg-gradient-to-br from-[#161B22] via-[#1c222b] to-[#161B22] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      Paso a Paso
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                      <span>📄</span> Cargar Guion y Obtener Personaje
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Sube tu archivo PDF de la obra. El sistema leerá automáticamente las páginas, identificará los nombres de los personajes y sus parlamentos para que elijas tu rol y comiences a estudiar.
                    </p>
                  </div>

                  {/* Mode switch (PDF vs Text) */}
                  <div className="flex bg-[#0D1117] p-1 rounded-xl border border-[#30363D] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setUploadMode("PDF")}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        uploadMode === "PDF"
                          ? "bg-amber-500 text-black shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Archivo PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("TEXT")}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        uploadMode === "TEXT"
                          ? "bg-amber-500 text-black shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Pegar Texto
                    </button>
                  </div>
                </div>

                {/* PASO 1: FILE OR TEXT INPUT */}
                {extractedCharacters.length === 0 ? (
                  <div className="space-y-4">
                    {uploadMode === "PDF" ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                          selectedFile
                            ? "border-emerald-500 bg-emerald-950/20"
                            : "border-[#30363D] hover:border-amber-500/60 bg-[#0D1117]/60 hover:bg-[#0D1117]"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.txt,application/pdf,text/plain"
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mb-3 shadow-inner">
                          {selectedFile ? "📑" : "📤"}
                        </div>

                        {selectedFile ? (
                          <div className="space-y-1">
                            <span className="text-emerald-400 font-bold text-sm block">
                              ✓ Archivo Seleccionado
                            </span>
                            <span className="text-white font-mono text-sm block">
                              {selectedFile.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {(selectedFile.size / 1024).toFixed(1)} KB — Clic para cambiar de archivo
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="text-sm font-bold text-white block">
                              Haz clic aquí o arrastra tu archivo PDF de la obra
                            </span>
                            <span className="text-xs text-slate-400 block max-w-md mx-auto">
                              Soporta archivos <strong className="text-amber-300">.pdf</strong> y <strong className="text-amber-300">.txt</strong> con diálogos teatrales.
                            </span>
                            <span className="text-[11px] text-slate-500 block pt-1">
                              Ejemplo: libreto-acto1.pdf
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase text-slate-300">
                          Pega aquí el texto del libreto:
                        </label>
                        <textarea
                          rows={10}
                          placeholder={`BENNY: ¡Buenos días Nina! ¿Tienes el libreto listo?
NINA (sonriendo): Sí, aquí lo traigo. Lista para repasar las líneas.
USNAVI: Recuerden que la música empieza a sonar en cuanto se apaguen las luces.`}
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          className="w-full bg-[#0D1117] border border-[#30363D] p-4 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                        />
                      </div>
                    )}

                    {analyzeError && (
                      <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{analyzeError}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isAnalyzing || (uploadMode === "PDF" && !selectedFile) || (uploadMode === "TEXT" && !rawText.trim())}
                      onClick={handleAnalyzeScript}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-black py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2.5"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Extrayendo personajes y líneas del PDF...</span>
                        </>
                      ) : (
                        <>
                          <span>🔍 Analizar Guion y Obtener Personajes</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* PASO 2: OBTENER PERSONAJE & LANZAR ESTUDIO */
                  <div className="space-y-6 animate-scale-up">
                    <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xl font-black">
                          ✓
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-emerald-300">
                            ¡Guion Analizado con Éxito!
                          </h3>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Detectamos <strong>{extractedCharacters.length} personajes</strong> y{" "}
                            <strong>{extractedLines.length} parlamentos</strong>{" "}
                            {extractedPages > 1 ? `en ${extractedPages} páginas` : ""}.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setExtractedCharacters([]);
                          setExtractedLines([]);
                          setSelectedCharacterName("");
                        }}
                        className="text-xs bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-3 py-1.5 rounded-lg border border-[#30363D] transition-colors self-start sm:self-auto"
                      >
                        🔄 Subir otro archivo
                      </button>
                    </div>

                    {/* Script Title */}
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                        Título de la Obra o Escena
                      </label>
                      <input
                        type="text"
                        value={extractedTitle}
                        onChange={(e) => setExtractedTitle(e.target.value)}
                        placeholder="Ej. In The Heights - Acto 1"
                        className="w-full bg-[#0D1117] border border-[#30363D] px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Character Grid ("Obtener Personaje") */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>🎭</span> ¿Qué personaje vas a interpretar tú?
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Selecciona tu papel. La voz interactiva dirá las líneas de todos los demás personajes y se detendrá cuando sea tu turno.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {extractedCharacters.map((char) => {
                          const isSelected = selectedCharacterName.toUpperCase() === char.name.toUpperCase();
                          const percentage = extractedLines.length > 0
                            ? Math.round((char.totalLinesCount / extractedLines.length) * 100)
                            : 0;

                          return (
                            <div
                              key={char.id}
                              onClick={() => setSelectedCharacterName(char.name)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                                isSelected
                                  ? "bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]"
                                  : "bg-[#0D1117] border-[#30363D] hover:border-slate-500"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className="w-3.5 h-3.5 rounded-full"
                                    style={{ backgroundColor: char.colorTag || "#3b82f6" }}
                                  />
                                  <span className="font-bold text-sm text-white">
                                    {char.name}
                                  </span>
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-bold uppercase bg-amber-500 text-black px-2 py-0.5 rounded-full font-mono">
                                    ✓ Tu Rol
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    Clic para elegir
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#30363D]/60 text-slate-400">
                                <span>{char.totalLinesCount} parlamentos</span>
                                <span className="font-mono text-amber-400/80">{percentage}% diálogo</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Launch Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={!selectedCharacterName || isCreatingScript}
                        onClick={handleLaunchRehearsal}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-black py-3.5 rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {isCreatingScript ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>Preparando sala de ensayo interactiva...</span>
                          </>
                        ) : (
                          <>
                            <span>🚀 Comenzar a Estudiar mis Líneas como {selectedCharacterName || "..."}</span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-slate-500 text-center mt-2">
                        💡 Se abrirá el teleprompter de ensayo con síntesis de voz nativa del navegador y reconocimiento de micrófono.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CATALOG OF EXISTING SCRIPTS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📚</span> Libretos de la Academia
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Obras asignadas por la dirección teatral listas para ensayar.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-[#161B22] px-3 py-1 rounded-lg border border-[#30363D]">
                  {scripts.length} {scripts.length === 1 ? "obra" : "obras"}
                </span>
              </div>

              {loadingScripts ? (
                <div className="p-12 text-center text-slate-400 bg-[#161B22] border border-[#30363D] rounded-2xl">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
                  <p className="text-xs">Cargando libretos y personajes...</p>
                </div>
              ) : scripts.length === 0 ? (
                <div className="bg-[#161B22] border border-[#30363D] p-10 rounded-2xl text-center space-y-3">
                  <p className="text-sm text-slate-300">
                    Aún no hay libretos guardados en el catálogo general.
                  </p>
                  <button
                    onClick={() => setShowUploader(true)}
                    className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-400 transition-colors"
                  >
                    Subir tu primer guion en PDF
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scripts.map((script) => (
                    <div
                      key={script.id}
                      className="bg-[#161B22] border border-[#30363D] hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-sm"
                    >
                      <div className="space-y-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          {script.productionTitle}
                        </span>
                        <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                          {script.title}
                        </h4>
                        {script.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{script.description}</p>
                        )}

                        {/* Personajes del guion */}
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                            Elige tu personaje para ensayar este libreto:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {script.characters.map((c) => (
                              <Link
                                key={c.id}
                                href={`/estudiantes/guion/${script.id}?char=${encodeURIComponent(c.name)}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-[#21262D] text-slate-200 border-[#30363D] hover:border-amber-500/60 hover:bg-amber-500/10 hover:text-amber-300 transition-all duration-150"
                              >
                                <span>{c.name}</span>
                                <span className="text-[10px] opacity-70 font-mono">
                                  ({c.totalLinesCount})
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#30363D] flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">
                          {script.totalLines} parlamentos
                        </span>

                        <Link
                          href={`/estudiantes/guion/${script.id}`}
                          className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>🎙️ Entrar a la Sala de Ensayo</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
