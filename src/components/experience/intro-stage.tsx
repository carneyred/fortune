"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { SceneRecord } from "@/lib/content/types";

type IntroStageProps = {
  scene: SceneRecord;
  blockIndex: number;
  continueReady: boolean;
  onContinue: () => void;
};

// The corridor door sits at roughly (50%, 42%) of the image; the base layer
// zooms toward it while a feather-masked copy of the same image scales less,
// so the door appears to recede as the hall stretches.
const CORRIDOR_ORIGIN = "50% 42%";
const CORRIDOR_DOOR_MASK =
  "radial-gradient(ellipse 13% 24% at 50% 42%, #000 55%, transparent 100%)";

export function IntroStage({
  scene,
  blockIndex,
  continueReady,
  onContinue,
}: IntroStageProps) {
  const block = scene.blocks[blockIndex];

  return (
    <button
      type="button"
      className="absolute inset-0 z-20 flex h-full w-full items-end text-left"
      onClick={onContinue}
      aria-label="Continue the telling"
    >
      {scene.id === "corridor" ? (
        <motion.div
          key={scene.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 4 }}
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${scene.backgroundImage})`,
              transformOrigin: CORRIDOR_ORIGIN,
            }}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1.5 }}
            transition={{ duration: 36, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${scene.backgroundImage})`,
              transformOrigin: CORRIDOR_ORIGIN,
              WebkitMaskImage: CORRIDOR_DOOR_MASK,
              maskImage: CORRIDOR_DOOR_MASK,
            }}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1.22 }}
            transition={{ duration: 36, ease: "linear" }}
          />
        </motion.div>
      ) : (
        <motion.div
          key={scene.id}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${scene.backgroundImage})` }}
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1.12, opacity: 1 }}
          transition={{ duration: 8, ease: "linear" }}
        />
      )}
      <AnimatePresence>
        {block?.image ? (
          <motion.div
            key={block.image}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              // Opaque scrim over the art keeps it faint without the scene
              // behind bleeding through.
              backgroundImage: `linear-gradient(rgba(7, 5, 4, ${
                1 - (block.imageOpacity ?? 0.35)
              }), rgba(7, 5, 4, ${1 - (block.imageOpacity ?? 0.35)})), url(${block.image})`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
        ) : null}
      </AnimatePresence>
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
        <motion.p
          className="mt-8 text-xs tracking-[0.28em] text-[#9a8b7a] uppercase"
          animate={{ opacity: continueReady ? 1 : 0.15 }}
          transition={{ duration: 0.6 }}
        >
          Continue
        </motion.p>
      </div>
    </button>
  );
}
