"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type CardFrameProps = {
  src: string;
  alt: string;
  className?: string;
};

export function CardFrame({ src, alt, className }: CardFrameProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("card-frame", className)}>
      {/* Letterboxed 3:5 frame; 2:3 art sits contained until 3:5 faces arrive. */}
      {/* Local framed art; unoptimized so 2:3 letterboxing stays exact. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={failed ? "/cards/shared/missing.jpg" : src}
        alt={alt}
        className="card-art"
        draggable={false}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
