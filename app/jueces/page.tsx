"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AuditionRegistration,
  EvaluationCriteria,
  EvaluationDiscipline,
  Production,
} from "@/types/mock";

const DEFAULT_JUDGES = [
  { name: "Diego Vieyra", title: "Director General & Artístico", defaultDiscipline: "CANTO" as EvaluationDiscipline },
  { name: "Fanny Monroy", title: "Directora Vocal & Maestra de Canto", defaultDiscipline: "CANTO" as EvaluationDiscipline },
  { name: "Andrés Rodríguez", title: "Coreógrafo & Director de Danza", defaultDiscipline: "COREOGRAFIA" as EvaluationDiscipline },
  { name: "Angel Piedra", title: "Docente de Actuación & Texto Teatral", defaultDiscipline: "ACTUACION" as EvaluationDiscipline },
  { name: "Carolina Torres", title: "Docente de Expresión Corporal & Danza", defaultDiscipline: "COREOGRAFIA" as EvaluationDiscipline },
];

export default function JudgesPortalPage() {
  // Session State
  const [judgeName, setJudgeName] = useState("");
  const [judgeTitle, setJudgeTitle] = useState("");
  const [discipline, setDiscipline] = useState<EvaluationDiscipline>("CANTO");
  const [selectedProductionId, setSelectedProductionId] = useState<string>("ALL");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Data State
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

  // Load criteria, auditions, and productions
  const loadData = async () => {
    setLoading(true);
    try {
      const [critRes, audRes, prodRes] = await Promise.all([
        fetch("/api/auditions/criteria"),
        fetch("/api/auditions/list"),
        fetch("/api/productions"),
      ]);

      const critData = await critRes.json();
      const audData = await audRes.json();
      const prodData = await prodRes.json();

      if (critData?.criteria) setCriteria(critData.criteria);
      if (prodData?.productions) setProductions(prodData.productions);

      const audList: AuditionRegistration[] = audData?.auditions || audData?.registrations || [];
      setAuditions(audList);

      if (!selectedAuditionId && audList.length > 0) {
        setSelectedAuditionId(audList[0].id);
      }
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
          if (parsed.productionId) setSelectedProductionId(parsed.productionId);
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
      alert("Por favor selecciona o escribe tu nombre de docente.");
      return;
    }
    const session = {
      name: judgeName.trim(),
      title: judgeTitle || "Juez Evaluador",
      discipline,
      productionId: selectedProductionId,
    };
    localStorage.setItem("dv_judge_session", JSON.stringify(session));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("dv_judge_session");
    setIsLoggedIn(false);
  };

  const selectJudgePreset = (preset: typeof DEFAULT_JUDGES[0]) => {
    setJudgeName(preset.name);
    setJudgeTitle(preset.title);
    setDiscipline(preset.defaultDiscipline);
  };

  // Filter criteria by active discipline
  const activeCriteria = criteria.filter((c) => c.discipline === discipline);

  // Filter auditions by search and production
  const filteredAuditions = auditions.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm);

    const matchesProd =
      selectedProductionId === "ALL" ||
      a.productionId === selectedProductionId ||
      a.productionName === selectedProductionId;

    return matchesSearch && matchesProd;
  });

  // Find selected audition
  const currentAudition =
    filteredAuditions.find((a) => a.id === selectedAuditionId) ||
    filteredAuditions[0] ||
    auditions[0];

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

  // ================= RENDER: LOGIN SCREEN IF NOT AUTHENTICATED =================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#07070A] text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full bg-[#12121A]/95 backdrop-blur-2xl border-2 border-[#28283C] rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 flex flex-col gap-6">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-3xl">⚖️</span>
            <span className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-widest bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
              DV Performing Arts &bull; Portal de Jurado
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              Mesa de Jueces & Calificación en Vivo
            </h1>
            <p className="text-xs text-zinc-400 max-w-md">
              Ingresa con tu perfil docente o juez invitado y selecciona tu disciplina de evaluación para calificar las audiciones en tiempo real.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5 text-xs">
            
            {/* Preset Teachers Chips */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-zinc-300">
                Selecciona tu perfil de docente o ingresa tu nombre:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_JUDGES.map((j) => (
                  <button
                    key={j.name}
                    type="button"
                    onClick={() => selectJudgePreset(j)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                      judgeName === j.name
                        ? "bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-950/50"
                        : "bg-[#1A1A26] border-[#2A2A3E] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <span className="font-bold text-xs">{j.name}</span>
                    <span className="text-[10px] text-zinc-400 truncate">{j.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Name & Title Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-zinc-300">Nombre del Juez</label>
                <input
                  type="text"
                  placeholder="Ej. Mtro. Juan Pérez"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  className="bg-[#181824] border border-[#2E2E44] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-zinc-300">Título / Cargo</label>
                <input
                  type="text"
                  placeholder="Ej. Jurado Invitado de Canto"
                  value={judgeTitle}
                  onChange={(e) => setJudgeTitle(e.target.value)}
                  className="bg-[#181824] border border-[#2E2E44] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Discipline Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-300">
                Disciplina / Mesa Evaluadora a Calificar:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "CANTO", label: "🎤 Canto", desc: "Voz y afinación" },
                  { id: "COREOGRAFIA", label: "💃 Danza", desc: "Coreo y ritmo" },
                  { id: "ACTUACION", label: "🎭 Actuación", desc: "Texto y escena" },
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

            {/* Target Production Filter */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-zinc-300">
                Obra / Montaje a Evaluar (Opcional):
              </label>
              <select
                value={selectedProductionId}
                onChange={(e) => setSelectedProductionId(e.target.value)}
                className="bg-[#181824] border border-[#2E2E44] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
              >
                <option value="ALL">🌟 Todas las Obras / Montajes</option>
                {productions.map((p) => (
                  <option key={p.id} value={p.id}>
                    🎭 {p.title} {p.isAuditionActive ? " (Convocatoria Activa)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Enter Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:from-purple-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-rose-950/60 transition-all cursor-pointer mt-2"
            >
              🚀 Entrar a Mesa de Calificación
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#202030]">
            <Link
              href="/dashboard/audiciones"
              className="text-xs text-zinc-500 hover:text-white transition-colors font-mono"
            >
              ← Ir al Panel de Control de Administrador
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER: ACTIVE JUDGE EVALUATION CONSOLE =================
  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col font-sans">
      
      {/* Top Judge Bar */}
      <header className="bg-[#12121A] border-b border-[#242436] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
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
              <span>Obra: {selectedProductionId === "ALL" ? "Todas" : productions.find(p => p.id === selectedProductionId)?.title || "General"}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-[#1A1A28] border border-[#2B2B3E] rounded-xl p-1 text-xs">
            {(["CANTO", "COREOGRAFIA", "ACTUACION"] as EvaluationDiscipline[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiscipline(d)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
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
            🔄 Cambiar Juez
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
        
        {/* Left Column: Candidates Selector (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 bg-[#101018] border border-[#222232] rounded-3xl p-4 h-[calc(100vh-140px)] overflow-hidden">
          
          <div className="flex flex-col gap-2 pb-2 border-b border-[#222232]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
                Aspirantes ({filteredAuditions.length})
              </span>
              <span className="text-[10px] font-mono text-purple-400">
                {selectedProductionId === "ALL" ? "Todas las Obras" : "Filtrado por Obra"}
              </span>
            </div>

            <input
              type="text"
              placeholder="Buscar por folio, nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#181824] border border-[#28283C] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
          </div>

          {/* List of Candidates */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredAuditions.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                No hay aspirantes registrados con los filtros activos.
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
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer relative ${
                      isSelected
                        ? "bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/60"
                        : "bg-[#14141E] border-[#222230] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-purple-300">
                        {aud.folio}
                      </span>
                      {hasMyScore ? (
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                          ✓ Calificado
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>

                    <span className="font-bold text-sm text-white truncate">{aud.fullName}</span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {aud.productionName || "Si No Es Ahora"} &bull; {aud.programName}
                    </span>

                    {aud.overallScore !== undefined && aud.overallScore > 0 && (
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-amber-400">
                        <span>Puntaje Jurado:</span>
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
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded font-black">
                      {currentAudition.folio}
                    </span>
                    <span className="text-zinc-400">&bull;</span>
                    <span className="text-zinc-400">{currentAudition.phone}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {currentAudition.fullName}
                  </h2>
                  <p className="text-xs text-rose-400 font-medium">
                    🎭 Obra: {currentAudition.productionName || "Si No Es Ahora (El Musical)"} &bull; {currentAudition.programName}
                  </p>
                </div>

                {/* Live Average Score Display */}
                <div className="bg-black/60 border-2 border-purple-500/60 px-5 py-3 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg">
                  <span className="text-[10px] font-mono uppercase text-purple-300 font-bold tracking-wider">
                    Promedio de {discipline}
                  </span>
                  <span className="text-3xl font-black text-amber-400 font-mono mt-0.5">
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
                        <span className="font-black text-amber-400">{sc.averageScore} / 10</span>
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

                        {/* Quick 0-10 Buttons */}
                        <div className="flex items-center gap-1 overflow-x-auto py-1">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleScoreChange(c.id, num)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                currentScore === num
                                  ? num >= 9
                                    ? "bg-amber-400 text-black shadow-lg shadow-amber-400/40 font-black scale-110"
                                    : num >= 7
                                    ? "bg-emerald-500 text-white font-black scale-110"
                                    : num >= 5
                                    ? "bg-orange-500 text-white font-black"
                                    : "bg-rose-600 text-white font-black"
                                  : "bg-[#222232] text-zinc-400 hover:text-white hover:bg-[#303046]"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
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
                    Siguiente →
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
            <div className="bg-[#12121A] border-2 border-[#28283C] rounded-3xl p-12 text-center text-zinc-500 font-mono text-xs">
              Selecciona un aspirante para comenzar a calificar.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
