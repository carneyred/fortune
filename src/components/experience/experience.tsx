"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AftermathBar } from "@/components/experience/aftermath-bar";
import { ArchiveOverlay } from "@/components/experience/archive-overlay";
import { AudioProvider, useRitualAudio } from "@/components/experience/audio-provider";
import { Hud } from "@/components/experience/hud";
import { InsufficientFates } from "@/components/experience/insufficient-fates";
import { IntroStage } from "@/components/experience/intro-stage";
import { Landing } from "@/components/experience/landing";
import { PlayingCard } from "@/components/experience/playing-card";
import { StoryPanel } from "@/components/experience/story-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  loadArchive,
  loadLastCardId,
  persistLastCardId,
  rememberFate,
} from "@/lib/archive";
import { AUDIO_BEDS, type BedKey } from "@/lib/audio/beds";
import { drawHand, hasEnoughFates, splitStory } from "@/lib/content/draw";
import type { ArchiveEntry, Catalog, DrawnFate } from "@/lib/content/types";
import { CardFrame } from "@/components/experience/card-frame";

const TableCanvas = dynamic(
  () => import("@/components/experience/table-canvas").then((mod) => mod.TableCanvas),
  { ssr: false },
);

type Phase =
  | "landing"
  | "intro"
  | "draw"
  | "reveal"
  | "aftermath"
  | "insufficient";

function ExperienceMachine({ catalog }: { catalog: Catalog }) {
  const { unlock, playBed, playSfx } = useRitualAudio();
  const [phase, setPhase] = useState<Phase>("landing");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const [hand, setHand] = useState<DrawnFate[] | null>(null);
  const [focused, setFocused] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [vanished, setVanished] = useState<Record<string, boolean>>({});
  const [faceUp, setFaceUp] = useState(false);
  const [locked, setLocked] = useState(false);
  const [storyCount, setStoryCount] = useState(1);
  const [fortuneRevealed, setFortuneRevealed] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [archive, setArchive] = useState<ArchiveEntry[]>(loadArchive);
  const [lastCardId, setLastCardId] = useState<string | null>(loadLastCardId);
  const completedVanishes = useRef(new Set<string>());

  const scene = catalog.scenes[sceneIndex];
  const selected = selectedIndex !== null ? hand?.[selectedIndex] : null;
  const showTable =
    phase === "draw" ||
    phase === "reveal" ||
    phase === "aftermath" ||
    (phase === "intro" && scene?.id === "table");

  useEffect(() => {
    if (phase === "landing") playBed(null);
    else if (phase === "intro" && scene && scene.ambientKey in AUDIO_BEDS) {
      playBed(scene.ambientKey as BedKey);
    } else {
      playBed("table");
    }
  }, [phase, playBed, scene]);

  const beginDraw = useCallback(() => {
    if (!hasEnoughFates(catalog)) {
      setPhase("insufficient");
      playBed("table");
      return;
    }
    completedVanishes.current = new Set();
    const nextHand = drawHand(catalog, { avoidCardId: lastCardId });
    setHand(nextHand);
    setFocused(2);
    setSelectedIndex(null);
    setVanished({});
    setFaceUp(false);
    setLocked(false);
    setStoryCount(1);
    setFortuneRevealed(false);
    setPhase("draw");
    playBed("table");
    playSfx("whisper");
  }, [catalog, lastCardId, playBed, playSfx]);

  const continueIntro = useCallback(() => {
    if (!scene) return;
    playSfx("continue");
    if (blockIndex < scene.blocks.length - 1) {
      setBlockIndex((value) => value + 1);
      return;
    }
    if (sceneIndex < catalog.scenes.length - 1) {
      setSceneIndex((value) => value + 1);
      setBlockIndex(0);
      return;
    }
    beginDraw();
  }, [beginDraw, blockIndex, catalog.scenes.length, playSfx, scene, sceneIndex]);

  useEffect(() => {
    if (phase !== "intro" || archiveOpen) return;
    const ms = scene?.autoAdvanceMs ?? catalog.settings.introAutoAdvanceMs;
    const timer = window.setTimeout(continueIntro, ms);
    return () => window.clearTimeout(timer);
  }, [
    archiveOpen,
    catalog.settings.introAutoAdvanceMs,
    continueIntro,
    phase,
    scene?.autoAdvanceMs,
    sceneIndex,
    blockIndex,
  ]);

  const startReading = useCallback(() => {
    if (!selected) return;
    setPhase("reveal");
    setStoryCount(1);
    setFortuneRevealed(false);
  }, [selected]);

  const markVanishDone = useCallback(
    (instanceId: string) => {
      completedVanishes.current.add(instanceId);
      const remaining = (hand ?? []).filter((_, index) => index !== selectedIndex);
      if (remaining.every((fate) => completedVanishes.current.has(fate.instanceId))) {
        startReading();
      }
    },
    [hand, selectedIndex, startReading],
  );

  const commitCard = useCallback(
    (index: number) => {
      if (!hand) return;
      const fate = hand[index];
      if (!fate) return;
      setLocked(true);
      setSelectedIndex(index);
      setFocused(index);
      playSfx("select");
      persistLastCardId(fate.card.id);
      setLastCardId(fate.card.id);
      setArchive(rememberFate(fate.card.id, fate.story.id));

      const nextVanished: Record<string, boolean> = {};
      hand.forEach((item, itemIndex) => {
        if (itemIndex !== index) nextVanished[item.instanceId] = true;
      });
      setVanished(nextVanished);

      window.setTimeout(() => setFaceUp(true), 520);
      window.setTimeout(startReading, 2600);
    },
    [hand, playSfx, startReading],
  );

  const chooseCard = useCallback(
    (index: number) => {
      if (phase !== "draw" || locked || !hand || !hand[index]) return;
      if (Math.random() < 0.3) {
        setLocked(true);
        setFocused(index);
        setPendingIndex(index);
        playSfx("whisper");
        return;
      }
      commitCard(index);
    },
    [commitCard, hand, locked, phase, playSfx],
  );

  const confirmChoice = useCallback(() => {
    const index = pendingIndex;
    setPendingIndex(null);
    if (index !== null) commitCard(index);
  }, [commitCard, pendingIndex]);

  const cancelChoice = useCallback(() => {
    setPendingIndex(null);
    setLocked(false);
    playSfx("hover");
  }, [playSfx]);

  const advanceStory = useCallback(() => {
    if (!selected || phase === "aftermath") return;
    const parts = splitStory(selected.story.body);
    if (storyCount < parts.length) {
      setStoryCount((value) => value + 1);
      playSfx("continue");
      return;
    }
    if (!fortuneRevealed) {
      setFortuneRevealed(true);
      playSfx("whisper");
      return;
    }
    setPhase("aftermath");
  }, [fortuneRevealed, phase, playSfx, selected, storyCount]);

  useEffect(() => {
    if (phase !== "reveal" || archiveOpen) return;
    const timer = window.setTimeout(
      advanceStory,
      catalog.settings.storyAdvanceMs,
    );
    return () => window.clearTimeout(timer);
  }, [
    advanceStory,
    archiveOpen,
    catalog.settings.storyAdvanceMs,
    fortuneRevealed,
    phase,
    storyCount,
  ]);

  const enter = useCallback(() => {
    unlock();
    playSfx("continue");
    if (!hasEnoughFates(catalog)) {
      setPhase("insufficient");
      return;
    }
    setSceneIndex(0);
    setBlockIndex(0);
    setPhase("intro");
  }, [catalog, playSfx, unlock]);

  const returnHome = useCallback(() => {
    setPhase("landing");
    setHand(null);
    setSelectedIndex(null);
    setLocked(false);
    playBed(null);
  }, [playBed]);

  const hoverCard = useCallback(
    (index: number) => {
      if (locked) return;
      setFocused(index);
      playSfx("hover");
    },
    [locked, playSfx],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (archiveOpen && event.key === "Escape") {
        setArchiveOpen(false);
        return;
      }
      if (event.key === "m" || event.key === "M") return;
      if (event.key === "a" && (phase === "draw" || phase === "aftermath")) {
        setArchiveOpen(true);
        return;
      }
      if (phase === "landing" && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        enter();
        return;
      }
      if (phase === "intro" && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        continueIntro();
        return;
      }
      if (phase === "draw" && hand && !locked) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setFocused((value) => Math.min(hand.length - 1, value + 1));
          playSfx("hover");
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setFocused((value) => Math.max(0, value - 1));
          playSfx("hover");
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          chooseCard(focused);
        }
        const numeric = Number(event.key);
        if (numeric >= 1 && numeric <= 5) chooseCard(numeric - 1);
      }
      if (
        (phase === "reveal" || phase === "aftermath") &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        if (phase === "reveal") advanceStory();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    advanceStory,
    archiveOpen,
    chooseCard,
    continueIntro,
    enter,
    focused,
    hand,
    locked,
    phase,
    playSfx,
  ]);

  const paragraphs = useMemo(
    () => (selected ? splitStory(selected.story.body).length : 0),
    [selected],
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#070504]">
      {showTable ? (
        <TableCanvas reveal={phase === "reveal" || phase === "aftermath"} />
      ) : (
        <div className="absolute inset-0 bg-[#070504]" />
      )}
      <div className="grain" />
      <div className="vignette" />
      <Hud
        showArchive={phase !== "landing"}
        onOpenArchive={() => setArchiveOpen(true)}
      />

      <AnimatePresence mode="wait">
        {phase === "landing" ? (
          <Landing
            key="landing"
            title={catalog.settings.title}
            tagline={catalog.settings.tagline}
            onEnter={enter}
          />
        ) : null}
        {phase === "insufficient" ? (
          <InsufficientFates key="empty" onReturn={returnHome} />
        ) : null}
        {phase === "intro" && scene ? (
          <IntroStage
            key={scene.id}
            scene={scene}
            blockIndex={blockIndex}
            onContinue={continueIntro}
          />
        ) : null}
      </AnimatePresence>

      {phase === "draw" && hand ? (
        <div className="absolute inset-x-0 bottom-[7%] z-20 flex items-end justify-center gap-2 px-3 sm:gap-4">
          {hand.map((fate, index) => (
            <PlayingCard
              key={fate.instanceId}
              fate={fate}
              index={index}
              focused={focused === index}
              selected={selectedIndex === index}
              vanished={Boolean(vanished[fate.instanceId])}
              vanishEffect="ash"
              faceUp={selectedIndex === index && faceUp}
              locked={locked}
              onHover={() => hoverCard(index)}
              onSelect={() => chooseCard(index)}
              onVanishComplete={() => markVanishDone(fate.instanceId)}
            />
          ))}
        </div>
      ) : null}

      {(phase === "reveal" || phase === "aftermath") && selected ? (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center px-4 py-16 sm:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid w-full max-w-6xl items-center gap-6 md:grid-cols-[minmax(140px,220px)_minmax(0,1fr)]">
            <div className="mx-auto w-[42vw] max-w-[220px] min-w-[120px]">
              <CardFrame
                src={selected.card.frontImage}
                alt={selected.card.title}
              />
            </div>
            <div className="space-y-5">
              <StoryPanel
                fate={selected}
                visibleCount={storyCount}
                fortuneRevealed={fortuneRevealed}
                onAdvance={advanceStory}
              />
              {phase === "aftermath" ||
              (fortuneRevealed && storyCount >= paragraphs) ? (
                <AftermathBar
                  onDrawAgain={beginDraw}
                  onReturn={returnHome}
                  onArchive={() => setArchiveOpen(true)}
                />
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}

      <Dialog
        open={pendingIndex !== null}
        onOpenChange={(open) => {
          if (!open) cancelChoice();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="border-[#c4a35a55] bg-[#120d09] p-6 text-[#f3e6c4] sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-[0.24em] text-gold uppercase">
              The Fortune Teller stays your hand
            </DialogTitle>
            <DialogDescription className="font-serif pt-1 text-xl text-[#d8c7a4] italic">
              &ldquo;Are you sure you want this card?&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={cancelChoice}
              className="border-[#c4a35a55] bg-transparent font-display text-xs tracking-[0.18em] text-[#d8c7a4] uppercase hover:bg-[#c4a35a1f] hover:text-[#f3e6c4] dark:border-[#c4a35a55] dark:bg-transparent dark:hover:bg-[#c4a35a1f]"
            >
              Let me reconsider
            </Button>
            <Button
              onClick={confirmChoice}
              className="bg-gold font-display text-xs tracking-[0.18em] text-[#140e08] uppercase hover:bg-[#d4b36a]"
            >
              I am certain
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ArchiveOverlay
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        catalog={catalog}
        entries={archive}
      />
    </div>
  );
}

export function Experience({ catalog }: { catalog: Catalog }) {
  return (
    <AudioProvider>
      <ExperienceMachine catalog={catalog} />
    </AudioProvider>
  );
}
