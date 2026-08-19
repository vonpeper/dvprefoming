"use client";

import React, { useState, useEffect } from "react";
import { EvolutionInstanceStatus } from "@/features/messaging/types";

export default function MessagingDashboardPage() {
  const [status, setStatus] = useState<EvolutionInstanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingPing, setCheckingPing] = useState(false);
  const [pingTime, setPingTime] = useState<number | null>(null);

  // QR Modal / States
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [qrPairingCode, setQrPairingCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState("");

  // Test send form
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(
    `🎭 *DV PERFORMING ARTS - MENSAJE DE PRUEBA*\n\n¡Hola! Este es un mensaje de prueba emitido desde la consola de Evolution API para verificar la conexión activa de WhatsApp.`
  );
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  const checkStatus = async () => {
    setCheckingPing(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/messaging/evolution/status");
      const data = await res.json();
      const end = performance.now();
      setPingTime(Math.round(end - start));
      if (data?.status) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error(err);
      setStatus({
        connected: false,
        instanceName: "dv_instance",
        state: "close",
      });
    } finally {
      setLoading(false);
      setCheckingPing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-poll status every 30s
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestQR = async () => {
    setQrModalOpen(true);
    setQrLoading(true);
    setQrError("");

    try {
      const res = await fetch("/api/messaging/evolution/qrcode");
      const data = await res.json();

      if (data.success && (data.base64 || data.code)) {
        setQrBase64(data.base64 || null);
        setQrPairingCode(data.pairingCode || null);
      } else {
        setQrError(data.error || "No se pudo obtener el código QR de Evolution API.");
      }
    } catch (err) {
      console.error(err);
      setQrError("Error de conexión al solicitar el QR.");
    } finally {
      setQrLoading(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/messaging/evolution/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage,
        }),
      });

      const data = await res.json();
      setSendResult({
        success: data.success,
        messageId: data.result?.messageId,
        error: data.error || data.result?.error,
      });
    } catch (err) {
      console.error(err);
      setSendResult({
        success: false,
        error: "Error de conexión con el servidor.",
      });
    } finally {
      setSending(false);
    }
  };

  const isConnected = status?.state === "open" || status?.connected;
  const isConnecting = status?.state === "connecting" || status?.state === "qrcode";

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Consola de WhatsApp & Evolution API</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Motor de mensajería automatizado para altas de audición, folios oficiales y recordatorios en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={checkStatus}
            disabled={checkingPing}
            className="px-3.5 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded-xl text-xs font-semibold border border-[#30363D] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className={checkingPing ? "animate-spin" : ""}>🔄</span>
            <span>{checkingPing ? "Verificando..." : "Comprobar Ping"}</span>
          </button>

          <button
            type="button"
            onClick={handleRequestQR}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>📲</span>
            <span>Vincular WhatsApp (QR)</span>
          </button>
        </div>
      </div>

      {/* ================= SEMÁFORO LED DE CONEXIÓN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* LED Card 1: Estado General */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="relative flex items-center justify-center shrink-0">
            {/* LED Glow Ping */}
            {isConnected ? (
              <>
                <span className="w-5 h-5 rounded-full bg-emerald-500 animate-ping absolute opacity-75 duration-1000" />
                <span className="w-5 h-5 rounded-full bg-emerald-400 relative z-10 shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
              </>
            ) : isConnecting ? (
              <>
                <span className="w-5 h-5 rounded-full bg-amber-500 animate-ping absolute opacity-75" />
                <span className="w-5 h-5 rounded-full bg-amber-400 relative z-10 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              </>
            ) : (
              <span className="w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              Semáforo de Conexión
            </span>
            <span className="text-base font-bold text-white">
              {isConnected ? (
                <span className="text-emerald-400">● Conectado (Online)</span>
              ) : isConnecting ? (
                <span className="text-amber-400">● Esperando Escaneo QR</span>
              ) : (
                <span className="text-rose-400">● Desconectado (Offline)</span>
              )}
            </span>
          </div>
        </div>

        {/* LED Card 2: Instancia & Servidor */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
            Instancia Activa
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-sm font-bold text-purple-300">
              {status?.instanceName || "dv_instance"}
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-[#0D1117] px-2 py-0.5 rounded border border-[#30363D]">
              propodvps1
            </span>
          </div>
        </div>

        {/* LED Card 3: Latencia & Ping */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
            Respuesta API
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-white">
              {pingTime ? `${pingTime} ms` : "Listo"}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              API v2.2 Active
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Send Test & Template Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Test Sender Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#161B22] border border-[#30363D] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
          <div className="border-b border-[#30363D] pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Prueba de Envío WhatsApp</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded">
                Live Test
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Envía un mensaje de prueba a cualquier número móvil mexicano para validar la recepción de folios.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="flex flex-col gap-4 text-xs">
            {/* Target Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">
                Número de Teléfono / WhatsApp Destino (10 dígitos) *
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-[#0D1117] border border-[#30363D] px-3 py-2.5 rounded-lg text-slate-400 font-mono text-xs">
                  🇲🇽 +52
                </span>
                <input
                  type="tel"
                  required
                  placeholder="477 655 8156"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">
                Plantillas Oficiales de Audición:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTestMessage(
                      `🎭 *¡REGISTRO CONFIRMADO A AUDICIONES DV PERFORMING ARTS!* 🎭\n\n¡Hola *Sofía Hernández*! Hemos recibido tu postulación.\n\n📋 *Folio Oficial:* \`AUD-2026-DV-0042\`\n🎬 *Obra:* Si No Es Ahora (El Musical)\n🎭 *Taller:* Teatro Musical Integral\n📍 *Sede:* Paseo de los Insurgentes #1506, León, Gto.\n\n_DV Performing Arts &bull; Disciplina y Pasión._`
                    )
                  }
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-purple-300 border border-purple-500/30 rounded text-[11px] font-mono transition-colors"
                >
                  📨 Confirmación Folio
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTestMessage(
                      `🔔 *RECORDATORIO DE AUDICIÓN &bull; DV PERFORMING ARTS*\n\nEstimado/a *Aspirante*, te recordamos tu audición para *Si No Es Ahora*:\n\n📋 *Folio:* \`AUD-2026-DV-0042\`\n📅 *Horario:* 16:00 hrs\n📍 *Sede:* Auditorio DV (Jardines del Moral).\n\n¡Te esperamos!`
                    )
                  }
                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-mono transition-colors"
                >
                  🔔 Recordatorio de Cita
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Cuerpo del Mensaje</label>
              <textarea
                rows={6}
                required
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Feedback alert */}
            {sendResult && (
              <div
                className={`p-4 rounded-xl text-xs font-mono border ${
                  sendResult.success
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/50 text-rose-300"
                }`}
              >
                {sendResult.success ? (
                  <div>
                    <span className="font-bold block">✓ ¡Mensaje emitido con éxito!</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Message ID: {sendResult.messageId}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold block">✕ Error al enviar mensaje</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {sendResult.error}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <span>Enviando por WhatsApp...</span>
              ) : (
                <>
                  <span>📱</span>
                  <span>Enviar Mensaje de Prueba</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Technical Guidelines & Quadlet Server Status (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Server Details Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2 border-b border-[#30363D] pb-3">
              <span>Infraestructura Evolution API</span>
              <span className="text-[10px] font-mono text-purple-400">propodvps1</span>
            </h3>

            <ul className="flex flex-col gap-2.5 text-slate-300 text-[11px] font-mono">
              <li className="flex justify-between py-1 border-b border-[#252C35]">
                <span className="text-slate-400">Contenedor:</span>
                <span className="text-emerald-400 font-bold">evolution-api-v2</span>
              </li>
              <li className="flex justify-between py-1 border-b border-[#252C35]">
                <span className="text-slate-400">Base de Datos:</span>
                <span className="text-slate-200">Postgres Evolution</span>
              </li>
              <li className="flex justify-between py-1 border-b border-[#252C35]">
                <span className="text-slate-400">Caché Redis:</span>
                <span className="text-slate-200">Redis Evolution</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-400">Auto-Reconexión:</span>
                <span className="text-emerald-400">Habilitada (Systemd)</span>
              </li>
            </ul>
          </div>

          {/* Quick instructions */}
          <div className="bg-gradient-to-br from-purple-950/30 to-[#161B22] border border-purple-500/30 rounded-2xl p-6 text-xs flex flex-col gap-3">
            <span className="font-bold text-purple-300 flex items-center gap-2">
              <span>💡 ¿Cómo vincular una nueva línea?</span>
            </span>
            <ol className="list-decimal pl-4 flex flex-col gap-2 text-slate-300 text-[11px] leading-relaxed">
              <li>Haz clic en el botón superior <strong>&ldquo;Vincular WhatsApp (QR)&rdquo;</strong>.</li>
              <li>Abre WhatsApp en el celular de la academia.</li>
              <li>Ve a <strong>Dispositivos vinculados &rarr; Vincular un dispositivo</strong>.</li>
              <li>Apunta la cámara al código QR en pantalla.</li>
              <li>¡Listo! El semáforo LED cambiará a verde automáticamente.</li>
            </ol>
          </div>

        </div>

      </div>

      {/* ================= QR CODE MODAL ================= */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fade-in"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="bg-[#161B22] border-2 border-purple-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl cursor-default text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full flex justify-between items-center border-b border-[#30363D] pb-3">
              <div className="flex items-center gap-2 text-left">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Escanear Código QR de WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#0D1117] border border-[#30363D] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* QR Viewport */}
            <div className="w-64 h-64 bg-black rounded-2xl border-2 border-[#30363D] p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-2 text-xs text-purple-300 font-mono">
                  <span className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span>Generando código QR...</span>
                </div>
              ) : qrError ? (
                <div className="p-4 text-xs text-rose-300 font-mono">
                  ⚠️ {qrError}
                </div>
              ) : qrBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                  alt="WhatsApp QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-500 font-mono">Sin QR disponible</span>
              )}
            </div>

            {/* Pairing Code if available */}
            {qrPairingCode && (
              <div className="bg-[#0D1117] border border-[#30363D] px-4 py-2 rounded-xl flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Código de Emparejamiento:</span>
                <span className="text-lg font-black font-mono text-purple-300 tracking-widest">{qrPairingCode}</span>
              </div>
            )}

            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Abre WhatsApp en tu teléfono, toca <strong>Dispositivos vinculados</strong> y escanea este código.
            </p>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={handleRequestQR}
                disabled={qrLoading}
                className="flex-1 py-2.5 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔄</span>
                <span>Refrescar Código</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(false);
                  checkStatus();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Listo / Ya lo escaneé
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
