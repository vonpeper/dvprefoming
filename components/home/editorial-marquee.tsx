import React from "react";

export default function EditorialMarquee() {
  const words = [
    "TEATRO MUSICAL INTEGRAL",
    "DANZA URBANA & HIP HOP",
    "CANTO & TÉCNICA VOCAL",
    "ACTUACIÓN & PRESENCIA ESCÉNICA",
    "AUDICIONES 2026",
    "DISCIPLINA, COMPROMISO Y PASIÓN",
    "LEÓN, GUANAJUATO",
  ];

  // Duplicate words array to enable seamless marquee looping
  const marqueeItems = [...words, ...words];

  return (
    <div
      className="w-full bg-[#101016] border-b border-[#20202A] py-3.5 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="w-full relative flex">
        <div className="animate-marquee flex gap-10 whitespace-nowrap text-white">
          {marqueeItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-10 text-xs font-bold tracking-wider font-display uppercase">
              <span className="text-zinc-200">{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
