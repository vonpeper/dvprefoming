"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Script, ScriptCharacter, ScriptLine } from "@/types/script";
import { Production, AuditionRegistration } from "@/types/mock";

export default function GuionesDashboardPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [auditions, setAuditions] = useState<AuditionRegistration[]>([]);
  const [betaSettings, setBetaSettings] = useState<{
    isBetaActive: boolean;
    requirePaidSubscription: boolean;
    requireBetaFlag: boolean;
  }>({
    isBetaActive: true,
    requirePaidSubscription: true,
    requireBetaFlag: true,
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Creator states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedScriptForDetails, setSelectedScriptForDetails] = useState<Script | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formProductionId, setFormProductionId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRawText, setFormRawText] = useState("");
  const [useAI, setUseAI] = useState(false);

  // Extracted data preview
  const [parsedCharacters, setParsedCharacters] = useState<ScriptCharacter[]>([]);
  const [parsedLines, setParsedLines] = useState<ScriptLine[]>([]);
  const [step, setStep] = useState<"INPUT" | "REVIEW">("INPUT");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduction, setFilterProduction] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resScripts, resProds, resAuds, resSettings] = await Promise.all([
        fetch("/api/scripts"),
        fetch("/api/productions"),
        fetch("/api/auditions"),
        fetch("/api/scripts/settings"),
      ]);

      const dataScripts = await resScripts.json();
      const dataProds = await resProds.json();
      const dataAuds = await resAuds.json();
      const dataSettings = await resSettings.json();

      if (dataScripts.success) setScripts(dataScripts.scripts || []);
      if (dataProds.success) setProductions(dataProds.productions || []);
      if (dataAuds.success) setAuditions(dataAuds.auditions || []);
      if (dataSettings.success && dataSettings.settings) setBetaSettings(dataSettings.settings);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showToast("❌ Error de conexión al cargar los guiones.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBetaSettings = async (updates: any) => {
    try {
      const res = await fetch("/api/scripts/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setBetaSettings(data.settings);
        showToast("✓ Configuración de Modo Beta / Prueba actualizada.");
      } else {
        alert(data.error || "Error al actualizar configuración.");
      }
    } catch {
      alert("Error de red al actualizar configuración.");
    }
  };

  const handleParseText = async () => {
    if (!formRawText.trim()) {
      alert("Por favor ingresa o pega el texto del libreto.");
      return;
    }

    setIsParsing(true);
    try {
      const res = await fetch("/api/scripts/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: formRawText, useAI }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setParsedCharacters(json.data.characters || []);
        setParsedLines(json.data.lines || []);
        setStep("REVIEW");
        showToast(
          `✓ Libreto analizado: ${json.data.characters.length} personajes y ${json.data.totalLines} parlamentos detectados.`
        );
      } else {
        alert(json.error || "No se pudo procesar el guion.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al procesar el guion.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveScript = async () => {
    if (!formTitle.trim()) {
      alert("El título de la obra / escena es requerido.");
      return;
    }

    setIsSaving(true);
    try {
      const selectedProd = productions.find((p) => p.id === formProductionId);
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          productionId: formProductionId,
          productionTitle: selectedProd?.title || "Producción DV",
          description: formDescription,
          characters: parsedCharacters,
          lines: parsedLines,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("✓ Libreto guardado y publicado para ensayo.");
        setIsModalOpen(false);
        resetForm();
        loadData();
      } else {
        alert(data.error || "Error al guardar el guion.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al guardar el guion.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteScript = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el libreto "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Libreto eliminado.");
        loadData();
      } else {
        alert(data.error || "No se pudo eliminar.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el guion.");
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormProductionId(productions[0]?.id || "");
    setFormDescription("");
    setFormRawText("");
    setParsedCharacters([]);
    setParsedLines([]);
    setStep("INPUT");
  };

  const handleTestVoice = (text: string, voiceGender?: string, pitch: number = 1.0) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Tu navegador no soporta síntesis de voz nativa.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.pitch = pitch;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter((v) => v.lang.startsWith("es"));
    if (spanishVoices.length > 0) {
      if (voiceGender === "FEMALE") {
        const female = spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("paulina") ||
            v.name.toLowerCase().includes("monica") ||
            v.name.toLowerCase().includes("sabina")
        );
        if (female) utterance.voice = female;
        else utterance.voice = spanishVoices[0];
      } else if (voiceGender === "MALE") {
        const male = spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes("male") ||
            v.name.toLowerCase().includes("jorge") ||
            v.name.toLowerCase().includes("diego") ||
            v.name.toLowerCase().includes("carlos")
        );
        if (male) utterance.voice = male;
        else utterance.voice = spanishVoices[spanishVoices.length - 1];
      } else {
        utterance.voice = spanishVoices[0];
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  const copyStudentLink = (scriptId: string) => {
    const url = `${window.location.origin}/estudiantes/guion/${scriptId}`;
    navigator.clipboard.writeText(url);
    showToast("📋 Enlace de ensayo copiado al portapapeles.");
  };

  // Filtered scripts
  const filteredScripts = scripts.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.characters.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchProd = filterProduction === "ALL" || s.productionId === filterProduction;
    return matchSearch && matchProd;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in text-sm font-medium">
          <span>🎭</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161B22] border border-[#30363D] p-6 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Módulo de Dirección & Dramaturgia
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Voz Interactiva Activa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>📖</span> Libretos, Guiones & Estudio de Líneas
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Sube libretos completos de tus producciones teatrales. Nuestro analizador extrae automáticamente los personajes,
            los vincula a los alumnos del elenco y les permite ensayar con réplica de voz y métricas de avance.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Subir / Cargar Guion</span>
          </button>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Libretos Activos</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{scripts.length}</span>
            <span className="text-xs text-amber-400">Obras y escenas</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total de Parlamentos</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {scripts.reduce((acc, s) => acc + (s.totalLines || 0), 0)}
            </span>
            <span className="text-xs text-slate-400">líneas procesadas</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Personajes Extraídos</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {scripts.reduce((acc, s) => acc + (s.characters?.length || 0), 0)}
            </span>
            <span className="text-xs text-emerald-400">voces configuradas</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Modo de Voz</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-black text-amber-400">Opción 1: Web Speech</span>
            <span className="text-xs text-slate-400">100% Nativo & Gratis</span>
          </div>
        </div>
      </div>

      {/* Beta Mode & Subscription Control Panel */}
      <div className="bg-gradient-to-br from-[#161B22] via-[#1c222b] to-[#161B22] border border-amber-500/30 rounded-2xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <h3 className="text-base font-bold text-white tracking-tight">
                Control de Modo Prueba / Beta & Acceso de Alumnos
              </h3>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                BETA PRIVADA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Configura los candados de acceso para la fase piloto. Solo los alumnos con usuario y contraseña, cuenta activa y cuota de mensualidad pagada podrán entrar a ensayar.
            </p>
          </div>

          <Link
            href="/dashboard/usuarios?role=ALUMNO"
            className="flex items-center gap-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] px-3.5 py-2 rounded-xl text-xs transition-colors self-start md:self-auto"
          >
            <span>👥</span>
            <span>Gestionar Alumnos & Claves</span>
          </Link>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D] cursor-pointer hover:border-amber-500/40 transition-colors">
            <div>
              <span className="block text-xs font-bold text-white">Modo Beta Privado</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Cerrado a alumnos no autorizados
              </span>
            </div>
            <input
              type="checkbox"
              checked={betaSettings.isBetaActive}
              onChange={(e) =>
                handleUpdateBetaSettings({ isBetaActive: e.target.checked })
              }
              className="w-4 h-4 rounded text-amber-500 bg-[#161B22] border-[#30363D] focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D] cursor-pointer hover:border-amber-500/40 transition-colors">
            <div>
              <span className="block text-xs font-bold text-white">Exigir Mensualidad Pagada</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Bloquea alumnos con pago pendiente
              </span>
            </div>
            <input
              type="checkbox"
              checked={betaSettings.requirePaidSubscription}
              onChange={(e) =>
                handleUpdateBetaSettings({ requirePaidSubscription: e.target.checked })
              }
              className="w-4 h-4 rounded text-amber-500 bg-[#161B22] border-[#30363D] focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D] cursor-pointer hover:border-amber-500/40 transition-colors">
            <div>
              <span className="block text-xs font-bold text-white">Bandera Beta Alumno</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Requiere permiso piloto en su cuenta
              </span>
            </div>
            <input
              type="checkbox"
              checked={betaSettings.requireBetaFlag}
              onChange={(e) =>
                handleUpdateBetaSettings({ requireBetaFlag: e.target.checked })
              }
              className="w-4 h-4 rounded text-amber-500 bg-[#161B22] border-[#30363D] focus:ring-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Test Accounts Box for testing the flow */}
        <div className="bg-[#0D1117] border border-[#30363D]/80 rounded-xl p-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>🔑</span> Cuentas de Prueba Pre-configuradas para Validar la Beta:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs">
            <div className="p-2 rounded-lg bg-[#161B22] border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block">✓ Alumna Activa (Pasa al Ensayo)</span>
              <div className="text-[11px] text-slate-300 font-mono mt-1">
                Usuario: <span className="text-white">alumno.beta@dvperformingarts.com</span>
                <br />
                Password: <span className="text-amber-300">DV@Alumno2026</span>
                <br />
                Folio: <span className="text-purple-300">DV-0482</span> (Sofía)
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#161B22] border border-red-500/30">
              <span className="text-red-400 font-bold block">✗ Alumno Moroso (Bloqueado por Pago)</span>
              <div className="text-[11px] text-slate-300 font-mono mt-1">
                Usuario: <span className="text-white">moroso@dvperformingarts.com</span>
                <br />
                Password: <span className="text-amber-300">DV@Alumno2026</span>
                <br />
                Estado: <span className="text-red-300">PAST_DUE</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#161B22] border border-amber-500/30">
              <span className="text-amber-400 font-bold block">✗ Alumno Sin Beta (Bloqueado por Piloto)</span>
              <div className="text-[11px] text-slate-300 font-mono mt-1">
                Usuario: <span className="text-white">nobeta@dvperformingarts.com</span>
                <br />
                Password: <span className="text-amber-300">DV@Alumno2026</span>
                <br />
                Beta Access: <span className="text-amber-300">false</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#161B22] border border-[#30363D] p-4 rounded-xl">
        <div className="flex-1 relative">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por título, obra, o nombre de personaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <select
          value={filterProduction}
          onChange={(e) => setFilterProduction(e.target.value)}
          className="bg-[#0D1117] border border-[#30363D] px-3.5 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
        >
          <option value="ALL">Todas las Producciones</option>
          {productions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Scripts Grid */}
      {loading ? (
        <div className="bg-[#161B22] border border-[#30363D] p-12 rounded-2xl text-center text-slate-400">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3"></div>
          <p>Cargando catálogo de guiones y personajes...</p>
        </div>
      ) : filteredScripts.length === 0 ? (
        <div className="bg-[#161B22] border border-[#30363D] p-12 rounded-2xl text-center">
          <span className="text-4xl">🎭</span>
          <h3 className="text-lg font-bold text-white mt-3">No hay libretos registrados aún</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Sube el libreto de tu primera obra teatral para extraer sus personajes y permitir que los estudiantes comiencen su ensayo.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
          >
            Subir Primer Guion
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className="bg-[#161B22] border border-[#30363D] hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {script.productionTitle}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2 group-hover:text-amber-400 transition-colors">
                      {script.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono bg-[#21262D] border border-[#30363D] text-slate-300 px-2.5 py-1 rounded-md">
                    {script.totalLines} líneas
                  </span>
                </div>

                {script.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{script.description}</p>
                )}

                {/* Character Badges */}
                <div className="mt-4 pt-4 border-t border-[#30363D]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Reparto ({script.characters.length} personajes):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {script.characters.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#21262D] text-slate-200 border border-[#30363D]"
                        style={{ borderLeftColor: c.colorTag || "#3b82f6", borderLeftWidth: "3px" }}
                      >
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[10px] text-slate-400">({c.totalLinesCount})</span>
                        {c.assignedStudentName && (
                          <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1 rounded">
                            {c.assignedStudentName.split(" ")[0]}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-[#30363D] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/estudiantes/guion/${script.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <span>🎙️</span>
                    <span>Modo Ensayo de Voz</span>
                  </Link>

                  <button
                    onClick={() => copyStudentLink(script.id)}
                    className="p-2 text-slate-400 hover:text-white bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-lg transition-colors text-xs"
                    title="Copiar enlace para estudiantes"
                  >
                    🔗 Copiar Link
                  </button>

                  <button
                    onClick={() => setSelectedScriptForDetails(script)}
                    className="p-2 text-slate-400 hover:text-white bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-lg transition-colors text-xs"
                    title="Ver reparto y editar asignaciones"
                  >
                    👥 Reparto
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteScript(script.id, script.title)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors text-xs"
                  title="Eliminar guion"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Subir / Cargar Guion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#30363D] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎭</span> Cargar Nuevo Guion Teatral
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {step === "INPUT"
                    ? "Pega el texto de la obra para analizar personajes y diálogos."
                    : "Revisa el reparto detectado y afina las voces de réplica antes de guardar."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {step === "INPUT" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                        Título de la Obra o Escena *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Acto 1: Escena en el Barrio"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-[#0D1117] border border-[#30363D] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                        Producción Teatral Asociada
                      </label>
                      <select
                        value={formProductionId}
                        onChange={(e) => setFormProductionId(e.target.value)}
                        className="w-full bg-[#0D1117] border border-[#30363D] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Selecciona una producción...</option>
                        {productions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Descripción o Notas de Dirección (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Libreto de ensayo para la primera lectura italiana con el elenco principal."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] px-3.5 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold uppercase text-slate-300">
                        Texto del Libreto / Guion *
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useAI}
                            onChange={(e) => setUseAI(e.target.checked)}
                            className="rounded bg-[#0D1117] border-[#30363D] text-amber-500 focus:ring-0"
                          />
                          <span>Asistencia IA (OpenAI)</span>
                        </label>
                      </div>
                    </div>
                    <textarea
                      rows={12}
                      placeholder={`Ejemplo de formato admitido:

BENNY: ¡Buenos días! ¿Alguien ha visto el libreto?
NINA (entrando apresurada): Yo lo tengo aquí. No te preocupes.
USNAVI: Recuerden que tenemos ensayo general en una hora.`}
                      value={formRawText}
                      onChange={(e) => setFormRawText(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] p-3.5 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      💡 El analizador detecta automáticamente nombres en mayúsculas (`PERSONAJE:`), acotaciones entre paréntesis `(nervioso)` y números de escena.
                    </p>
                  </div>
                </>
              ) : (
                /* REVIEW STEP */
                <div className="space-y-6">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">
                        ✓ Extracción Exitosa
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Se extrajeron <strong>{parsedCharacters.length} personajes</strong> y{" "}
                        <strong>{parsedLines.length} líneas de diálogo</strong>. Puedes asignar cada personaje a un alumno o ajustar su voz de réplica.
                      </p>
                    </div>
                    <button
                      onClick={() => setStep("INPUT")}
                      className="text-xs bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-3 py-1.5 rounded-lg border border-[#30363D]"
                    >
                      ✏️ Modificar Texto
                    </button>
                  </div>

                  {/* Character Assignment & Voice Setup */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                      Configuración de Personajes y Reparto
                    </h4>
                    <div className="space-y-3">
                      {parsedCharacters.map((char, index) => (
                        <div
                          key={char.id}
                          className="bg-[#0D1117] border border-[#30363D] p-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: char.colorTag || "#3b82f6" }}
                            />
                            <div>
                              <span className="font-bold text-sm text-white">{char.name}</span>
                              <span className="text-xs text-slate-400 ml-2">
                                ({char.totalLinesCount} parlamentos)
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Alumno Asignado */}
                            <div>
                              <select
                                value={char.assignedStudentFolio || ""}
                                onChange={(e) => {
                                  const selectedFolio = e.target.value;
                                  const matchedAud = auditions.find(
                                    (a) => a.studentFolio === selectedFolio || a.folio === selectedFolio
                                  );
                                  const updated = [...parsedCharacters];
                                  updated[index].assignedStudentFolio = selectedFolio;
                                  updated[index].assignedStudentName = matchedAud?.fullName || "";
                                  setParsedCharacters(updated);
                                }}
                                className="bg-[#161B22] border border-[#30363D] text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
                              >
                                <option value="">Sin alumno asignado</option>
                                {auditions
                                  .filter(
                                    (a) =>
                                      !formProductionId ||
                                      a.productionId === formProductionId ||
                                      a.productionName === formTitle
                                  )
                                  .map((a) => (
                                    <option
                                      key={a.id}
                                      value={a.studentFolio || a.folio}
                                    >
                                      {a.fullName} ({a.studentFolio || a.folio})
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {/* Voice Gender */}
                            <div>
                              <select
                                value={char.voiceGender || "NEUTRAL"}
                                onChange={(e) => {
                                  const updated = [...parsedCharacters];
                                  updated[index].voiceGender = e.target.value as any;
                                  setParsedCharacters(updated);
                                }}
                                className="bg-[#161B22] border border-[#30363D] text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
                              >
                                <option value="FEMALE">Voz Femenina</option>
                                <option value="MALE">Voz Masculina</option>
                                <option value="NEUTRAL">Voz Neutra</option>
                              </select>
                            </div>

                            {/* Voice Test button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleTestVoice(
                                  `Hola, soy ${char.name}, y te daré la réplica en escena.`,
                                  char.voiceGender,
                                  char.voicePitch
                                )
                              }
                              className="text-xs bg-[#21262D] hover:bg-[#30363D] text-amber-300 border border-[#30363D] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                              title="Escuchar muestra de voz de síntesis"
                            >
                              <span>🔊</span>
                              <span>Probar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview First 5 Lines */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">
                      Vista Previa de Líneas Extraídas (primeras 5 de {parsedLines.length}):
                    </h4>
                    <div className="bg-[#0D1117] border border-[#30363D] p-3 rounded-xl space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
                      {parsedLines.slice(0, 5).map((line) => (
                        <div key={line.id} className="p-2 rounded bg-[#161B22] border border-[#30363D]/50">
                          <span className="text-amber-400 font-bold">{line.characterName}</span>
                          {line.direction && (
                            <span className="text-purple-400 italic ml-1.5">({line.direction})</span>
                          )}
                          <p className="text-slate-200 mt-1">{line.dialogue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#30363D] bg-[#161B22] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm px-4 py-2"
              >
                Cancelar
              </button>

              {step === "INPUT" ? (
                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={isParsing || !formRawText.trim() || !formTitle.trim()}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-6 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  {isParsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Analizando libreto...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍 Analizar y Extraer Reparto</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveScript}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold px-6 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Guardando libreto...</span>
                    </>
                  ) : (
                    <>
                      <span>✓ Confirmar y Publicar Guion</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Reparto Detallado */}
      {selectedScriptForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-[#30363D] flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-semibold uppercase">
                  {selectedScriptForDetails.productionTitle}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Reparto: {selectedScriptForDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScriptForDetails(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedScriptForDetails.characters.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: c.colorTag || "#3b82f6" }}
                        />
                        <span className="font-bold text-white text-sm">{c.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {c.totalLinesCount} líneas
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#30363D]/60 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Actor/Alumno:</span>
                      <span className="text-amber-300 font-medium">
                        {c.assignedStudentName || "Sin asignar aún"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Voz réplica:</span>
                      <span className="text-slate-300">
                        {c.voiceGender === "FEMALE"
                          ? "Femenina"
                          : c.voiceGender === "MALE"
                          ? "Masculina"
                          : "Neutra"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#30363D] bg-[#161B22] flex items-center justify-between">
              <Link
                href={`/estudiantes/guion/${selectedScriptForDetails.id}`}
                target="_blank"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>🎙️</span>
                <span>Abrir Ensayo con Voz</span>
              </Link>
              <button
                onClick={() => setSelectedScriptForDetails(null)}
                className="text-xs bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-4 py-2 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
