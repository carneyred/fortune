export const AUDIO_BEDS = {
  street: "/audio/beds/street.wav",
  shop: "/audio/beds/shop.wav",
  corridor: "/audio/beds/corridor.wav",
  table: "/audio/beds/table.wav",
} as const;

export const AUDIO_SFX = {
  hover: "/audio/sfx/hover.wav",
  select: "/audio/sfx/select.wav",
  whisper: "/audio/sfx/whisper.wav",
  continue: "/audio/sfx/continue.wav",
} as const;

export type BedKey = keyof typeof AUDIO_BEDS;
export type SfxKey = keyof typeof AUDIO_SFX;
