"use client";

import { cn } from "@/lib/utils";

interface RetroGridProps {
  className?: string;
}

export default function RetroGrid({ className }: RetroGridProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Static grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
          maskImage: "radial-gradient(60% 60% at 50% 0%, black, transparent)",
        }}
      />

      {/* Perspective grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
          transform: "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
          transformOrigin: "center top",
        }}
      >
        <div className="absolute inset-0 animate-grid" />
      </div>

      {/* Floating particles */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle 2px at center, rgba(48,232,122,0.15) 0%, transparent 100%)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
