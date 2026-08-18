import React from "react";

interface MediaPlaceholderProps {
  aspectRatio?: "1:1" | "16:9" | "3:4" | "4:3";
  title?: string;
  description?: string;
  variant?: "red" | "dark" | "gray" | "concrete";
  className?: string;
}

export default function MediaPlaceholder({
  aspectRatio = "16:9",
  title = "FOTOGRAFÍA",
  description = "FOTOGRAFÍA OFICIAL PENDIENTE",
  variant,
  className = "",
}: MediaPlaceholderProps) {
  const aspectClasses = {
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "3:4": "aspect-[3/4]",
    "4:3": "aspect-[4/3]",
  };

  // Determine a stable color variant based on the description length if not explicitly provided
  // This ensures variety across placeholders on the page
  const computedVariant =
    variant ||
    (description.length % 4 === 0
      ? "red"
      : description.length % 4 === 1
      ? "dark"
      : description.length % 4 === 2
      ? "concrete"
      : "gray");

  const backgrounds = {
    red: "bg-accent-red text-text-main border-accent-red",
    dark: "bg-[#0A0A0C] text-text-muted border-border-editorial",
    gray: "bg-background-sec text-text-muted border-border-editorial-light",
    concrete: "bg-surface-card text-text-main border-border-editorial-light",
  };

  return (
    <div
      className={`relative w-full overflow-hidden border-2 flex flex-col justify-between p-4 sm:p-6 select-none ${aspectClasses[aspectRatio]} ${backgrounds[computedVariant]} ${className}`}
      role="img"
      aria-label={`${title}: ${description}`}
    >
      {/* Structural Crosshair or Grid Marks in backgrounds */}
      {computedVariant === "red" ? (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-full border-t border-text-main" />
          <div className="h-full border-l border-text-main absolute" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="w-full border-t border-dashed border-text-main" />
          <div className="h-full border-l border-dashed border-text-main absolute" />
        </div>
      )}

      {/* Frame boundary marks */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-current opacity-30" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-current opacity-30" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-current opacity-30" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-current opacity-30" />

      {/* Top Header metadata */}
      <div className="flex justify-between items-center w-full font-mono text-[8px] sm:text-[9px] tracking-widest uppercase opacity-75">
        <span>[DV PERFORMING ARTS]</span>
        <span>{aspectRatio}</span>
      </div>

      {/* Large visual typography watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
        <span className="font-display-cond text-[14vw] font-black uppercase tracking-widest leading-none opacity-5 sm:opacity-10 scale-125 select-none">
          {title.split(" ")[0]}
        </span>
      </div>

      {/* Discrete label indicating the asset is pending */}
      <div className="z-10 mt-auto flex flex-col gap-1">
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold text-accent-yellow bg-background-main/30 px-2 py-0.5 w-max">
          PENDIENTE DE ENTREGA
        </div>
        <div className="font-sans text-[10px] sm:text-[11px] font-bold tracking-widest uppercase opacity-90">
          {description}
        </div>
      </div>
    </div>
  );
}
