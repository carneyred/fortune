import {
  VANISH_EFFECTS,
  type CardRecord,
  type CardStory,
  type Catalog,
  type DrawnFate,
  type VanishEffect,
} from "./types";

export function isPublishedCard(card: CardRecord): boolean {
  return (
    card.status === "published" &&
    card.stories.some((story) => story.status === "published")
  );
}

export function publishedStories(card: CardRecord): CardStory[] {
  return card.stories.filter((story) => story.status === "published");
}

export function getDrawPool(catalog: Catalog): CardRecord[] {
  return catalog.cards.filter(isPublishedCard);
}

export function hasEnoughFates(catalog: Catalog): boolean {
  return getDrawPool(catalog).length >= catalog.settings.minPublishedCards;
}

function pickOne<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export function resolveVanishEffects(
  catalog: Catalog,
  cards: CardRecord[],
  random: () => number,
): VanishEffect[] {
  const mode = catalog.settings.vanishMode;

  if (mode === "global") {
    return cards.map(() => catalog.settings.globalVanishEffect);
  }

  if (mode === "per-card") {
    return cards.map((card) => card.vanishEffect);
  }

  if (mode === "random-per-draw") {
    const shared = pickOne([...VANISH_EFFECTS], random);
    return cards.map(() => shared);
  }

  return cards.map(() => pickOne([...VANISH_EFFECTS], random));
}

export function drawHand(
  catalog: Catalog,
  options?: {
    random?: () => number;
    avoidCardId?: string | null;
  },
): DrawnFate[] | null {
  const random = options?.random ?? Math.random;
  const pool = getDrawPool(catalog);
  const size = catalog.settings.drawSize;

  if (pool.length < size) {
    return null;
  }

  let candidates = pool;
  if (
    catalog.settings.avoidRepeatLastCard &&
    options?.avoidCardId &&
    pool.length > size
  ) {
    const withoutLast = pool.filter((card) => card.id !== options.avoidCardId);
    if (withoutLast.length >= size) {
      candidates = withoutLast;
    }
  }

  const selected = shuffle(candidates, random).slice(0, size);
  const effects = resolveVanishEffects(catalog, selected, random);

  return selected.map((card, index) => {
    const story = pickOne(publishedStories(card), random);
    return {
      instanceId: `${card.id}:${story.id}:${index}`,
      card,
      story,
      vanishEffect: effects[index]!,
    };
  });
}

export function splitStory(body: string): string[] {
  return body
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}
