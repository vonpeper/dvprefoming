import React from "react";

interface SectionHeadingProps {
  number: string;
  label: string;
  title: string;
  className?: string;
}

export default function SectionHeading({
  number,
  label,
  title,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`w-full flex flex-col md:flex-row md:items-end justify-between border-b-2 border-border-editorial pb-4 mb-12 ${className}`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-accent-red uppercase">
          <span>[{number}]</span>
          <span className="w-1 h-1 bg-accent-red" />
          <span>{label}</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-text-main uppercase leading-[0.85] mt-1">
          {title}
        </h2>
      </div>
      <div className="hidden md:block text-right font-mono text-[9px] text-text-muted tracking-widest uppercase mb-1">
        DV PERFORMING ARTS &bull; STG-2026
      </div>
    </div>
  );
}
