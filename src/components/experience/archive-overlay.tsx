"use client";

import { useMemo, useState } from "react";

import { CardFrame } from "@/components/experience/card-frame";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ArchiveEntry, Catalog } from "@/lib/content/types";

type ArchiveOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: Catalog;
  entries: ArchiveEntry[];
};

export function ArchiveOverlay({
  open,
  onOpenChange,
  catalog,
  entries,
}: ArchiveOverlayProps) {
  const [active, setActive] = useState<string | null>(null);

  const discovered = useMemo(() => {
    return entries
      .map((entry) => {
        const card = catalog.cards.find((item) => item.id === entry.cardId);
        const story = card?.stories.find((item) => item.id === entry.storyId);
        if (!card || !story) return null;
        return { entry, card, story };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [catalog.cards, entries]);

  const selected = discovered.find(
    (item) => `${item.card.id}:${item.story.id}` === active,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-[#c4a35a55] bg-[#120d09] text-[#f3e6c4] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-display tracking-[0.2em] uppercase">
            Discovered deck
          </DialogTitle>
          <DialogDescription className="text-[#b9a88a]">
            Only fates you have already chosen remain in the archive.
          </DialogDescription>
        </DialogHeader>

        {discovered.length === 0 ? (
          <p className="font-serif py-8 text-lg text-[#d8c7a4]">
            The archive is empty. Sit at the table first.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {discovered.map(({ card, story }) => {
                const key = `${card.id}:${story.id}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActive(key)}
                    className="text-left"
                  >
                    <CardFrame src={card.frontImage} alt={story.title} />
                    <p className="font-display mt-2 text-[0.65rem] tracking-[0.18em] uppercase">
                      {card.number} {story.title}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="parchment min-h-[280px] px-5 py-5">
              {selected ? (
                <>
                  <p className="font-display text-[0.68rem] tracking-[0.28em] text-[#7a1f12] uppercase">
                    {selected.card.number} · {selected.card.symbol}
                  </p>
                  <h3 className="font-display mt-2 text-2xl uppercase">
                    {selected.story.title}
                  </h3>
                  <p className="mt-2 text-xs tracking-[0.16em] text-[#6a5340] uppercase">
                    {selected.card.keywords.join(" · ")}
                  </p>
                  <div className="font-serif mt-4 space-y-3 text-[#2c1c12]">
                    {selected.story.body.split(/\n\s*\n/).map((part) => (
                      <p key={part}>{part}</p>
                    ))}
                  </div>
                  {selected.story.fortuneLine ? (
                    <p className="fortune-line font-serif mt-5 text-lg">
                      {selected.story.fortuneLine}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="font-serif text-[#2c1c12]">
                  Choose a discovered card to read it again.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
