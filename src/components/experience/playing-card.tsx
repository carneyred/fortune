"use client";

import { motion } from "framer-motion";

import { CardFrame } from "@/components/experience/card-frame";
import { VanishFx } from "@/components/experience/vanish-fx";
import { usePrefersReducedMotion } from "@/hooks/use-prefers";
import type { DrawnFate, VanishEffect } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type PlayingCardProps = {
  fate: DrawnFate;
  index: number;
  focused: boolean;
  selected: boolean;
  vanished: boolean;
  vanishEffect: VanishEffect;
  faceUp: boolean;
  locked: boolean;
  onHover: () => void;
  onSelect: () => void;
  onVanishComplete: () => void;
};

export function PlayingCard({
  fate,
  index,
  focused,
  selected,
  vanished,
  vanishEffect,
  faceUp,
  locked,
  onHover,
  onSelect,
  onVanishComplete,
}: PlayingCardProps) {
  const reduced = usePrefersReducedMotion();
  const tilt = [-8, -4, 0, 4, 8][index] ?? 0;

  return (
    <motion.button
      type="button"
      disabled={locked && !selected}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onSelect}
      aria-label={`${faceUp ? fate.card.title : "Facedown card"} ${index + 1} of 5`}
      aria-pressed={selected}
      className={cn(
        "playing-card card-glint relative w-[17vw] max-w-[168px] min-w-[92px] origin-bottom border-0 bg-transparent p-0 text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-gold/80",
        vanished && "pointer-events-none",
      )}
      data-focused={focused}
      initial={{ opacity: 0, y: 28, rotateZ: tilt }}
      animate={{
        opacity: vanished && vanishEffect === "fade-grain" ? 0 : vanished ? 0.2 : 1,
        y: focused && !selected && !locked ? -28 : selected ? -8 : 0,
        rotateZ: selected ? 0 : focused ? tilt * 0.35 : tilt,
        scale: selected ? 1.06 : focused ? 1.07 : 1,
        filter:
          vanished && vanishEffect === "fade-grain"
            ? "contrast(0.6) brightness(0.35)"
            : "none",
      }}
      transition={
        reduced
          ? { duration: 0.35 }
          : { type: "spring", stiffness: 160, damping: 18 }
      }
      style={{ perspective: 900, transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="relative"
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ duration: reduced ? 0.2 : 0.8 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div style={{ backfaceVisibility: "hidden" }}>
          <CardFrame src={fate.card.backImage} alt="Card back" />
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <CardFrame src={fate.card.frontImage} alt={fate.card.title} />
        </div>
      </motion.div>
      <VanishFx
        active={vanished}
        effect={vanishEffect}
        onComplete={onVanishComplete}
      />
    </motion.button>
  );
}
