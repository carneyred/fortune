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

export const READING_LOCK_STORAGE_KEY = "ferryman.readingLock.v1";
export const READING_LOCK_MS = 24 * 60 * 60 * 1000;

export type ReadingLock = {
  cardId: string;
  storyId: string;
  at: number;
};

export function loadReadingLock(): ReadingLock | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(READING_LOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadingLock;
    if (typeof parsed?.cardId !== "string" || typeof parsed?.at !== "number") {
      return null;
    }
    if (Date.now() - parsed.at >= READING_LOCK_MS) {
      window.localStorage.removeItem(READING_LOCK_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistReadingLock(cardId: string, storyId: string): ReadingLock {
  const lock: ReadingLock = { cardId, storyId, at: Date.now() };
  window.localStorage.setItem(READING_LOCK_STORAGE_KEY, JSON.stringify(lock));
  return lock;
}

export function clearReadingLock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(READING_LOCK_STORAGE_KEY);
}
