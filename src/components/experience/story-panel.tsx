"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { DrawnFate } from "@/lib/content/types";
import { splitStory } from "@/lib/content/draw";

type StoryPanelProps = {
  fate: DrawnFate;
  visibleCount: number;
  fortuneRevealed: boolean;
  onAdvance: () => void;
};

export function StoryPanel({
  fate,
  visibleCount,
  fortuneRevealed,
  onAdvance,
}: StoryPanelProps) {
  const paragraphs = splitStory(fate.story.body);
  const shown = paragraphs.slice(0, visibleCount);

  return (
    <button
      type="button"
      onClick={onAdvance}
      className="parchment relative max-h-[78vh] w-full overflow-y-auto px-6 py-7 text-left sm:px-8"
      aria-label="Advance the fable"
    >
      <span className="candle-glow" aria-hidden />
      <p className="font-display relative text-[0.68rem] tracking-[0.38em] text-[#7a1f12] uppercase">
        {fate.card.number} · {fate.card.symbol}
      </p>
      <h2 className="font-display relative mt-2 text-3xl tracking-[0.12em] text-[#2a1a10] uppercase">
        {fate.story.title}
      </h2>
      <div className="relative mt-5 space-y-4">
        <AnimatePresence>
          {shown.map((paragraph) => (
            <motion.p
              key={paragraph}
              className="font-serif text-lg leading-relaxed whitespace-pre-line text-[#2c1c12]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {paragraph}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
      {fortuneRevealed && fate.story.fortuneLine ? (
        <motion.p
          className="fortune-line font-serif relative mt-8 border-t border-[#8a703866] pt-5 text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {fate.story.fortuneLine}
        </motion.p>
      ) : (
        <p className="relative mt-6 text-xs tracking-[0.22em] text-[#6a5340] uppercase">
          Continue
        </p>
      )}
    </button>
  );
}
