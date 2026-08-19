"use client";

import React, { useState } from "react";

interface SocialShareButtonsProps {
  title: string;
  url: string;
}

export default function SocialShareButtons({ title, url }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-zinc-400 mr-1 hidden sm:inline">Compartir:</span>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 transition-all text-xs font-bold flex items-center gap-1.5"
        title="Compartir por WhatsApp"
      >
        <span>📱</span>
        <span className="text-[11px]">WhatsApp</span>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 transition-all text-xs font-bold"
        title="Compartir en Facebook"
      >
        <span>Facebook</span>
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        className="px-3 py-2 rounded-xl bg-[#1C1C26] hover:bg-[#282838] text-zinc-300 hover:text-white border border-[#303042] transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
        title="Copiar enlace"
      >
        <span>🔗</span>
        <span>{copied ? "¡Copiado!" : "Copiar"}</span>
      </button>
    </div>
  );
}
