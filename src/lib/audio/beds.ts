import { assetPath } from "@/lib/asset-path";

export const AUDIO_BEDS = {
  street: assetPath("/audio/beds/street.wav"),
  shop: assetPath("/audio/beds/shop.wav"),
  corridor: assetPath("/audio/beds/corridor.wav"),
  table: assetPath("/audio/beds/table.wav"),
} as const;

export const AUDIO_SFX = {
  hover: assetPath("/audio/sfx/hover.wav"),
  select: assetPath("/audio/sfx/select.wav"),
  whisper: assetPath("/audio/sfx/whisper.wav"),
  continue: assetPath("/audio/sfx/continue.wav"),
} as const;

export type BedKey = keyof typeof AUDIO_BEDS;
export type SfxKey = keyof typeof AUDIO_SFX;
