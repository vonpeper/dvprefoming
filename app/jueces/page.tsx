"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AuditionRegistration,
  EvaluationCriteria,
  EvaluationDiscipline,
  Production,
  Teacher,
} from "@/types/mock";

export default function JudgesPortalPage() {
  // Session State
  const [judgeName, setJudgeName] = useState("");
  const [judgeTitle, setJudgeTitle] = useState("");
  const [discipline, setDiscipline] = useState<EvaluationDiscipline>("CANTO");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Authentication State
  const [identifierInput, setIdentifierInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Current User Session & Role
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: string;
    fullName: string;
    title?: string;
    assignedDiscipline?: EvaluationDiscipline | "ALL";
  } | null>(null);

  // Selected Production (null means show production selection cards gallery)
  const [selectedProduction, setSelectedProduction] = useState<Production | "ALL" | null>(null);

  // Dynamic Data State
  const [teachers, setTeachers] = useState<(Teacher & { defaultDiscipline?: EvaluationDiscipline })[]>([]);
  const [auditions, setAuditions] = useState<AuditionRegistration[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuditionId, setSelectedAuditionId] = useState<string | null>(null);

  // Live Scoring Form State
  const [scores, setScores] = useState<Record<string, number>>({});
  const [judgeNotes, setJudgeNotes] = useState("");
  const [savingScore, setSavingScore] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load criteria, auditions, productions, and teachers dynamically
  const loadData = async () => {
    setLoading(true);
    try {
      const [critRes, audRes, prodRes, teachRes, meRes] = await Promise.all([
        fetch("/api/auditions/criteria"),
        fetch("/api/auditions/list"),
        fetch("/api/productions"),
        fetch("/api/teachers"),
        fetch("/api/auth/me").catch(() => null),
      ]);

      const critData = await critRes.json();
      const audData = await audRes.json();
      const prodData = await prodRes.json();
      const teachData = await teachRes.json();
      const meData = meRes ? await meRes.json() : null;

      if (critData?.criteria) setCriteria(critData.criteria);
      if (prodData?.productions) setProductions(prodData.productions);
      if (teachData?.teachers) setTeachers(teachData.teachers);

      if (meData?.authenticated && meData.user) {
        setCurrentUser(meData.user);
        setJudgeName(meData.user.fullName || "Juez");
        setJudgeTitle(meData.user.title || "Docente Titular");

        if (meData.user.role === "DOCENTE_JUEZ") {
          const userDiscipline = meData.user.assignedDiscipline || (teachData?.teachers || []).find(
            (t: any) => t.fullName.toLowerCase() === meData.user.fullName.toLowerCase()
          )?.defaultDiscipline || "CANTO";
          setDiscipline(userDiscipline);
        }
        setIsLoggedIn(true);
      }

      const audList: AuditionRegistration[] = audData?.auditions || audData?.registrations || [];
      setAuditions(audList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check saved session in localStorage
    const savedJudge = localStorage.getItem("dv_judge_session");
    if (savedJudge) {
      try {
        const parsed = JSON.parse(savedJudge);
        if (parsed.name && parsed.discipline) {
          setJudgeName(parsed.name);
          setJudgeTitle(parsed.title || "Juez Evaluador");
          setDiscipline(parsed.discipline);
          setIsLoggedIn(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // If identifier and password are provided, authenticate with API
    if (identifierInput.trim() && passwordInput.trim()) {
      setAuthenticating(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: identifierInput.trim(),
            password: passwordInput.trim(),
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setCurrentUser(data.user);
          setJudgeName(data.user.fullName || data.user.username);
          setJudgeTitle(data.user.title || "Docente Titular");

          const userDisc = data.user.assignedDiscipline || discipline;
          setDiscipline(userDisc);

          const session = {
            name: data.user.fullName,
            title: data.user.title || "Docente Titular",
            discipline: userDisc,
          };
          localStorage.setItem("dv_judge_session", JSON.stringify(session));
          setIsLoggedIn(true);
          return;
        } else {
          setLoginError(data.error || "Credenciales incorrectas.");
          setAuthenticating(false);
          return;
        }
      } catch (err) {
        console.error(err);
        setLoginError("Error de conexión al autenticar.");
        setAuthenticating(false);
        return;
      } finally {
        setAuthenticating(false);
      }
    }

    if (!judgeName.trim()) {
      setLoginError("Por favor ingresa tu número de WhatsApp y contraseña o selecciona tu perfil.");
      return;
    }

    const session = {
      name: judgeName.trim(),
      title: judgeTitle || "Juez Evaluador",
      discipline,
    };
    localStorage.setItem("dv_judge_session", JSON.stringify(session));
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem("dv_judge_session");
    setIsLoggedIn(false);
    setSelectedProduction(null);
    setCurrentUser(null);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  const selectTeacherPreset = (teacher: Teacher & { defaultDiscipline?: EvaluationDiscipline }) => {
    setJudgeName(teacher.fullName);
    setIdentifierInput(teacher.fullName);
    setPasswordInput("DV@Docente2026");
    setJudgeTitle(
      teacher.specialties && teacher.specialties.length > 0
        ? `Docente de ${teacher.specialties[0]}`
        : "Docente Titular"
    );
    if (teacher.defaultDiscipline) {
      setDiscipline(teacher.defaultDiscipline);
    }
  };

  // Filter criteria by active discipline
  const activeCriteria = criteria.filter((c) => c.discipline === discipline);

  // Helper to match candidate to production
  const matchCandidateToProd = (a: AuditionRegistration, prod: Production | "ALL" | null) => {
    if (!prod || prod === "ALL") return true;
    if (a.productionId && a.productionId === prod.id) return true;
    if (a.productionName && (a.productionName === prod.title || a.productionName.toLowerCase().includes(prod.title.toLowerCase()) || prod.title.toLowerCase().includes(a.productionName.toLowerCase()))) return true;
    if (!a.productionId && !a.productionName && prod.title.includes("Si No Es Ahora")) return true;
    return false;
  };

  // Filter auditions by selected production and search
  const filteredAuditions = auditions.filter((a) => {
    const matchesSearch =
      !searchTerm.trim() ||
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm);

    const matchesProd = matchCandidateToProd(a, selectedProduction);

    return matchesSearch && matchesProd;
  });

  // When selected production changes, set selected audition to first candidate
  const handleSelectProduction = (prod: Production | "ALL") => {
    setSelectedProduction(prod);
    const candidatesForProd = auditions.filter((a) => matchCandidateToProd(a, prod));
    if (candidatesForProd.length > 0) {
      setSelectedAuditionId(candidatesForProd[0].id);
    } else {
      setSelectedAuditionId(null);
    }
  };

  // Find selected audition
  const currentAudition =
    filteredAuditions.find((a) => a.id === selectedAuditionId) ||
    filteredAuditions[0] ||
    null;

  // When selected audition or discipline changes, load existing scores if already scored by this judge
  useEffect(() => {
    if (currentAudition && currentAudition.scores) {
      const existing = currentAudition.scores.find(
        (s) => s.judgeName === judgeName && s.discipline === discipline
      );
      if (existing) {
        setScores(existing.scores || {});
        setJudgeNotes(existing.judgeNotes || "");
      } else {
        const initial: Record<string, number> = {};
        activeCriteria.forEach((c) => {
          initial[c.id] = 8;
        });
        setScores(initial);
        setJudgeNotes("");
      }
    } else {
      const initial: Record<string, number> = {};
      activeCriteria.forEach((c) => {
        initial[c.id] = 8;
      });
      setScores(initial);
      setJudgeNotes("");
    }
    setSavedSuccess(false);
  }, [selectedAuditionId, discipline, judgeName, criteria, currentAudition]);

  // Compute live average
  const currentValues = Object.values(scores);
  const liveAverage =
    currentValues.length > 0
      ? (currentValues.reduce((acc, curr) => acc + (Number(curr) || 0), 0) / currentValues.length).toFixed(1)
      : "0.0";

  const handleScoreChange = (criteriaId: string, val: number) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: val,
    }));
  };

  const handleSaveScore = async () => {
    if (!currentAudition) return;

    setSavingScore(true);
    try {
      const res = await fetch("/api/auditions/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditionId: currentAudition.id,
          judgeName: judgeName.trim(),
          judgeTitle: judgeTitle || "Juez Evaluador",
          discipline,
          scores,
          judgeNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        loadData();
      } else {
        alert(data.error || "Error al guardar calificación.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar puntuación.");
    } finally {
      setSavingScore(false);
    }
  };

  const handleNextAudition = () => {
    const currentIndex = filteredAuditions.findIndex((a) => a.id === selectedAuditionId);
    if (currentIndex !== -1 && currentIndex < filteredAuditions.length - 1) {
      setSelectedAuditionId(filteredAuditions[currentIndex + 1].id);
    }
  };

  const handlePrevAudition = () => {
    const currentIndex = filteredAuditions.findIndex((a) => a.id === selectedAuditionId);
    if (currentIndex > 0) {
      setSelectedAuditionId(filteredAuditions[currentIndex - 1].id);
    }
  };

  // ================= 1. LOGIN SCREEN IF NOT AUTHENTICATED =================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#07070A] text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Return to Admin Bar */}
        <div className="max-w-2xl w-full flex items-center justify-between pb-3 z-10">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-red-950/60 transition-all flex items-center gap-2 border border-red-400/40"
          >
            <span>← 🏠</span>
            <span>Volver al Dashboard de Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/audiciones"
              className="text-xs text-purple-300 hover:text-white font-mono font-bold bg-[#141420] border border-purple-500/30 px-3 py-1.5 rounded-xl transition-colors"
            >
              📊 Ranking
            </Link>
            <Link
              href="/dashboard/usuarios"
              className="text-xs text-slate-300 hover:text-white font-mono bg-[#141420] border border-slate-700 px-3 py-1.5 rounded-xl transition-colors"
            >
              👥 Usuarios
            </Link>
          </div>
        </div>

        <div className="max-w-2xl w-full bg-[#12121A]/95 backdrop-blur-2xl border-2 border-[#28283C] rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 flex flex-col gap-6">
          
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-3xl">⚖️</span>
            <span className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-widest bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
              DV Performing Arts &bull; Portal de Jurado
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              Mesa de Jueces & Calificación en Vivo
            </h1>
            <p className="text-xs text-zinc-400 max-w-md">
              Selecciona tu perfil de docente activo (sincronizado con la academia) o escribe tu nombre como jurado invitado.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5 text-xs">
            {/* WhatsApp Phone & Password Login */}
            <div className="p-4 bg-[#181826] border border-purple-500/30 rounded-2xl flex flex-col gap-3">
              <span className="font-bold text-xs text-purple-300 flex items-center gap-2 font-mono uppercase">
                <span>🔐</span> Iniciar Sesión con Número de WhatsApp
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300">WhatsApp (10 dígitos) o Correo</label>
                  <input
                    type="text"
                    placeholder="Ej. 4771234567 o fanny@..."
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    className="bg-[#101018] border border-[#2E2E44] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300">Contraseña Asignada</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="bg-[#101018] border border-[#2E2E44] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
              >
                {authenticating ? "Autenticando..." : "🔑 Entrar con Credenciales"}
              </button>
            </div>

            {/* Alternative: Select Teacher from Active Database */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#202030]">
              <label className="font-semibold text-zinc-300 flex items-center justify-between">
                <span>👨‍🏫 O selecciona tu perfil directo de docente:</span>
                <span className="text-[10px] font-mono text-purple-400">{teachers.length} Maestros Activos</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {teachers.map((t) => {
                  const isSelected = judgeName === t.fullName;
                  const discLabel = t.defaultDiscipline === "CANTO" ? "🎤 Canto" : t.defaultDiscipline === "COREOGRAFIA" ? "💃 Danza" : "🎭 Actuación";

                  return (
                    <button
                      key={t.id || t.fullName}
                      type="button"
                      onClick={() => selectTeacherPreset(t)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-950/50"
                          : "bg-[#1A1A26] border-[#2A2A3E] text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                        {t.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={t.imageUrl} alt={t.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">👨‍🏫</div>
                        )}
                      </div>

                      <div className="flex flex-col truncate">
                        <span className="font-bold text-xs text-white truncate">{t.fullName}</span>
                        <span className="text-[10px] text-amber-400 font-mono font-semibold">{discLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discipline Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-300">
                Disciplina / Mesa Evaluadora a Calificar:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "CANTO", label: "🎤 Canto", desc: "Técnica Vocal" },
                  { id: "COREOGRAFIA", label: "💃 Danza", desc: "Expresión Corporal" },
                  { id: "ACTUACION", label: "🎭 Actuación", desc: "Texto & Escena" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDiscipline(d.id as EvaluationDiscipline)}
                    className={`py-3 px-2 rounded-xl border font-bold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      discipline === d.id
                        ? "bg-gradient-to-b from-purple-600 to-rose-600 border-rose-400 text-white shadow-lg shadow-purple-950/50"
                        : "bg-[#181824] border-[#2E2E44] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <span className="text-sm">{d.label}</span>
                    <span className="text-[9px] font-mono text-zinc-300 opacity-80">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enter Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:from-purple-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-rose-950/60 transition-all cursor-pointer mt-1"
            >
              🚀 Continuar al Panel de Evaluación
            </button>

            <div className="text-center pt-3 border-t border-[#202030] flex flex-wrap items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 bg-[#1F242C] hover:bg-[#2A313C] text-slate-200 hover:text-white border border-[#3A4350] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>🏠</span>
                <span>Dashboard Principal</span>
              </Link>

              <Link
                href="/dashboard/audiciones"
                className="px-3.5 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>📊</span>
                <span>Ranking General</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ================= 2. PRODUCTION SELECTION CARDS =================
  if (!selectedProduction) {
    return (
      <div className="min-h-screen bg-[#07070A] text-white flex flex-col font-sans">
        <header className="bg-[#12121A] border-b border-[#242436] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white">{judgeName}</span>
                <span className="text-xs font-mono bg-purple-900/60 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  {judgeTitle || "Juez Evaluador"}
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Mesa: <strong className="text-amber-400">{discipline === "CANTO" ? "🎤 Canto" : discipline === "COREOGRAFIA" ? "💃 Danza" : "🎭 Actuación"}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-[#202030] hover:bg-[#2C2C40] text-zinc-300 border border-[#303046] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              🔄 Cerrar Sesión
            </button>
            <Link
              href="/dashboard/audiciones"
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors"
            >
              📊 Ver Ranking General
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold bg-purple-950/60 border border-purple-500/30 px-3.5 py-1 rounded-full">
              Paso 1 &bull; Selección de Producción
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
              ¿Qué Obra o Montaje vas a Calificar Hoy?
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Haz clic en la card de la producción para desplegar de inmediato a todo el alumnado registrado para esa audición.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productions.map((prod) => {
              const candidateCount = auditions.filter((a) => matchCandidateToProd(a, prod)).length;
              return (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduction(prod)}
                  className="group bg-[#12121A] hover:bg-[#181824] border-2 border-[#262638] hover:border-purple-500 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                    {prod.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎭</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121A] via-transparent to-black/30" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {prod.isAuditionActive ? (
                        <span className="px-3 py-1 bg-emerald-600/90 backdrop-blur-md text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">● Convocatoria Activa</span>
                      ) : (
                        <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-zinc-400 font-mono text-[10px] uppercase rounded-full">En Cartelera</span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1 bg-purple-600 text-white font-mono text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5">
                        <span>👥</span>
                        <span>{candidateCount} Aspirantes</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors">{prod.title}</h2>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{prod.synopsis || "Producción oficial de teatro musical y formación escénica de DV Performing Arts."}</p>
                    </div>
                    <div className="pt-4 border-t border-[#202030] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">Dirección:</span>
                        <span className="text-xs font-bold text-zinc-300">{prod.director || "Diego Vieyra"}</span>
                      </div>
                      <button type="button" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all">Calificar →</button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div
              onClick={() => handleSelectProduction("ALL")}
              className="group bg-[#12121A] hover:bg-[#181824] border-2 border-dashed border-[#303046] hover:border-purple-400 rounded-3xl p-6 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-xl"
            >
              <div className="flex flex-col items-center gap-3 my-auto">
                <span className="text-5xl group-hover:scale-110 transition-transform">🌟</span>
                <h2 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">Ver Todas las Producciones</h2>
                <p className="text-xs text-zinc-400 max-w-xs">Despliega a todos los aspirantes de la academia ({auditions.length} registrados) sin filtro de obra.</p>
              </div>
              <div className="w-full pt-4 border-t border-[#202030]">
                <button type="button" className="w-full py-2.5 bg-[#202030] group-hover:bg-purple-600 text-zinc-200 group-hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                  Abrir Lista Global ({auditions.length}) →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= 3. ACTIVE JUDGE EVALUATION CONSOLE =================
  const activeProdTitle =
    selectedProduction === "ALL"
      ? "Todas las Producciones"
      : selectedProduction.title;

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col font-sans">
      
      {/* Top Judge Bar */}
      <header className="bg-[#12121A] border-b border-[#242436] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        
        {/* Judge & Active Production Badge */}
        <div className="flex items-center gap-3">
          {/* Main Dashboard Link (only for admins/editors) */}
          {currentUser?.role !== "DOCENTE_JUEZ" && (
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white border border-red-400/50 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-red-950/60 shrink-0 cursor-pointer"
            >
              <span>← 🏠</span>
              <span>Dashboard Admin</span>
            </Link>
          )}

          <span className="text-2xl">⚖️</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white">{judgeName}</span>
              <span className="text-[10px] font-mono bg-purple-900/60 text-purple-300 border border-purple-500/40 px-2 py-0.2 rounded font-bold">
                {judgeTitle || "Juez"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span>Mesa:</span>
              <span className="font-bold text-amber-400">
                {discipline === "CANTO" ? "🎤 Canto" : discipline === "COREOGRAFIA" ? "💃 Coreografía" : "🎭 Actuación"}
              </span>
              <span>&bull;</span>
              <span className="text-purple-300 font-bold">🎭 Obra: {activeProdTitle}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Switch Production Card Button */}
          <button
            onClick={() => setSelectedProduction(null)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-900/80 to-rose-900/80 hover:from-purple-800 hover:to-rose-800 text-white border border-purple-500/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>🎭 Cambiar de Obra</span>
          </button>

          {/* Quick Discipline Switcher */}
          <div className="flex bg-[#1A1A28] border border-[#2B2B3E] rounded-xl p-1 text-xs">
            {(["CANTO", "COREOGRAFIA", "ACTUACION"] as EvaluationDiscipline[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiscipline(d)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  discipline === d ? "bg-purple-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {d === "CANTO" ? "🎤 Canto" : d === "COREOGRAFIA" ? "💃 Danza" : "🎭 Actuación"}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-[#202030] hover:bg-[#2C2C40] text-zinc-300 border border-[#303046] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            🔄 {currentUser?.role === "DOCENTE_JUEZ" ? "Cerrar Sesión" : "Cambiar Juez"}
          </button>

          <Link
            href="/dashboard/audiciones"
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors"
          >
            📊 Ranking
          </Link>
        </div>
      </header>

      {/* Main Scoring Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* Left Column: Candidates List for this Production (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 bg-[#101018] border border-[#222232] rounded-3xl p-4 h-[calc(100vh-140px)] overflow-hidden">
          
          <div className="flex flex-col gap-2 pb-2 border-b border-[#222232]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 font-mono">
                Alumnos en Lista ({filteredAuditions.length})
              </span>
              <button
                onClick={() => setSelectedProduction(null)}
                className="text-[10px] font-mono text-purple-400 hover:underline"
              >
                Cambiar Obra ↗
              </button>
            </div>

            <input
              type="text"
              placeholder="Filtro rápido por folio o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#181824] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
          </div>

          {/* List of Candidates */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredAuditions.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2">
                <span>No hay aspirantes registrados para esta obra.</span>
                <button
                  onClick={() => setSelectedProduction(null)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold mt-2"
                >
                  Seleccionar otra obra
                </button>
              </div>
            ) : (
              filteredAuditions.map((aud) => {
                const isSelected = aud.id === currentAudition?.id;
                const hasMyScore = aud.scores?.some(
                  (s) => s.judgeName === judgeName && s.discipline === discipline
                );

                return (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setSelectedAuditionId(aud.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer relative ${
                      isSelected
                        ? "bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/60"
                        : "bg-[#14141E] border-[#222230] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-purple-300 bg-black/40 px-2 py-0.5 rounded border border-purple-500/30">
                        {aud.folio}
                      </span>
                      {hasMyScore ? (
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                          ✓ Calificado
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-black/50 border border-[#303046] shrink-0 flex items-center justify-center">
                        {aud.headshotUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={aud.headshotUrl}
                            alt={aud.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">👤</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-white truncate">{aud.fullName}</span>
                        <span className="text-[10px] text-zinc-400 truncate">
                          {aud.programName || "Teatro Musical"} &bull; {aud.phone}
                        </span>
                      </div>
                    </div>

                    {aud.overallScore !== undefined && aud.overallScore > 0 && (
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] font-mono text-amber-400">
                        <span>Puntaje Global:</span>
                        <span className="font-black">⭐ {aud.overallScore}/10</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Scoring Console (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {currentAudition ? (
            <div className="bg-[#12121A] border-2 border-[#28283C] rounded-3xl p-5 sm:p-7 flex flex-col gap-6 shadow-2xl">
              
              {/* Candidate Info Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#242436]">
                <div className="flex items-center gap-4">
                  {/* Candidate Headshot */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-purple-500/70 shrink-0 shadow-lg flex items-center justify-center">
                    {currentAudition.headshotUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={currentAudition.headshotUrl}
                        alt={currentAudition.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded-lg font-black">
                        {currentAudition.folio}
                      </span>
                      <span className="text-zinc-400">&bull;</span>
                      <span className="text-zinc-300">{currentAudition.phone}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">
                      {currentAudition.fullName}
                    </h2>
                    <p className="text-xs text-rose-400 font-bold">
                      🎭 Obra: {currentAudition.productionName || "Si No Es Ahora (El Musical)"} &bull; {currentAudition.programName}
                    </p>
                  </div>
                </div>

                {/* Live Average Score Display */}
                <div className={`bg-black/60 border-2 px-5 py-3 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg ${
                  Number(liveAverage) >= 8
                    ? "border-emerald-500/60 shadow-emerald-950/40"
                    : Number(liveAverage) >= 5
                    ? "border-yellow-500/60 shadow-yellow-950/40"
                    : "border-red-500/60 shadow-red-950/40"
                }`}>
                  <span className="text-[10px] font-mono uppercase text-zinc-300 font-bold tracking-wider">
                    Promedio en {discipline}
                  </span>
                  <span className={`text-3xl font-black font-mono mt-0.5 ${
                    Number(liveAverage) >= 8
                      ? "text-emerald-400"
                      : Number(liveAverage) >= 5
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}>
                    {liveAverage} <span className="text-sm text-zinc-400">/ 10</span>
                  </span>
                </div>
              </div>

              {/* Other Judges Existing Scores Badges (Cross-Discipline Correlation) */}
              {currentAudition.scores && currentAudition.scores.length > 0 && (
                <div className="p-3.5 bg-[#181824] border border-[#2C2C40] rounded-2xl flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                    📋 Evaluaciones registradas por el jurado para este aspirante:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentAudition.scores.map((sc) => (
                      <div
                        key={sc.id}
                        className="px-3 py-1.5 bg-[#0E0E14] border border-purple-500/30 rounded-xl text-xs flex items-center gap-2 font-mono"
                      >
                        <span className="font-bold text-white">
                          {sc.discipline === "CANTO" ? "🎤" : sc.discipline === "COREOGRAFIA" ? "💃" : "🎭"} {sc.judgeName}:
                        </span>
                        <span className={`font-black ${
                          sc.averageScore >= 8
                            ? "text-emerald-400"
                            : sc.averageScore >= 5
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}>{sc.averageScore} / 10</span>
                        {sc.judgeNotes && (
                          <span className="text-[10px] text-zinc-400 italic truncate max-w-[150px]">
                            "{sc.judgeNotes}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rubric Criteria Sliders / Quick Buttons */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>📐</span> Rúbrica de {discipline} (Evaluar de 0 a 10 cada rubro):
                </h3>

                <div className="flex flex-col gap-3.5">
                  {activeCriteria.map((c) => {
                    const currentScore = scores[c.id] !== undefined ? scores[c.id] : 8;
                    return (
                      <div
                        key={c.id}
                        className="p-4 bg-[#181824] border border-[#28283C] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">{c.name}</span>
                          {c.description && (
                            <span className="text-[11px] text-zinc-400 mt-0.5">{c.description}</span>
                          )}
                        </div>

                        {/* Quick 0-10 Buttons (Rojo a Amarillo 0-7, Verde 8-10) */}
                        <div className="flex items-center gap-1 overflow-x-auto py-1">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                            const isSelected = currentScore === num;

                            let btnStyle = "bg-[#222232] text-zinc-400 hover:text-white hover:bg-[#303046]";
                            if (isSelected) {
                              if (num === 10) {
                                btnStyle = "bg-emerald-400 text-black font-black scale-115 shadow-xl shadow-emerald-400/50 ring-2 ring-emerald-300";
                              } else if (num === 9) {
                                btnStyle = "bg-emerald-500 text-white font-black scale-110 shadow-lg shadow-emerald-500/40";
                              } else if (num === 8) {
                                btnStyle = "bg-emerald-600 text-white font-black scale-110 shadow-md shadow-emerald-700/40";
                              } else if (num === 7) {
                                btnStyle = "bg-yellow-400 text-black font-black scale-110 shadow-lg shadow-yellow-400/40";
                              } else if (num === 6) {
                                btnStyle = "bg-yellow-500 text-black font-black scale-110 shadow-md shadow-yellow-500/40";
                              } else if (num === 5) {
                                btnStyle = "bg-amber-500 text-white font-black scale-110 shadow-md shadow-amber-500/40";
                              } else if (num >= 3) {
                                btnStyle = "bg-rose-500 text-white font-black scale-110 shadow-md shadow-rose-600/40";
                              } else {
                                btnStyle = "bg-red-600 text-white font-black scale-110 shadow-md shadow-red-700/50";
                              }
                            }

                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleScoreChange(c.id, num)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 ${btnStyle}`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Private Judge Qualitative Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs text-zinc-300 flex items-center gap-1.5">
                  <span>📝</span> Observaciones Privadas del Juez ({judgeName}):
                </label>
                <textarea
                  rows={3}
                  placeholder="Escribe comentarios cualitativos, fortalezas, tesitura, potencial para personajes específicos..."
                  value={judgeNotes}
                  onChange={(e) => setJudgeNotes(e.target.value)}
                  className="bg-[#181824] border border-[#2E2E44] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#242436]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevAudition}
                    className="px-4 py-2.5 bg-[#202030] hover:bg-[#2C2C40] text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={handleNextAudition}
                    className="px-4 py-2.5 bg-[#202030] hover:bg-[#2C2C40] text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Siguiente Aspirante →
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {savedSuccess && (
                    <span className="text-xs font-bold text-emerald-400 animate-bounce flex items-center gap-1">
                      <span>✓</span> ¡Calificación Guardada!
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={savingScore}
                    onClick={handleSaveScore}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/60 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingScore ? "Guardando..." : "💾 Guardar Calificación"}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#12121A] border-2 border-[#28283C] rounded-3xl p-12 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-3">
              <span>No hay aspirantes registrados para esta producción.</span>
              <button
                onClick={() => setSelectedProduction(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Ver otras producciones
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
