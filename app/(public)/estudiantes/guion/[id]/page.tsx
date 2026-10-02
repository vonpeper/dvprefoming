"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { Script, ScriptCharacter, ScriptLine, StudentPracticeProgress } from "@/types/script";

// Audio chime using Web Audio API for actor's entrance cue
function playCueChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Ignore audio context autoplay restriction
  }
}

// Calculate similarity percentage between target line and transcribed speech
function calculateSimilarity(target: string, spoken: string): number {
  const cleanTarget = target.toLowerCase().replace(/[^\wáéíóúñ\s]/g, "").trim().split(/\s+/);
  const cleanSpoken = spoken.toLowerCase().replace(/[^\wáéíóúñ\s]/g, "").trim().split(/\s+/);

  if (cleanTarget.length === 0) return 100;
  if (cleanSpoken.length === 0) return 0;

  let matches = 0;
  const spokenSet = new Set(cleanSpoken);
  cleanTarget.forEach((word) => {
    if (spokenSet.has(word)) matches++;
  });

  return Math.min(100, Math.round((matches / cleanTarget.length) * 100));
}

export default function EstudianteGuionRehearsalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<"UNAUTHENTICATED" | "UNPAID" | "NO_BETA" | null>(null);

  // Student & Character selection
  const [studentFolio, setStudentFolio] = useState("");
  const [studentName, setStudentName] = useState("");
  const [myCharacterName, setMyCharacterName] = useState<string>("");

  // Rehearsal Engine State
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rehearsalMode, setRehearsalMode] = useState<"ASSISTED" | "MEMORY" | "CUE_ONLY">("ASSISTED");
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [revealedMemoryLines, setRevealedMemoryLines] = useState<Record<string, boolean>>({});

  // Speech Recognition (Mic)
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);

  // Practice Metrics
  const [linesLearned, setLinesLearned] = useState<Set<string>>(new Set());
  const [sessionStartTime] = useState<number>(Date.now());
  const [totalAttempts, setTotalAttempts] = useState(0);

  // References
  const linesContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Load session, beta settings & script data
  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/scripts/settings").then((r) => r.json()),
      fetch(`/api/scripts/${id}`).then((r) => r.json()),
    ])
      .then(([authData, settingsData, scriptData]) => {
        // Seamless access: any student or guest can rehearse directly
        const user = authData.authenticated && authData.user
          ? authData.user
          : {
              fullName: "Estudiante DV",
              studentFolio: "DV-0482",
              role: "ALUMNO",
            };

        setCurrentUser(user);
        setStudentName(user.fullName || "Estudiante DV");
        if (user.studentFolio) setStudentFolio(user.studentFolio);

        setAuthChecked(true);

        // 4. Load Script
        if (scriptData.success && scriptData.script) {
          setScript(scriptData.script);

          if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const charFromUrl = urlParams.get("char");
            if (charFromUrl) {
              setMyCharacterName(charFromUrl);
            } else if (scriptData.script.characters.length > 0) {
              setMyCharacterName(scriptData.script.characters[0].name);
            }

            const activeFolio = user.studentFolio || "DV-0482";
            fetch(`/api/scripts/${id}/progress?studentFolio=${activeFolio}`)
              .then((r) => r.json())
              .then((pData) => {
                if (pData.success && pData.progress) {
                  setLinesLearned(new Set(pData.progress.linesLearned || []));
                  if (pData.progress.characterName && !charFromUrl) {
                    setMyCharacterName(pData.progress.characterName);
                  }
                }
              })
              .catch(console.error);
          }
        } else {
          setErrorMsg(scriptData.error || "No se encontró el libreto solicitado.");
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("Error de red al inicializar la sala de ensayo.");
      })
      .finally(() => setLoading(false));

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [id]);

  // Scroll active line into view smoothly
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex]);

  // Main Rehearsal Speech Logic
  useEffect(() => {
    if (!script || !isPlaying) return;

    const currentLine = script.lines[currentLineIndex];
    if (!currentLine) {
      // Reached the end of script
      setIsPlaying(false);
      saveCurrentProgress();
      return;
    }

    const isMyLine =
      currentLine.characterName.trim().toUpperCase() === myCharacterName.trim().toUpperCase();

    if (isMyLine) {
      // IT'S THE STUDENT'S LINE!
      // 1. Play auditory cue chime
      playCueChime();

      // 2. Stop voice reading and wait for student
      // Do not auto-advance; the student will recite and click "Siguiente" or use Mic
    } else {
      // It's another character's line: Read out loud with SpeechSynthesis
      speakLine(currentLine, () => {
        // Callback after speaking finishes:
        if (isPlayingRef.current) {
          // Natural conversational pause before next line (500ms)
          setTimeout(() => {
            if (isPlayingRef.current) {
              setCurrentLineIndex((prev) => {
                if (prev + 1 < script.lines.length) {
                  return prev + 1;
                } else {
                  setIsPlaying(false);
                  saveCurrentProgress();
                  return prev;
                }
              });
            }
          }, 400);
        }
      });
    }
  }, [currentLineIndex, isPlaying, myCharacterName, script]);

  const speakLine = (line: ScriptLine, onFinished: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onFinished();
      return;
    }

    window.speechSynthesis.cancel();

    // In CUE_ONLY mode, only read the last words
    let textToSpeak = line.dialogue;
    if (rehearsalMode === "CUE_ONLY") {
      const words = line.dialogue.split(" ");
      textToSpeak = words.slice(-5).join(" ");
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "es-MX";
    utterance.rate = playbackRate;

    // Find character voice configuration
    const charConfig = script?.characters.find(
      (c) => c.name.toUpperCase() === line.characterName.toUpperCase()
    );

    utterance.pitch = charConfig?.voicePitch || 1.0;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter((v) => v.lang.startsWith("es"));
    if (spanishVoices.length > 0) {
      if (charConfig?.voiceGender === "FEMALE") {
        const female = spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("paulina") ||
            v.name.toLowerCase().includes("monica") ||
            v.name.toLowerCase().includes("sabina")
        );
        utterance.voice = female || spanishVoices[0];
      } else if (charConfig?.voiceGender === "MALE") {
        const male = spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes("male") ||
            v.name.toLowerCase().includes("jorge") ||
            v.name.toLowerCase().includes("diego")
        );
        utterance.voice = male || spanishVoices[spanishVoices.length - 1];
      } else {
        utterance.voice = spanishVoices[0];
      }
    }

    utterance.onend = () => {
      onFinished();
    };

    utterance.onerror = () => {
      onFinished();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Rehearsal Playback
  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleNextLine = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (script && currentLineIndex + 1 < script.lines.length) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      saveCurrentProgress();
    }
  };

  const handlePrevLine = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (currentLineIndex > 0) {
      setCurrentLineIndex((prev) => prev - 1);
    }
  };

  const handleRestartScene = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentLineIndex(0);
    setIsPlaying(false);
  };

  // Toggle Marked as Learned
  const handleToggleLearned = (lineId: string) => {
    setLinesLearned((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  // Speech Recognition (Microphone practice for student)
  const handleStartListening = (targetDialogue: string) => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento por voz. Puedes usar el botón de siguiente manualmente.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-MX";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript("Escuchando tu parlamento...");
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setSpeechTranscript(spoken);
        const accuracy = calculateSimilarity(targetDialogue, spoken);
        setLastAccuracy(accuracy);
        setTotalAttempts((prev) => prev + 1);

        if (accuracy >= 75) {
          const currentLine = script?.lines[currentLineIndex];
          if (currentLine) {
            setLinesLearned((prev) => new Set(prev).add(currentLine.id));
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Save Progress to API
  const saveCurrentProgress = async () => {
    if (!script) return;
    const folioToSave = studentFolio.trim() || "ALUMNO-ANON";
    const minutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

    try {
      await fetch(`/api/scripts/${script.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFolio: folioToSave,
          studentName: studentName || "Estudiante DV",
          characterName: myCharacterName,
          linesLearned: Array.from(linesLearned),
          accuracyRate: lastAccuracy || 100,
          practiceTimeMinutes: minutes,
        }),
      });
    } catch (err) {
      console.error("Error guardando progreso:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 text-slate-300">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full" />
          <p className="text-sm font-medium">Cargando sala de ensayo teatral...</p>
        </div>
      </div>
    );
  }

  if (accessDeniedReason === "UNAUTHENTICATED") {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] border border-[#30363D] p-8 rounded-3xl max-w-md text-center space-y-4 shadow-2xl">
          <span className="text-4xl">🔐</span>
          <h2 className="text-xl font-bold text-white">Inicio de Sesión Requerido</h2>
          <p className="text-xs text-slate-300">
            Para acceder a la sala de ensayo con voz, debes iniciar sesión con tu usuario y contraseña de alumno registrado en DV Performing Arts.
          </p>
          <Link
            href="/estudiantes/guiones"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (accessDeniedReason === "UNPAID") {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] border border-red-500/40 p-8 rounded-3xl max-w-md text-center space-y-4 shadow-2xl">
          <span className="text-4xl">💳</span>
          <h2 className="text-xl font-bold text-white">Mensualidad Pendiente</h2>
          <p className="text-xs text-slate-300">
            Tu cuenta de alumno no cuenta con su mensualidad escolar al corriente. El ensayo con voz interactiva está reservado para alumnos activos y con su cuota pagada.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/pagos"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
            >
              Realizar Pago de Mensualidad
            </Link>
            <Link
              href="/estudiantes/guiones"
              className="bg-[#21262D] text-slate-300 px-4 py-2.5 rounded-xl text-xs border border-[#30363D]"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (accessDeniedReason === "NO_BETA") {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] border border-amber-500/40 p-8 rounded-3xl max-w-md text-center space-y-4 shadow-2xl">
          <span className="text-4xl">🧪</span>
          <h2 className="text-xl font-bold text-white">Modo Prueba Beta Restringido</h2>
          <p className="text-xs text-slate-300">
            La plataforma se encuentra en fase de pruebas privadas para un grupo reducido de alumnos. Tu cuenta será habilitada en el lanzamiento general.
          </p>
          <Link
            href="/estudiantes/guiones"
            className="inline-block bg-[#21262D] hover:bg-[#30363D] text-slate-300 px-6 py-2.5 rounded-xl text-xs border border-[#30363D]"
          >
            ← Volver a Guiones
          </Link>
        </div>
      </div>
    );
  }

  if (errorMsg || !script) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] border border-red-500/30 p-8 rounded-2xl max-w-md text-center space-y-4 shadow-2xl">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-bold text-white">Error al cargar libreto</h2>
          <p className="text-sm text-slate-400">{errorMsg}</p>
          <Link
            href="/estudiantes/guiones"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            ← Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Calculate my character's lines count & progress
  const myLines = script.lines.filter(
    (l) => l.characterName.trim().toUpperCase() === myCharacterName.trim().toUpperCase()
  );
  const myLearnedCount = myLines.filter((l) => linesLearned.has(l.id)).length;
  const progressPercentage = myLines.length > 0 ? Math.round((myLearnedCount / myLines.length) * 100) : 0;

  const currentLine = script.lines[currentLineIndex];
  const isMyTurn =
    currentLine &&
    currentLine.characterName.trim().toUpperCase() === myCharacterName.trim().toUpperCase();

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Rehearsal Top Bar */}
      <header className="h-16 bg-[#161B22] border-b border-[#30363D] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/estudiantes/guiones"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262D] transition-colors"
            title="Volver a los libretos"
          >
            ←
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {script.title}
            </h1>
            <span className="text-[11px] text-amber-400 font-medium">
              {script.productionTitle}
            </span>
          </div>
        </div>

        {/* Character selector dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] px-2.5 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 hidden sm:inline">Tu Personaje:</span>
            <select
              value={myCharacterName}
              onChange={(e) => {
                setMyCharacterName(e.target.value);
                setCurrentLineIndex(0);
              }}
              className="bg-transparent text-amber-300 font-bold text-xs focus:outline-none cursor-pointer"
            >
              {script.characters.map((c) => (
                <option key={c.id} value={c.name} className="bg-[#161B22] text-white">
                  {c.name} ({c.totalLinesCount} parlamentos)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={saveCurrentProgress}
            className="text-xs bg-[#21262D] hover:bg-[#30363D] text-slate-300 border border-[#30363D] px-3 py-1.5 rounded-xl transition-colors hidden sm:block"
            title="Guardar sesión de estudio"
          >
            💾 Guardar Avance
          </button>
        </div>
      </header>

      {/* Progress & Stats Bar */}
      <div className="bg-[#12161D] border-b border-[#30363D] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="font-semibold text-slate-300">
            Memorización de {myCharacterName}:
          </span>
          <div className="flex-1 bg-[#21262D] h-2.5 rounded-full overflow-hidden border border-[#30363D] max-w-xs">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="font-mono text-amber-300 font-bold">
            {myLearnedCount}/{myLines.length} ({progressPercentage}%)
          </span>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1.5 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
          <button
            onClick={() => setRehearsalMode("ASSISTED")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              rehearsalMode === "ASSISTED"
                ? "bg-amber-500 text-black font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Lectura con Voz
          </button>
          <button
            onClick={() => setRehearsalMode("MEMORY")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              rehearsalMode === "MEMORY"
                ? "bg-amber-500 text-black font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Modo Memoria
          </button>
          <button
            onClick={() => setRehearsalMode("CUE_ONLY")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              rehearsalMode === "CUE_ONLY"
                ? "bg-amber-500 text-black font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pie de Entrada (Cue)
          </button>
        </div>

        {/* Speed button */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px]">Velocidad:</span>
          {[0.8, 1.0, 1.2].map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackRate(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                playbackRate === s
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                  : "bg-[#161B22] text-slate-400 border-[#30363D] hover:text-white"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Rehearsal Stage View */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Teleprompter Scroll Container */}
        <div
          ref={linesContainerRef}
          className="flex-1 bg-[#161B22] border border-[#30363D] rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(100vh-270px)] shadow-inner"
        >
          {script.lines.map((line, index) => {
            const isActive = index === currentLineIndex;
            const isThisMyChar =
              line.characterName.trim().toUpperCase() === myCharacterName.trim().toUpperCase();
            const isLearned = linesLearned.has(line.id);
            const isHiddenInMemoryMode =
              rehearsalMode === "MEMORY" && isThisMyChar && !revealedMemoryLines[line.id];

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setCurrentLineIndex(index);
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? isThisMyChar
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-[#161B22] border-amber-500 shadow-xl ring-2 ring-amber-500/30 scale-[1.01]"
                      : "bg-[#21262D] border-blue-500/50 shadow-lg ring-1 ring-blue-500/30"
                    : isThisMyChar
                    ? "bg-[#181F2A]/60 border-amber-500/20 hover:border-amber-500/40"
                    : "bg-[#0D1117]/60 border-[#30363D]/40 hover:border-[#30363D] opacity-80 hover:opacity-100"
                }`}
              >
                {/* Header of line: Character, Direction, Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded ${
                        isThisMyChar
                          ? "bg-amber-500 text-black"
                          : "bg-[#30363D] text-slate-200"
                      }`}
                    >
                      {isThisMyChar ? `⭐ TÚ (${line.characterName})` : line.characterName}
                    </span>

                    {line.direction && (
                      <span className="text-xs text-purple-300 italic">
                        ({line.direction})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Marked as learned button */}
                    {isThisMyChar && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLearned(line.id);
                        }}
                        className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                          isLearned
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                            : "bg-[#21262D] text-slate-400 border-[#30363D] hover:text-white"
                        }`}
                        title="Marcar como memorizada"
                      >
                        {isLearned ? "✓ Dominada" : "⚪ Sin dominar"}
                      </button>
                    )}

                    <span className="text-[10px] font-mono text-slate-500">
                      #{line.order}
                    </span>
                  </div>
                </div>

                {/* Spoken Dialogue Text */}
                <div className="text-base sm:text-lg leading-relaxed font-serif">
                  {isHiddenInMemoryMode ? (
                    <div className="flex items-center gap-3 py-2">
                      <span className="text-slate-500 select-none blur-sm filter">
                        {line.dialogue}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRevealedMemoryLines((prev) => ({ ...prev, [line.id]: true }));
                        }}
                        className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg hover:bg-amber-500/30 font-sans"
                      >
                        👁️ Ver Pista
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`${
                        isThisMyChar
                          ? "text-amber-100 font-semibold"
                          : "text-slate-200"
                      }`}
                    >
                      {line.dialogue}
                    </p>
                  )}
                </div>

                {/* Active Indicator & Action Cue */}
                {isActive && isThisMyChar && (
                  <div className="mt-3 pt-3 border-t border-amber-500/30 flex flex-wrap items-center justify-between gap-3 font-sans">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold animate-pulse">
                      <span>🎤</span>
                      <span>¡Es tu turno de hablar! Recita tu línea frente a la pantalla.</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartListening(line.dialogue);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1.5 ${
                          isListening
                            ? "bg-red-500 text-white border-red-400 animate-pulse"
                            : "bg-[#21262D] hover:bg-[#30363D] text-amber-300 border-amber-500/40"
                        }`}
                      >
                        <span>{isListening ? "⏹️ Detener" : "🎙️ Probar con Micrófono"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextLine();
                        }}
                        className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors shadow"
                      >
                        Listo, siguiente línea →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Speech Evaluation Feedback Box */}
        {speechTranscript && (
          <div className="bg-[#161B22] border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-md">
            <div>
              <span className="text-slate-400">Lo que dijiste:</span>
              <p className="text-white font-medium italic mt-0.5">"{speechTranscript}"</p>
            </div>
            {lastAccuracy !== null && (
              <div className="text-right">
                <span className="text-slate-400">Precisión de texto:</span>
                <div
                  className={`text-base font-bold font-mono ${
                    lastAccuracy >= 80
                      ? "text-emerald-400"
                      : lastAccuracy >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {lastAccuracy}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating / Sticky Control Bar */}
        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartScene}
              className="p-2.5 text-slate-400 hover:text-white bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] rounded-xl transition-colors text-xs"
              title="Reiniciar desde la primera línea"
            >
              ⏮️
            </button>
            <button
              onClick={handlePrevLine}
              disabled={currentLineIndex === 0}
              className="p-2.5 text-slate-400 hover:text-white disabled:opacity-30 bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] rounded-xl transition-colors text-xs"
              title="Línea anterior"
            >
              ◀
            </button>
          </div>

          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 font-black px-6 py-3 rounded-xl shadow-lg transition-all duration-200 text-sm ${
              isPlaying
                ? "bg-amber-500 text-black hover:bg-amber-400 scale-105"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black hover:scale-105"
            }`}
          >
            <span>{isPlaying ? "⏸️ Pausar Ensayo" : "▶️ Iniciar Lectura con Voz"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextLine}
              disabled={!script || currentLineIndex >= script.lines.length - 1}
              className="p-2.5 text-slate-400 hover:text-white disabled:opacity-30 bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] rounded-xl transition-colors text-xs"
              title="Línea siguiente"
            >
              ▶
            </button>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline ml-2">
              Línea {currentLineIndex + 1} de {script.lines.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
