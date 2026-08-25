"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Howl, Howler } from "howler";

import { loadMuted, persistMuted } from "@/lib/archive";
import { AUDIO_BEDS, AUDIO_SFX, type BedKey, type SfxKey } from "@/lib/audio/beds";

type AudioApi = {
  muted: boolean;
  unlocked: boolean;
  toggleMute: () => void;
  unlock: () => void;
  playBed: (key: BedKey | null) => void;
  playSfx: (key: SfxKey) => void;
  caption: string | null;
};

const AudioContextValue = createContext<AudioApi | null>(null);

function makeBed(src: string) {
  return new Howl({
    src: [src],
    loop: true,
    volume: 0,
    preload: true,
    html5: false,
  });
}

function makeSfx(src: string) {
  return new Howl({
    src: [src],
    volume: 0.28,
    preload: true,
  });
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(loadMuted);
  const [unlocked, setUnlocked] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const bedsRef = useRef<Partial<Record<BedKey, Howl>>>({});
  const sfxRef = useRef<Partial<Record<SfxKey, Howl>>>({});
  const currentBed = useRef<BedKey | null>(null);
  const captionTimer = useRef<number | null>(null);

  useEffect(() => {
    Howler.volume(0.7);

    const beds = Object.fromEntries(
      (Object.keys(AUDIO_BEDS) as BedKey[]).map((key) => [key, makeBed(AUDIO_BEDS[key])]),
    ) as Record<BedKey, Howl>;
    const sfx = Object.fromEntries(
      (Object.keys(AUDIO_SFX) as SfxKey[]).map((key) => [key, makeSfx(AUDIO_SFX[key])]),
    ) as Record<SfxKey, Howl>;

    bedsRef.current = beds;
    sfxRef.current = sfx;

    return () => {
      Object.values(beds).forEach((howl) => howl.unload());
      Object.values(sfx).forEach((howl) => howl.unload());
    };
  }, []);

  useEffect(() => {
    Howler.mute(muted);
    persistMuted(muted);
  }, [muted]);

  const announce = useCallback((text: string) => {
    setCaption(text);
    if (captionTimer.current) window.clearTimeout(captionTimer.current);
    captionTimer.current = window.setTimeout(() => setCaption(null), 1400);
  }, []);

  const unlock = useCallback(() => {
    if (unlocked) return;
    try {
      Howler.ctx?.resume?.();
    } catch {
      // Autoplay policies can block until a later gesture.
    }
    setUnlocked(true);
  }, [unlocked]);

  const playBed = useCallback(
    (key: BedKey | null) => {
      const beds = bedsRef.current;
      if (currentBed.current === key) return;

      const outgoing = currentBed.current ? beds[currentBed.current] : null;
      if (outgoing) outgoing.fade(outgoing.volume(), 0, 1200);

      currentBed.current = key;
      if (!key) return;

      const incoming = beds[key];
      if (!incoming) return;
      if (!incoming.playing()) incoming.play();
      incoming.fade(incoming.volume(), muted ? 0 : 0.42, 1400);
    },
    [muted],
  );

  const playSfx = useCallback(
    (key: SfxKey) => {
      if (muted) {
        announce(key);
        return;
      }
      const sound = sfxRef.current[key];
      try {
        sound?.play();
      } catch {
        announce(key);
      }
      announce(key);
    },
    [announce, muted],
  );

  const toggleMute = useCallback(() => {
    setMuted((value) => !value);
  }, []);

  const api = useMemo(
    () => ({
      muted,
      unlocked,
      toggleMute,
      unlock,
      playBed,
      playSfx,
      caption,
    }),
    [caption, muted, playBed, playSfx, toggleMute, unlock, unlocked],
  );

  return (
    <AudioContextValue.Provider value={api}>{children}</AudioContextValue.Provider>
  );
}

export function useRitualAudio() {
  const value = useContext(AudioContextValue);
  if (!value) {
    throw new Error("useRitualAudio must be used within AudioProvider");
  }
  return value;
}
