"use client";

import React, { useState, useEffect } from "react";
import { EvolutionInstanceStatus } from "@/features/messaging/types";

export default function MessagingDashboardPage() {
  const [status, setStatus] = useState<EvolutionInstanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(
    `🎭 *DV PERFORMING ARTS - MENSAJE DE PRUEBA*\n\n¡Hola! Este es un mensaje de prueba emitido desde la consola de Evolution API para verificar la conexión activa de WhatsApp.`
  );
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  const checkStatus = () => {
    setLoading(true);
    fetch("/api/messaging/evolution/status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.status) setStatus(data.status);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    checkStatus();
  }, []);

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

  const loadTemplate = (type: "confirmation" | "reminder" | "welcome") => {
    if (type === "confirmation") {
      setTestMessage(`🎭 *¡REGISTRO CONFIRMADO A AUDICIONES DV PERFORMING ARTS!* 🎭

¡Hola *Sofía Hernández*! Hemos recibido con éxito tu postulación para audicionar en DV Performing Arts.

📋 *Folio Único de Aspirante:* \`AUD-2026-DV-0042\`
🎭 *Disciplina / Taller:* Teatro Musical Integral
📍 *Sede:* Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.
⏰ *Turno / Horario:* Turno Vespertino (16:00 - 20:00)

✨ *Recomendaciones esenciales para el día de tu audición:*
1. 🕒 *Puntualidad:* Llegar 15 minutos antes de tu cita programada.
2. 👕 *Vestuario:* Ropa cómoda de trabajo escénico (color negro de preferencia).
3. 🎵 *Canto / Teatro:* Traer pista musical descargada en tu dispositivo.
4. 👟 *Danza:* Calzado adecuado según disciplina y botella de agua.
5. 📄 *Acceso:* Presenta tu Folio de aspirante (\`AUD-2026-DV-0042\`) en recepción.

_DV Performing Arts &bull; Disciplina, Compromiso y Pasión._`);
    } else if (type === "reminder") {
      setTestMessage(`🔔 *RECORDATORIO DE AUDICIÓN &bull; DV PERFORMING ARTS*

Estimado/a *Aspirante*, te recordamos que tu audición para *Teatro Musical Integral* está programada:

📋 *Folio de Acceso:* \`AUD-2026-DV-0042\`
📅 *Fecha:* Próxima sesión de audiciones
⏰ *Horario:* 16:00 hrs
📍 *Ubicación:* Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.

Recuerda presentarte con ropa cómoda de trabajo escénico e hidratación. ¡Te esperamos para darlo todo en el escenario! 🌟`);
    } else {
      setTestMessage(`🌟 *¡BIENVENIDO A DV PERFORMING ARTS!*

Nos alegra enormemente darte la bienvenida a nuestra academia de Teatro Musical en León, Gto.

📍 *Dirección:* Paseo de los Insurgentes #1506, Col. Jardines del Moral.
📞 *Teléfono:* 477 655 8156`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Consola de WhatsApp & Evolution API</span>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              Instancia Conectada
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Motor de mensajería automatizado para altas de audición, recordatorios de citas y avisos a estudiantes.
          </p>
        </div>

        <button
          onClick={checkStatus}
          disabled={loading}
          className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <span>🔄 Comprobar Estado</span>
        </button>
      </div>

      {/* Grid: Instance Status + Sender */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Test Sender */}
        <div className="lg:col-span-7 bg-[#161B22] border border-[#30363D] rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Simulador & Envío Directo de WhatsApp</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded">
                E.164 +52
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Envía un mensaje instantáneo a cualquier número de WhatsApp (10 dígitos) para validar la entrega.
            </p>
          </div>

          {/* Quick Template Selector */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 text-[11px] self-center font-mono mr-1">Cargar Plantilla:</span>
            <button
              type="button"
              onClick={() => loadTemplate("confirmation")}
              className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded text-xs transition-colors"
            >
              1. Alta de Audición
            </button>
            <button
              type="button"
              onClick={() => loadTemplate("reminder")}
              className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded text-xs transition-colors"
            >
              2. Recordatorio
            </button>
            <button
              type="button"
              onClick={() => loadTemplate("welcome")}
              className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-200 rounded text-xs transition-colors"
            >
              3. Bienvenida
            </button>
          </div>

          <form onSubmit={handleSendTest} className="flex flex-col gap-4">
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Número de WhatsApp Destinatario (10 dígitos en México)
              </label>
              <div className="flex items-center bg-[#0D1117] border border-[#30363D] rounded-lg overflow-hidden text-xs">
                <span className="px-3 py-2 text-slate-400 bg-[#161B22] border-r border-[#30363D] font-mono">
                  +52 (MX)
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 4771234567"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Cuerpo del Mensaje (Markdown WhatsApp)</label>
              <textarea
                rows={10}
                required
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500 resize-y"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando por Evolution API...</span>
                </>
              ) : (
                <span>Enviar Mensaje de WhatsApp</span>
              )}
            </button>

            {/* Result Feedback */}
            {sendResult && (
              <div
                className={`p-4 rounded-xl text-xs font-mono ${
                  sendResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/10 border border-red-500/30 text-red-300"
                }`}
              >
                {sendResult.success ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">✓ Mensaje procesado con éxito.</span>
                    <span className="text-[10px] text-slate-400">ID de Mensaje: {sendResult.messageId}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">✕ Error al enviar mensaje:</span>
                    <span className="text-[10px]">{sendResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Status & Infrastructure Info */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Status Box */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="font-bold text-sm text-white border-b border-[#30363D] pb-3 flex items-center justify-between">
              <span>Estado de la Instancia</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#30363D]/60">
                <span className="text-slate-400">Instancia Activa:</span>
                <span className="font-mono font-bold text-white">{status?.instanceName || "dv_instance"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#30363D]/60">
                <span className="text-slate-400">Conexión:</span>
                <span className="font-mono text-emerald-400 font-bold">ABIERTA / OPEN</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#30363D]/60">
                <span className="text-slate-400">Perfil:</span>
                <span className="font-semibold text-white">DV Performing Arts</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Disparador Automático:</span>
                <span className="text-emerald-400 font-semibold">Formulario de Audición</span>
              </div>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex flex-col gap-3 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>📋 Flujo de Automatización de Audiciones</span>
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>
                <strong className="text-white">Postulación:</strong> El alumno completa el formulario en la web.
              </li>
              <li>
                <strong className="text-white">Generación de Folio:</strong> El backend asigna un folio correlativo (ej. <code className="font-mono text-red-400">AUD-2026-DV-0042</code>).
              </li>
              <li>
                <strong className="text-white">Notificación Inmediata:</strong> Evolution API envía el mensaje de confirmación con horario, sede y recomendaciones.
              </li>
              <li>
                <strong className="text-white">Recordatorio de Cita:</strong> El personal administrativo puede enviar el recordatorio previo a la audición desde el panel con 1 solo clic.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
