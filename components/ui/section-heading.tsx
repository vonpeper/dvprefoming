import React from "react";

interface SectionHeadingProps {
  number?: string;
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
    <div className={`w-full flex flex-col md:flex-row md:items-end justify-between border-b border-[#252532] pb-5 mb-12 ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
          {number && <span className="text-zinc-500 font-mono">{number} &bull;</span>}
          <span className="tracking-wide uppercase text-[11px]">{label}</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
          {title}
        </h2>
      </div>
      <div className="hidden md:block text-right text-xs text-zinc-400 font-normal mb-1">
        Academia de Teatro Musical & Danza
      </div>
    </div>
  );
}
