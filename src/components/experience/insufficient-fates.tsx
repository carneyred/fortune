"use client";

import { Button } from "@/components/ui/button";

type InsufficientFatesProps = {
  onReturn: () => void;
};

export function InsufficientFates({ onReturn }: InsufficientFatesProps) {
  return (
    <section className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl tracking-[0.18em] text-[#f3e6c4] uppercase">
        Not enough fates
      </h1>
      <p className="font-serif mt-6 max-w-md text-xl text-[#d8c7a4]">
        The deck will not open until five published cards, each with a published
        story, are waiting on the other side.
      </p>
      <Button className="ritual-btn mt-10" onClick={onReturn}>
        Return
      </Button>
    </section>
  );
}
