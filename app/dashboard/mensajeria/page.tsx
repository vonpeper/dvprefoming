"use client";

import React, { useState, useEffect } from "react";
import { EvolutionInstanceStatus } from "@/features/messaging/types";
import { NotificationSettings } from "@/lib/storage";

export default function MessagingDashboardPage() {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email" | "templates" | "switches">("switches");
  
  // WhatsApp States
  const [status, setStatus] = useState<EvolutionInstanceStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [checkingPing, setCheckingPing] = useState(false);
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [qrPairingCode, setQrPairingCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState("");

  // Test WhatsApp
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(
    `🎭 *DV PERFORMING ARTS - MENSAJE DE PRUEBA*\n\n¡Hola! Este es un mensaje de prueba emitido desde la consola para verificar la conexión activa de WhatsApp.`
  );
  const [sendingWp, setSendingWp] = useState(false);
  const [wpSendResult, setWpSendResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  // Test Email
  const [testEmailTo, setTestEmailTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSendResult, setEmailSendResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  // Settings & Templates State
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/messaging/settings");
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      setLoadingStatus(false);
      setCheckingPing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchSettings();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/messaging/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar la configuración de mensajería.");
    } finally {
      setSavingSettings(false);
    }
  };

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

  const handleSendTestWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;

    setSendingWp(true);
    setWpSendResult(null);

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
      setWpSendResult({
        success: data.success,
        messageId: data.messageId,
        error: data.error,
      });
    } catch (err) {
      console.error(err);
      setWpSendResult({
        success: false,
        error: "Error de red al enviar el mensaje.",
      });
    } finally {
      setSendingWp(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo.trim()) return;

    setSendingEmail(true);
    setEmailSendResult(null);

    try {
      const res = await fetch("/api/messaging/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailTo,
          fullName: "Aspirante de Prueba",
          productionName: "Si No Es Ahora (El Musical)",
          folio: "AUD-2026-DV-0585",
        }),
      });

      const data = await res.json();
      setEmailSendResult({
        success: data.success,
        messageId: data.messageId,
        error: data.error,
      });
    } catch (err) {
      console.error(err);
      setEmailSendResult({
        success: false,
        error: "Error de red al enviar correo de prueba.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              Centro de Notificaciones & Mensajería
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Google Workspace &bull; WhatsApp
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Administra los envíos automáticos por correo y WhatsApp, edita plantillas para audiciones y controla los interruptores de notificación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
              <span>✓</span> Configuración guardada
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings || !settings}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
          >
            {savingSettings ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#161B22] p-2 rounded-2xl border border-[#30363D]">
        <button
          onClick={() => setActiveTab("switches")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "switches"
              ? "bg-purple-600 text-white shadow"
              : "text-slate-300 hover:bg-[#21262D] hover:text-white"
          }`}
        >
          <span>⚡</span>
          <span>Interruptores & Automatización</span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "templates"
              ? "bg-purple-600 text-white shadow"
              : "text-slate-300 hover:bg-[#21262D] hover:text-white"
          }`}
        >
          <span>📝</span>
          <span>Editor de Plantillas & Mensajes</span>
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "email"
              ? "bg-purple-600 text-white shadow"
              : "text-slate-300 hover:bg-[#21262D] hover:text-white"
          }`}
        >
          <span>📧</span>
          <span>Google Workspace Email</span>
        </button>

        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "whatsapp"
              ? "bg-purple-600 text-white shadow"
              : "text-slate-300 hover:bg-[#21262D] hover:text-white"
          }`}
        >
          <span>📱</span>
          <span>WhatsApp (Evolution API)</span>
        </button>
      </div>

      {/* ================= 1. SWITCHES & GLOBAL SETTINGS TAB ================= */}
      {activeTab === "switches" && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Master Toggles Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🎛️</span> Interruptores de Notificación Automática
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pausa o reactiva en cualquier momento los canales de envío automático para registros de aspirantes y aprobaciones de casting.
              </p>
            </div>

            {/* Email Switch */}
            <div className="flex items-center justify-between p-4 bg-[#0D1117] border border-[#30363D] rounded-xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📧</span> Correos por Google Workspace
                </span>
                <span className="text-[11px] text-slate-400">
                  {settings.emailNotificationsEnabled ? "Activo: Se envían correos HTML con logo y firma" : "Pausado: No se emitirán correos automáticos"}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* WhatsApp Switch */}
            <div className="flex items-center justify-between p-4 bg-[#0D1117] border border-[#30363D] rounded-xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>💬</span> Mensajería Instantánea de WhatsApp
                </span>
                <span className="text-[11px] text-slate-400">
                  {settings.whatsappNotificationsEnabled ? "Activo: Se envían WhatsApps automáticos vía Evolution API" : "Pausado: No se emitirán WhatsApps"}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsappNotificationsEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappNotificationsEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Google Drive Material Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>📁 Carpeta de Google Drive para Material de Audición</span>
                <span className="text-[10px] text-slate-500 font-mono">Pistas, libretos, escenas</span>
              </label>
              <input
                type="url"
                value={settings.googleDriveMaterialUrl}
                onChange={(e) =>
                  setSettings({ ...settings, googleDriveMaterialUrl: e.target.value })
                }
                placeholder="https://drive.google.com/drive/folders/..."
                className="bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
              />
            </div>

          </div>

          {/* Director Signature & Academy Config */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>✍️</span> Firma Institucional del Director
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Datos que se insertan automáticamente al pie de todos los correos HTML y comunicados oficiales.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Nombre del Director</label>
              <input
                type="text"
                value={settings.directorSignatureName}
                onChange={(e) =>
                  setSettings({ ...settings, directorSignatureName: e.target.value })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Cargo / Título Oficial</label>
              <input
                type="text"
                value={settings.directorSignatureTitle}
                onChange={(e) =>
                  setSettings({ ...settings, directorSignatureTitle: e.target.value })
                }
                className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Quick Live Preview of Signature */}
            <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Vista Previa de Firma en Correo:
              </span>
              <span className="text-xs italic text-slate-400">Todo lo mejor,</span>
              <span className="text-sm font-bold text-white">{settings.directorSignatureName || "Diego Vieyra"}</span>
              <span className="text-xs text-rose-400 font-semibold">{settings.directorSignatureTitle || "Director General & Artístico"}</span>
              <span className="text-[11px] text-slate-400">DV Performing Arts &bull; León, Gto.</span>
            </div>

          </div>

        </div>
      )}

      {/* ================= 2. TEMPLATES EDITOR TAB ================= */}
      {activeTab === "templates" && settings && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📝</span> Edición de Plantillas de Mensajes Automáticos
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Personaliza los textos que reciben los aspirantes. Puedes utilizar las variables dinámicas:{" "}
                <code className="text-rose-400 font-mono font-bold">{"{nombre}"}</code>,{" "}
                <code className="text-rose-400 font-mono font-bold">{"{folio}"}</code>,{" "}
                <code className="text-rose-400 font-mono font-bold">{"{obra}"}</code>,{" "}
                <code className="text-rose-400 font-mono font-bold">{"{drive_link}"}</code>.
              </p>
            </div>

            {/* 1. Registration Notification Template */}
            <div className="flex flex-col gap-4 border-t border-[#30363D] pt-5">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <span>1️⃣</span> Mensaje de Bienvenida / Registro a Audición
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Asunto del Correo Electrónico</label>
                <input
                  type="text"
                  value={settings.templates.registrationEmailSubject}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, registrationEmailSubject: e.target.value },
                    })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Texto para WhatsApp (Formato Markdown)</label>
                <textarea
                  rows={8}
                  value={settings.templates.registrationWhatsappText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, registrationWhatsappText: e.target.value },
                    })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono text-[11px] leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* 2. Approval Notification Template */}
            <div className="flex flex-col gap-4 border-t border-[#30363D] pt-5">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <span>2️⃣</span> Mensaje de Aprobación de Audición / Noticia Exitosa
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Asunto del Correo Electrónico</label>
                <input
                  type="text"
                  value={settings.templates.approvalEmailSubject}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, approvalEmailSubject: e.target.value },
                    })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Texto para WhatsApp (Formato Markdown)</label>
                <textarea
                  rows={6}
                  value={settings.templates.approvalWhatsappText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, approvalWhatsappText: e.target.value },
                    })
                  }
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono text-[11px] leading-relaxed resize-y"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= 3. GOOGLE WORKSPACE EMAIL TAB ================= */}
      {activeTab === "email" && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SMTP Configuration */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📧</span> Servidor SMTP de Google Workspace
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Conexión segura SSL/TLS para el envío de correos corporativos institucionales.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Host SMTP</label>
                <input
                  type="text"
                  value={settings.smtpHost || "smtp.gmail.com"}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Puerto (SSL)</label>
                <input
                  type="number"
                  value={settings.smtpPort || 465}
                  onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Usuario / Correo Emisor</label>
              <input
                type="email"
                value={settings.smtpUser || "contacto@dvperformingarts.com"}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Nombre del Remitente (From)</label>
              <input
                type="text"
                value={settings.smtpFrom || '"DV Performing Arts" <contacto@dvperformingarts.com>'}
                onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Test Email Dispatch Card */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>✉️</span> Probar Envío de Correo HTML en Vivo
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa una dirección de correo para recibir la plantilla oficial de audición con firma y diseño teatral.
              </p>
            </div>

            <form onSubmit={handleSendTestEmail} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Correo de Destino para Prueba</label>
                <input
                  type="email"
                  required
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                  placeholder="tu-correo@gmail.com"
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={sendingEmail || !testEmailTo.trim()}
                className="py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {sendingEmail ? "Enviando correo..." : "Enviar Correo de Prueba 🚀"}
              </button>
            </form>

            {emailSendResult && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono flex flex-col gap-1 ${
                  emailSendResult.success
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500 text-rose-300"
                }`}
              >
                <span className="font-bold">
                  {emailSendResult.success ? "✓ Correo despachado correctamente" : "✕ Error al enviar correo"}
                </span>
                {emailSendResult.messageId && (
                  <span className="text-[10px] text-zinc-400">ID: {emailSendResult.messageId}</span>
                )}
                {emailSendResult.error && (
                  <span className="text-[11px]">{emailSendResult.error}</span>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ================= 4. WHATSAPP TAB ================= */}
      {activeTab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status & QR Connection */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📱</span> Estado de Instancia de WhatsApp
                </h2>
                <p className="text-xs text-slate-400 mt-1">Conexión con Evolution API</p>
              </div>

              <button
                onClick={checkStatus}
                disabled={checkingPing}
                className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <span>🔄</span>
                <span>{checkingPing ? "Comprobando..." : "Refrescar"}</span>
              </button>
            </div>

            <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    status?.connected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">
                    {status?.connected ? "Conectado / En Línea" : "Desconectado"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Instancia: {status?.instanceName || "dv_instance"} &bull; Estado: {status?.state || "close"}
                  </span>
                </div>
              </div>

              {pingTime !== null && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {pingTime}ms
                </span>
              )}
            </div>

            <button
              onClick={handleRequestQR}
              className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📲</span>
              <span>Vincular Nuevo Teléfono / Ver Código QR</span>
            </button>
          </div>

          {/* Test WhatsApp Send */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>💬</span> Probar Envío de WhatsApp
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Envía un mensaje de prueba a tu número (10 dígitos).
              </p>
            </div>

            <form onSubmit={handleSendTestWhatsApp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Número de WhatsApp (10 dígitos)</label>
                <input
                  type="tel"
                  required
                  placeholder="4776558156"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Mensaje</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={sendingWp || !testPhone.trim()}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {sendingWp ? "Enviando mensaje..." : "Enviar WhatsApp de Prueba 🚀"}
              </button>
            </form>

            {wpSendResult && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono flex flex-col gap-1 ${
                  wpSendResult.success
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500 text-rose-300"
                }`}
              >
                <span className="font-bold">
                  {wpSendResult.success ? "✓ WhatsApp enviado correctamente" : "✕ Error al enviar WhatsApp"}
                </span>
                {wpSendResult.error && <span>{wpSendResult.error}</span>}
              </div>
            )}
          </div>

        </div>
      )}

      {/* QR Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="bg-[#161B22] border-2 border-emerald-500/50 rounded-3xl max-w-sm w-full p-6 text-center flex flex-col items-center gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">Escanea el Código QR</h3>
            <p className="text-xs text-slate-400">
              Abre WhatsApp en tu teléfono ➔ Dispositivos Vinculados ➔ Vincular Dispositivo.
            </p>

            {qrLoading ? (
              <div className="py-12 text-slate-400 font-mono text-xs animate-pulse">
                Generando código QR...
              </div>
            ) : qrBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                alt="QR Code"
                className="w-56 h-56 bg-white p-2 rounded-2xl shadow"
              />
            ) : (
              <div className="p-4 bg-rose-950/40 text-rose-300 text-xs rounded-xl">
                {qrError || "No disponible."}
              </div>
            )}

            <button
              onClick={() => setQrModalOpen(false)}
              className="mt-2 w-full py-2.5 bg-[#21262D] hover:bg-[#30363D] text-white text-xs font-bold rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
