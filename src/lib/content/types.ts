export const CONTENT_STATUSES = [
  "draft",
  "ready",
  "published",
  "hidden",
  "locked",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const VANISH_EFFECTS = [
  "dust",
  "flash-fire",
  "embers",
  "fade-grain",
] as const;

export type VanishEffect = (typeof VANISH_EFFECTS)[number];

export const VANISH_MODES = [
  "global",
  "random-per-draw",
  "per-card",
  "mixed",
] as const;

export type VanishMode = (typeof VANISH_MODES)[number];

export type CardStory = {
  id: string;
  status: ContentStatus;
  title: string;
  body: string;
  fortuneLine: string;
};

export type CardRecord = {
  id: string;
  title: string;
  number: string;
  status: ContentStatus;
  symbol: string;
  frontImage: string;
  backImage: string;
  stories: CardStory[];
  keywords: string[];
  vanishEffect: VanishEffect;
};

export type SceneBlock = {
  id: string;
  text: string;
};

export type SceneRecord = {
  id: string;
  title: string;
  backgroundImage: string;
  ambientKey: string;
  blocks: SceneBlock[];
  autoAdvanceMs: number;
};

export type SiteSettings = {
  title: string;
  tagline: string;
  drawSize: number;
  minPublishedCards: number;
  vanishMode: VanishMode;
  globalVanishEffect: VanishEffect;
  introAutoAdvanceMs: number;
  storyAdvanceMs: number;
  avoidRepeatLastCard: boolean;
};

export type Catalog = {
  settings: SiteSettings;
  cards: CardRecord[];
  scenes: SceneRecord[];
};

export type DrawnFate = {
  instanceId: string;
  card: CardRecord;
  story: CardStory;
  vanishEffect: VanishEffect;
};

export type ArchiveEntry = {
  cardId: string;
  storyId: string;
  seenAt: string;
};
