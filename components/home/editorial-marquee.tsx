import React from "react";

export default function EditorialMarquee() {
  const words = [
    "TEATRO MUSICAL",
    "CANTO & TÉCNICA VOCAL",
    "DANZA URBANA & HIP HOP",
    "ACTUACIÓN ESCÉNICA",
    "AUDICIONES: SI NO ES AHORA",
    "DISCIPLINA, COMPROMISO Y PASIÓN",
    "LEÓN, GUANAJUATO",
  ];

  // Duplicate words array to enable seamless marquee looping
  const marqueeItems = [...words, ...words];

  return (
    <div
      className="w-full bg-background-sec border-b border-border-editorial py-4 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="w-full relative flex">
        <div className="animate-marquee flex gap-12 whitespace-nowrap text-text-main">
          {marqueeItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-12 text-xs font-mono font-bold tracking-[0.25em] uppercase">
              <span>{item}</span>
              <span className="w-2 h-2 border border-accent-red rotate-45 bg-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
