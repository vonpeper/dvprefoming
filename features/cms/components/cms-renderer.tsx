import React from "react";
import { CMSBlock } from "../types";
import MediaPlaceholder from "@/components/ui/media-placeholder";

interface CMSRendererProps {
  blocks: CMSBlock[];
}

export default function CMSRenderer({ blocks }: CMSRendererProps) {
  // Sort blocks by order field to maintain editorial sequence
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full flex flex-col gap-8">
      {sortedBlocks.map((block) => {
        switch (block.type) {
          case "HEADING":
            return (
              <div key={block.id} className="flex flex-col gap-2">
                <h3 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase leading-[0.82] text-text-main">
                  {block.content.text}{" "}
                  {block.content.accentText && (
                    <span className="text-accent-red block sm:inline">
                      {block.content.accentText}
                    </span>
                  )}
                </h3>
              </div>
            );

          case "PARAGRAPH":
            return (
              <p
                key={block.id}
                className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans font-bold uppercase tracking-widest max-w-2xl"
              >
                {block.content.text}
              </p>
            );

          case "WARNING_BANNER": {
            const variants = {
              red: "border-accent-red bg-accent-red/10 text-text-main",
              dark: "border-border-editorial bg-[#0A0A0C] text-text-muted",
              concrete: "border-border-editorial-light bg-surface-card text-text-main",
            };
            const currentVariant = block.content.variant || "red";

            return (
              <div
                key={block.id}
                className={`border-4 p-6 font-mono text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-3 ${variants[currentVariant]}`}
              >
                <span className="w-2.5 h-2.5 bg-accent-red animate-pulse shrink-0" />
                <span>{block.content.text}</span>
              </div>
            );
          }

          case "IMAGE_GRID": {
            const images = block.content.images || [];
            return (
              <div key={block.id} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {images.map((title, idx) => {
                  const variants = ["red", "concrete", "dark"];
                  const placeholderVariant =
                    (block.content.variant as "red" | "dark" | "concrete") ||
                    (variants[idx % 3] as "red" | "dark" | "concrete");
                  return (
                    <MediaPlaceholder
                      key={idx}
                      aspectRatio="4:3"
                      title={title}
                      description={`FOTOGRAFÍA OFICIAL DE: ${title}`}
                      variant={placeholderVariant}
                      className="border-2 border-text-main shadow-md"
                    />
                  );
                })}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
