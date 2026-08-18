"use client";

import React, { useState, useEffect } from "react";
import { CMSBlock } from "@/features/cms/types";
import { initialCMSBlocks } from "@/features/cms/data/mock-cms";
import CMSRenderer from "@/features/cms/components/cms-renderer";
import SectionHeading from "@/components/ui/section-heading";
import Link from "next/link";

export default function CMSSection() {
  const [blocks, setBlocks] = useState<CMSBlock[]>([]);

  // Safely load blocks from localStorage on client mount
  useEffect(() => {
    const saved = localStorage.getItem("dv_cms_blocks");
    let loadedBlocks = initialCMSBlocks;
    if (saved) {
      try {
        loadedBlocks = JSON.parse(saved);
      } catch {
        loadedBlocks = initialCMSBlocks;
      }
    }
    Promise.resolve().then(() => {
      setBlocks(loadedBlocks);
    });
  }, []);

  return (
    <section className="relative w-full py-20 px-6 border-b-4 border-border-editorial" aria-labelledby="heading-cms">
      <div className="mx-auto max-w-container-max">
        
        {/* Section Heading */}
        <SectionHeading
          number="07"
          label="CMS Dinámico"
          title="Sección de Bloques Controlados"
        />

        {/* Informative Sticker about Dashboard */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background-sec border-2 border-border-editorial-light p-4 font-mono text-[9px] uppercase tracking-widest text-text-muted">
          <span>Esta sección se alimenta dinámicamente mediante bloques JSON desde el administrador local.</span>
          <Link
            href="/dashboard/cms"
            className="text-accent-red hover:text-text-main font-bold block"
          >
            [ ABRIR PANEL ADMINISTRADOR CMS ]
          </Link>
        </div>

        {/* Blocks rendering */}
        <div className="w-full">
          <CMSRenderer blocks={blocks} />
        </div>

      </div>
    </section>
  );
}
