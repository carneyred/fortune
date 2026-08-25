import type { ArchiveEntry } from "@/lib/content/types";

export const ARCHIVE_STORAGE_KEY = "ferryman.archive.v1";
export const MUTE_STORAGE_KEY = "ferryman.mute.v1";
export const LAST_CARD_STORAGE_KEY = "ferryman.lastCard.v1";

export function loadArchive(): ArchiveEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ArchiveEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberFate(cardId: string, storyId: string): ArchiveEntry[] {
  const existing = loadArchive();
  const already = existing.some(
    (entry) => entry.cardId === cardId && entry.storyId === storyId,
  );
  const next = already
    ? existing
    : [...existing, { cardId, storyId, seenAt: new Date().toISOString() }];
  window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function loadMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
}

export function persistMuted(muted: boolean) {
  window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
}

export function loadLastCardId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_CARD_STORAGE_KEY);
}

export function persistLastCardId(cardId: string) {
  window.localStorage.setItem(LAST_CARD_STORAGE_KEY, cardId);
}
