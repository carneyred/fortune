"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { CardFrame } from "@/components/experience/card-frame";
import { Button } from "@/components/ui/button";
import { assetPath } from "@/lib/asset-path";
import type { CardRecord, CardStory } from "@/lib/content/types";

type ReturnVisitProps = {
  card: CardRecord;
  story: CardStory | null;
  onReturn: () => void;
};

const BLOCKS = [
  "You go back. The street is where you left it, the heat, the leaning buildings, the man with his one coin. But where the fortune teller’s shop stood there is only an empty space, bricked and blind, as if nothing had ever leaned there at all.",
  "You reach into your pocket. Something is there that was not there before. Stiff paper, worn soft at one corner, warmer than a pocket should keep it.",
];

export function ReturnVisit({ card, story, onReturn }: ReturnVisitProps) {
  const [stage, setStage] = useState(0);
  const showCard = stage >= BLOCKS.length;

  const advance = () => {
    if (!showCard) setStage((value) => value + 1);
  };

  return (
    <section
      className="absolute inset-0 z-20 flex h-full flex-col items-center justify-center px-6 text-center"
      onClick={advance}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${assetPath("/scenes/street.jpg")})` }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/30" />
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <p className="font-display mb-6 text-[0.68rem] tracking-[0.42em] text-gold uppercase">
          The Street, again
        </p>
        <AnimatePresence mode="wait">
          {!showCard ? (
            <motion.p
              key={stage}
              className="font-serif text-xl leading-relaxed text-[#f0e2c4] sm:text-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.7 }}
            >
              {BLOCKS[stage]}
            </motion.p>
          ) : (
            <motion.div
              key="card"
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1 }}
            >
              <div className="w-[38vw] max-w-[210px] min-w-[130px]">
                <CardFrame src={card.frontImage} alt={card.title} />
              </div>
              <p className="font-serif mt-6 max-w-md text-lg text-[#d8c7a4] sm:text-xl">
                You find {card.title}, and wonder what it means for your future.
              </p>
              {story?.fortuneLine ? (
                <p className="font-serif mt-4 max-w-md text-base text-[#9a8b7a] italic">
                  &ldquo;{story.fortuneLine}&rdquo;
                </p>
              ) : null}
              <Button
                className="ritual-btn mt-8"
                onClick={(event) => {
                  event.stopPropagation();
                  onReturn();
                }}
              >
                Return
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {!showCard ? (
          <p className="mt-8 text-xs tracking-[0.28em] text-[#9a8b7a] uppercase">
            Continue
          </p>
        ) : null}
      </div>
    </section>
  );
}
