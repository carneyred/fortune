"use client";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRitualAudio } from "@/components/experience/audio-provider";

type HudProps = {
  onOpenArchive: () => void;
  showArchive: boolean;
};

export function Hud({ onOpenArchive, showArchive }: HudProps) {
  const { muted, toggleMute, caption } = useRitualAudio();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-4">
      <div className="pointer-events-auto">
        {showArchive ? (
          <Button
            variant="ghost"
            className="font-display tracking-[0.22em] text-[#d8c7a4] uppercase"
            onClick={onOpenArchive}
          >
            Archive
          </Button>
        ) : null}
      </div>
      <div className="pointer-events-auto flex items-center gap-3">
        <span className="sr-only" aria-live="polite">
          {caption ? `Sound: ${caption}` : ""}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#d8c7a4]"
          onClick={toggleMute}
          aria-label={muted ? "Unmute music" : "Mute music"}
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
    </div>
  );
}
