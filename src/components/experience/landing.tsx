"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

type LandingProps = {
  title: string;
  tagline: string;
  onEnter: () => void;
};

export function Landing({ title, tagline, onEnter }: LandingProps) {
  return (
    <motion.section
      className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url(/scenes/street.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 flex flex-col items-center">
        <p className="font-display mb-6 text-[0.7rem] tracking-[0.55em] text-gold/80 uppercase">
          A reading
        </p>
        <h1 className="font-display max-w-4xl text-4xl leading-[1.1] font-semibold tracking-[0.14em] text-[#f3e6c4] uppercase sm:text-6xl">
          {title}
        </h1>
        <div className="my-8 h-px w-40 bg-linear-to-r from-transparent via-gold to-transparent" />
        <p className="font-serif max-w-md text-xl text-[#d8c7a4] italic sm:text-2xl">
          {tagline}
        </p>
        <Button className="ritual-btn mt-12" onClick={onEnter}>
          Enter
        </Button>
        <p className="mt-8 max-w-sm text-sm tracking-wide text-[#9a8b7a]">
          Click or press Enter. Music may begin. You may silence it at any time.
        </p>
      </div>
    </motion.section>
  );
}
