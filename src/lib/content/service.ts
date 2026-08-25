import "server-only";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { assetPath } from "@/lib/asset-path";

import {
  CONTENT_STATUSES,
  VANISH_EFFECTS,
  VANISH_MODES,
  type CardRecord,
  type CardStory,
  type Catalog,
  type ContentStatus,
  type SceneRecord,
  type SiteSettings,
  type VanishEffect,
  type VanishMode,
} from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readJsonFile<T>(filePath: string): T {
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function isStatus(value: unknown): value is ContentStatus {
  return (
    typeof value === "string" &&
    (CONTENT_STATUSES as readonly string[]).includes(value)
  );
}

function isVanish(value: unknown): value is VanishEffect {
  return (
    typeof value === "string" &&
    (VANISH_EFFECTS as readonly string[]).includes(value)
  );
}

function isVanishMode(value: unknown): value is VanishMode {
  return (
    typeof value === "string" &&
    (VANISH_MODES as readonly string[]).includes(value)
  );
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid content: ${label} must be a non-empty string`);
  }
  return value;
}

function loadSettings(): SiteSettings {
  const data = readJsonFile<Record<string, unknown>>(
    path.join(CONTENT_ROOT, "settings", "site.json"),
  );

  return {
    title: assertString(data.title, "settings.title"),
    tagline: assertString(data.tagline, "settings.tagline"),
    drawSize: typeof data.drawSize === "number" ? data.drawSize : 5,
    minPublishedCards:
      typeof data.minPublishedCards === "number" ? data.minPublishedCards : 5,
    vanishMode: isVanishMode(data.vanishMode) ? data.vanishMode : "mixed",
    globalVanishEffect: isVanish(data.globalVanishEffect)
      ? data.globalVanishEffect
      : "embers",
    introAutoAdvanceMs:
      typeof data.introAutoAdvanceMs === "number"
        ? data.introAutoAdvanceMs
        : 18000,
    storyAdvanceMs:
      typeof data.storyAdvanceMs === "number" ? data.storyAdvanceMs : 7000,
    avoidRepeatLastCard: data.avoidRepeatLastCard !== false,
  };
}

function loadStories(raw: unknown, cardId: string): CardStory[] {
  if (!Array.isArray(raw)) {
    throw new Error(`Invalid content: ${cardId}.stories must be an array`);
  }

  return raw.map((entry, index) => {
    const story = entry as Record<string, unknown>;
    return {
      id: assertString(story.id, `${cardId}.stories[${index}].id`),
      status: isStatus(story.status) ? story.status : "draft",
      title: assertString(story.title, `${cardId}.stories[${index}].title`),
      body: typeof story.body === "string" ? story.body : "",
      fortuneLine:
        typeof story.fortuneLine === "string" ? story.fortuneLine : "",
    };
  });
}

function loadCards(): CardRecord[] {
  const dir = path.join(CONTENT_ROOT, "cards");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort();

  return files.map((file) => {
    const data = readJsonFile<Record<string, unknown>>(path.join(dir, file));
    const id = assertString(data.id, `${file}.id`);

    return {
      id,
      title: assertString(data.title, `${id}.title`),
      number: assertString(data.number, `${id}.number`),
      status: isStatus(data.status) ? data.status : "draft",
      symbol: assertString(data.symbol, `${id}.symbol`),
      frontImage: assetPath(assertString(data.frontImage, `${id}.frontImage`)),
      backImage: assetPath(assertString(data.backImage, `${id}.backImage`)),
      stories: loadStories(data.stories, id),
      keywords: Array.isArray(data.keywords)
        ? data.keywords.filter((item): item is string => typeof item === "string")
        : [],
      vanishEffect: isVanish(data.vanishEffect) ? data.vanishEffect : "fade-grain",
    };
  });
}

function loadScenes(): SceneRecord[] {
  const dir = path.join(CONTENT_ROOT, "scenes");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort();

  const scenes = files.map((file) => {
    const data = readJsonFile<Record<string, unknown>>(path.join(dir, file));
    const id = assertString(data.id, `${file}.id`);
    const blocksRaw = Array.isArray(data.blocks) ? data.blocks : [];

    return {
      id,
      title: assertString(data.title, `${id}.title`),
      backgroundImage: assetPath(
        assertString(data.backgroundImage, `${id}.backgroundImage`),
      ),
      ambientKey: assertString(data.ambientKey, `${id}.ambientKey`),
      autoAdvanceMs:
        typeof data.autoAdvanceMs === "number" ? data.autoAdvanceMs : 16000,
      blocks: blocksRaw.map((entry, index) => {
        const block = entry as Record<string, unknown>;
        return {
          id: assertString(block.id, `${id}.blocks[${index}].id`),
          text: assertString(block.text, `${id}.blocks[${index}].text`),
        };
      }),
    };
  });

  const order = ["street", "shop", "corridor", "table"];
  return scenes.sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

export function loadCatalog(): Catalog {
  return {
    settings: loadSettings(),
    cards: loadCards(),
    scenes: loadScenes(),
  };
}
