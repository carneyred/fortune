"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { SceneRecord } from "@/lib/content/types";

type IntroStageProps = {
  scene: SceneRecord;
  blockIndex: number;
  onContinue: () => void;
};

export function IntroStage({ scene, blockIndex, onContinue }: IntroStageProps) {
  const block = scene.blocks[blockIndex];

  return (
    <button
      type="button"
      className="absolute inset-0 z-20 flex h-full w-full items-end text-left"
      onClick={onContinue}
      aria-label="Continue the telling"
    >
      <motion.div
        key={scene.id}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${scene.backgroundImage})` }}
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1.12, opacity: 1 }}
        transition={{ duration: 8, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/55 to-black/25" />
      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-20 sm:pb-24">
        <p className="font-display mb-4 text-[0.68rem] tracking-[0.42em] text-gold uppercase">
          {scene.title}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={block?.id ?? "empty"}
            className="font-serif text-xl leading-relaxed text-[#f0e2c4] sm:text-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.7 }}
          >
            {block?.text}
          </motion.p>
        </AnimatePresence>
        <p className="mt-8 text-xs tracking-[0.28em] text-[#9a8b7a] uppercase">
          Continue
        </p>
      </div>
    </button>
  );
}
