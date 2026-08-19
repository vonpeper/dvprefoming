"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuditionRegistration, EvaluationCriteria, EvaluationDiscipline, AuditionScore } from "@/types/mock";

const DEFAULT_JUDGES = [
  { name: "Diego Vieyra", title: "Director General & Artístico" },
  { name: "Fanny Monroy", title: "Directora Vocal & Canto" },
  { name: "Andrés Rodríguez", title: "Coreógrafo & Director de Danza" },
  { name: "Angel Piedra", title: "Docente de Actuación & Texto" },
  { name: "Carolina Torres", title: "Docente de Expresión Corporal" },
];

export default function JudgesPortalPage() {
  // Session State
  const [judgeName, setJudgeName] = useState("");
  const [judgeTitle, setJudgeTitle] = useState("");
  const [discipline, setDiscipline] = useState<EvaluationDiscipline>("CANTO");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Data State
  const [auditions, setAuditions] = useState<AuditionRegistration[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuditionId, setSelectedAuditionId] = useState<string | null>(null);

  // Live Scoring Form State
  const [scores, setScores] = useState<Record<string, number>>({});
  const [judgeNotes, setJudgeNotes] = useState("");
  const [savingScore, setSavingScore] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load criteria and auditions
  const loadData = async () => {
    setLoading(true);
    try {
      const [critRes, audRes] = await Promise.all([
        fetch("/api/auditions/criteria"),
        fetch("/api/auditions/list"),
      ]);

      const critData = await critRes.json();
      const audData = await audRes.json();

      if (critData?.criteria) setCriteria(critData.criteria);
      if (audData?.registrations) {
        setAuditions(audData.registrations);
        if (!selectedAuditionId && audData.registrations.length > 0) {
          setSelectedAuditionId(audData.registrations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Check saved session in local storage
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeName.trim()) {
      alert("Por favor selecciona o ingresa tu nombre de docente.");
      return;
    }
    const session = { name: judgeName.trim(), title: judgeTitle, discipline };
    localStorage.setItem("dv_judge_session", JSON.stringify(session));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("dv_judge_session");
    setIsLoggedIn(false);
  };

  // Filter criteria by active discipline
  const activeCriteria = criteria.filter((c) => c.discipline === discipline);

  // Find selected audition
  const currentAudition = auditions.find((a) => a.id === selectedAuditionId) || auditions[0];

  // When selected audition changes or discipline changes, load existing scores if already scored by this judge
  useEffect(() => {
    if (currentAudition && currentAudition.scores) {
      const existing = currentAudition.scores.find(
        (s) => s.judgeName === judgeName && s.discipline === discipline
      );
      if (existing) {
        setScores(existing.scores || {});
        setJudgeNotes(existing.judgeNotes || "");
      } else {
        // Default initial scores empty or 8
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
  }, [selectedAuditionId, discipline, judgeName, criteria]);

  // Compute live average
  const currentValues = Object.values(scores);
  const liveAverage =
    currentValues.length > 0
      ? (currentValues.reduce((acc, curr) => acc + (Number(curr) || 0), 0) / currentValues.length).toFixed(1)
      : "0.0";

  const handleSaveScore = async () => {
    if (!currentAudition) return;

    setSavingScore(true);
    try {
      const res = await fetch("/api/auditions/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditionId: currentAudition.id,
          judgeName,
          judgeTitle,
          discipline,
          scores,
          judgeNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        // Refresh local list
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
    const currentIndex = auditions.findIndex((a) => a.id === selectedAuditionId);
    if (currentIndex !== -1 && currentIndex < auditions.length - 1) {
      setSelectedAuditionId(auditions[currentIndex + 1].id);
    }
  };

  const handlePrevAudition = () => {
    const currentIndex = auditions.findIndex((a) => a.id === selectedAuditionId);
    if (currentIndex > 0) {
      setSelectedAuditionId(auditions[currentIndex - 1].id);
    }
  };

  // Filter list
  const filteredAuditions = auditions.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.folio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper score color
  const getScoreColor = (val: number) => {
    if (val >= 9) return "bg-amber-400 text-black border-amber-300 font-black shadow-lg shadow-amber-400/30";
    if (val >= 7) return "bg-emerald-600 text-white border-emerald-400 font-bold";
    if (val >= 5) return "bg-orange-500 text-white border-orange-400";
    return "bg-rose-600 text-white border-rose-400";
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* TOP BRAND BAR */}
      <header className="bg-[#0D1117] border-b border-[#30363D] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🎭</span>
            <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
              DV Performing Arts
            </span>
          </Link>
          <span className="hidden sm:inline text-slate-600 text-xs font-mono">/</span>
          <span className="bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Panel de Jueces &bull; Casting en Vivo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/audiciones"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>📊 Ver Ranking General</span>
          </Link>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-xs bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-3 py-1.5 rounded-lg border border-[#30363D] transition-colors"
            >
              Cambiar Juez
            </button>
          )}
        </div>
      </header>

      {/* ================= STEP 1: JUDGE LOGIN MODAL ================= */}
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-[#161B22] border-2 border-[#30363D] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-rose-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-950/60 mb-1">
                ⭐
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Acceso para Jueces & Docentes
              </h1>
              <p className="text-xs text-slate-400">
                Selecciona tu nombre y la mesa de disciplina que vas a calificar durante las audiciones.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Judge Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">Selecciona tu Nombre de Docente:</label>
                <div className="grid grid-cols-1 gap-2">
                  {DEFAULT_JUDGES.map((j) => (
                    <button
                      key={j.name}
                      type="button"
                      onClick={() => {
                        setJudgeName(j.name);
                        setJudgeTitle(j.title);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        judgeName === j.name
                          ? "bg-purple-950/70 border-purple-400 text-white shadow-md shadow-purple-950/40"
                          : "bg-[#0D1117] border-[#30363D] text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{j.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{j.title}</span>
                      </div>
                      {judgeName === j.name && <span className="text-purple-400 font-bold">✓</span>}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-500">O escribe otro nombre:</span>
                  <input
                    type="text"
                    placeholder="Nombre del juez invitado..."
                    value={judgeName}
                    onChange={(e) => {
                      setJudgeName(e.target.value);
                      setJudgeTitle("Juez Invitado");
                    }}
                    className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-1 text-xs text-white"
                  />
                </div>
              </div>

              {/* Discipline Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">Mesa / Disciplina a Evaluar:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscipline("CANTO")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      discipline === "CANTO"
                        ? "bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-950/50"
                        : "bg-[#0D1117] border-[#30363D] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-xl">🎤</span>
                    <span className="text-xs font-bold">Canto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDiscipline("COREOGRAFIA")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      discipline === "COREOGRAFIA"
                        ? "bg-rose-600 border-rose-400 text-white font-bold shadow-lg shadow-rose-950/50"
                        : "bg-[#0D1117] border-[#30363D] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-xl">💃</span>
                    <span className="text-xs font-bold">Coreografía</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDiscipline("ACTUACION")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      discipline === "ACTUACION"
                        ? "bg-amber-600 border-amber-400 text-white font-bold shadow-lg shadow-amber-950/50"
                        : "bg-[#0D1117] border-[#30363D] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-xl">🎭</span>
                    <span className="text-xs font-bold">Actuación</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer mt-2"
              >
                Ingresar a la Mesa de Evaluación ➔
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ================= STEP 2: LIVE SCORING CONSOLE ================= */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT SIDEBAR: CANDIDATES QUEUE (4 COLS) */}
          <aside className="w-full lg:w-80 lg:min-w-[320px] bg-[#0D1117] border-r border-[#30363D] flex flex-col h-auto lg:h-[calc(100vh-61px)]">
            
            {/* Active Judge Status Card */}
            <div className="p-4 border-b border-[#30363D] bg-[#161B22] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-lg">
                  {discipline === "CANTO" ? "🎤" : discipline === "COREOGRAFIA" ? "💃" : "🎭"}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block truncate">{judgeName}</span>
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                    Mesa: {discipline}
                  </span>
                </div>
              </div>

              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                EN VIVO
              </span>
            </div>

            {/* Search and Candidate Count */}
            <div className="p-3 border-b border-[#30363D] flex flex-col gap-2">
              <input
                type="text"
                placeholder="🔍 Buscar por Folio o Nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
                <span>{filteredAuditions.length} Aspirantes registrados</span>
                <span>{auditions.filter((a) => a.scores?.some((s) => s.judgeName === judgeName && s.discipline === discipline)).length} calificados por ti</span>
              </div>
            </div>

            {/* Candidate List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 max-h-[35vh] lg:max-h-none">
              {loading ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs animate-pulse">
                  Cargando lista de aspirantes...
                </div>
              ) : filteredAuditions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No se encontraron aspirantes.
                </div>
              ) : (
                filteredAuditions.map((aud) => {
                  const isSelected = aud.id === (currentAudition?.id || "");
                  const scoredByMe = aud.scores?.find(
                    (s) => s.judgeName === judgeName && s.discipline === discipline
                  );

                  return (
                    <button
                      key={aud.id}
                      onClick={() => setSelectedAuditionId(aud.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-purple-950/80 border-purple-400 text-white shadow-md shadow-purple-950/50"
                          : "bg-[#161B22] border-[#30363D] hover:border-slate-500 text-slate-300"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 overflow-hidden pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[11px] text-purple-300">
                            {aud.folio}
                          </span>
                          {aud.assignedRole && (
                            <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded border border-amber-400/30 font-bold">
                              {aud.assignedRole}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-white truncate">{aud.fullName}</span>
                        <span className="text-[10px] text-slate-400 truncate">{aud.productionName || "Si No Es Ahora"}</span>
                      </div>

                      {scoredByMe ? (
                        <div className="flex flex-col items-end shrink-0">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-black">
                            ⭐ {scoredByMe.averageScore}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-mono mt-0.5">Listo ✓</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 bg-[#0D1117] px-2 py-0.5 rounded border border-[#30363D]">
                          Pendiente
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* MAIN SCORING CONSOLE (8 COLS) */}
          <main className="flex-1 bg-[#07070A] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto lg:h-[calc(100vh-61px)]">
            
            {currentAudition ? (
              <>
                {/* Candidate Header Profile Banner */}
                <div className="bg-gradient-to-r from-purple-950/40 via-[#161B22] to-[#161B22] border-2 border-purple-500/50 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black border-2 border-purple-400/60 flex items-center justify-center text-2xl font-mono text-purple-300 font-black shadow">
                      {currentAudition.folio.slice(-3) || "DV"}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs bg-purple-600 text-white px-2 py-0.5 rounded font-bold">
                          {currentAudition.folio}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {currentAudition.programName || "Teatro Musical"}
                        </span>
                        {currentAudition.assignedRole && (
                          <span className="bg-amber-400 text-black px-2 py-0.5 rounded text-xs font-black uppercase">
                            🎭 Rol: {currentAudition.assignedRole}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {currentAudition.fullName}
                      </h2>

                      <span className="text-xs text-purple-300 font-medium">
                        Obra postulada: <strong>{currentAudition.productionName || "Si No Es Ahora"}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Live Average Pill */}
                  <div className="flex items-center gap-4 bg-[#0D1117] border-2 border-purple-500/60 rounded-2xl p-4 shadow-inner shrink-0">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono uppercase text-purple-300 font-bold">
                        Promedio en {discipline}
                      </span>
                      <span className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                        <span>{liveAverage}</span>
                        <span className="text-sm font-mono text-slate-500">/ 10</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidate Notes / Experience Preview */}
                {currentAudition.experienceNotes && (
                  <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-sm">📝</span>
                    <div>
                      <strong className="text-white">Experiencia previa declarada: </strong>
                      <span>{currentAudition.experienceNotes}</span>
                    </div>
                  </div>
                )}

                {/* ================= RUBRICS SCORING CARDS ================= */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>📊</span>
                      <span>Rúbrica de Evaluación &bull; Mesa de {discipline} ({activeCriteria.length} Criterios)</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Escala de 0 (Deficiente) a 10 (Sobresaliente)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeCriteria.map((crit, idx) => {
                      const currentVal = scores[crit.id] !== undefined ? scores[crit.id] : 8;

                      return (
                        <div
                          key={crit.id}
                          className="bg-[#161B22] border border-[#30363D] hover:border-purple-500/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-purple-400 font-bold">#{idx + 1}</span>
                                <h4 className="text-sm font-bold text-white">{crit.name}</h4>
                              </div>
                              {crit.description && (
                                <p className="text-[11px] text-slate-400 mt-0.5">{crit.description}</p>
                              )}
                            </div>

                            {/* Score Display */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <span className="text-xs text-slate-400 font-mono">Puntaje:</span>
                              <span
                                className={`text-sm px-3 py-1 rounded-xl font-mono border ${getScoreColor(
                                  currentVal
                                )}`}
                              >
                                {currentVal} / 10
                              </span>
                            </div>
                          </div>

                          {/* Quick 0 - 10 Score Selector Buttons */}
                          <div className="grid grid-cols-11 gap-1 sm:gap-1.5 mt-1">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                              const isSelected = currentVal === num;
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setScores({ ...scores, [crit.id]: num })}
                                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                                    isSelected
                                      ? num === 10
                                        ? "bg-amber-400 text-black border-2 border-amber-300 font-black shadow-lg scale-105"
                                        : num >= 8
                                        ? "bg-emerald-500 text-white border-2 border-emerald-300 font-black shadow-lg scale-105"
                                        : num >= 5
                                        ? "bg-orange-500 text-white border-2 border-orange-300 scale-105"
                                        : "bg-rose-600 text-white border-2 border-rose-300 scale-105"
                                      : "bg-[#0D1117] border border-[#30363D] text-slate-300 hover:bg-[#21262D] hover:text-white"
                                  }`}
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

                {/* Judge Private Notes */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex flex-col gap-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>📝</span>
                    <span>Observaciones Privadas del Jurado para este Aspirante:</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Gran afinación, excelente colocación en agudos. Sugiero para personaje de Benny..."
                    value={judgeNotes}
                    onChange={(e) => setJudgeNotes(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none font-sans"
                  />
                </div>

                {/* ACTION BAR: SAVE & NAVIGATION */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevAudition}
                      className="px-3 py-2 bg-[#0D1117] hover:bg-[#21262D] text-slate-300 border border-[#30363D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      ◀ Anterior
                    </button>
                    <button
                      type="button"
                      onClick={handleNextAudition}
                      className="px-3 py-2 bg-[#0D1117] hover:bg-[#21262D] text-slate-300 border border-[#30363D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Siguiente ▶
                    </button>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {savedSuccess && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-bounce">
                        <span>✓</span> Calificación registrada con éxito
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveScore}
                      disabled={savingScore}
                      className="flex-1 sm:flex-initial px-6 py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingScore ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <span>💾 Guardar Calificación ({liveAverage})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm">
                Selecciona un aspirante para comenzar a calificar.
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
