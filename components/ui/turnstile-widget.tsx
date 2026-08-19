"use client";

import React, { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export default function TurnstileWidget({
  onVerify,
  onExpire,
  theme = "dark",
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Default test sitekey (always passes in development & staging if not provided)
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.getElementById("cf-turnstile-script");

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            callback: (token: string) => {
              onVerify(token);
            },
            "expired-callback": () => {
              if (onExpire) onExpire();
            },
            "error-callback": () => {
              console.warn("[TURNSTILE] Challenge error or retry.");
            },
          });
          widgetIdRef.current = id;
          setLoaded(true);
        } catch (e) {
          console.error("[TURNSTILE RENDER ERROR]", e);
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else if (!existingScript) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderWidget();
      };
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", renderWidget);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, onVerify, onExpire]);

  return (
    <div className={`flex flex-col items-center justify-center my-1 ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
      {!loaded && (
        <span className="text-[10px] text-zinc-500 font-mono animate-pulse">
          🔒 Verificando seguridad Cloudflare Turnstile...
        </span>
      )}
    </div>
  );
}
