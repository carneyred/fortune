# Payment for the Ferryman

A cinematic, content-driven tarot reading. You enter from the street, pay two pennies, and choose one of five facedown cards. The others vanish. A parchment fable remains.

Pacing is ritualistic and intimate: haunted folklore, occult gallery, dream logic. Not jump-scare horror.

## Run locally

```bash
npm install
npm run generate:assets
npm run dev
```

The dev server binds to `http://127.0.0.1:43147`.

`generate:assets` writes placeholder card faces, a shared back, scene stills, a table texture, and quiet generated WAV beds. Real art and licensed audio can replace those files without changing code, as long as the paths stay the same.

```bash
npm run build
npm start
```

## How a reading works

1. **Landing** — title, the line *Payment is required. Not always in coin.*, Enter.
2. **Intro** — street, shop, corridor, table. Click or wait to continue.
3. **Draw** — five unique published cards, facedown, on the table.
4. **Choose** — hover lifts a card; click locks the table. The other four vanish.
5. **Story** — the chosen face stays; the parchment reveals beside the candle. The fortune line comes last.
6. **Aftermath** — Draw again, Archive, or Return.

The Clock is shipped as `draft` and never enters the draw. The intro may still speak of twelve cards. The playable table always shows five.

## Content architecture

UI never reads files. `src/lib/content/service.ts` loads JSON from disk and hands a catalog to the client.

```
content/settings/site.json
content/scenes/*.json
content/cards/*.json
public/cards/<id>/front.jpg
public/cards/shared/back.png
```

Statuses: `draft | ready | published | hidden | locked`.

A card enters the draw only when:

- `status` is `published`
- at least one story also has `status: "published"`

If fewer than five published cards exist, the table refuses the reading and shows **Not enough fates**.

### Add a 13th card

1. Create `content/cards/new-id.json` using the shape below.
2. Drop art at `public/cards/new-id/front.jpg`.
3. Restart the dev server (or rebuild).

```json
{
  "id": "new-id",
  "title": "The Thirteenth",
  "number": "XIII",
  "status": "published",
  "symbol": "coin",
  "frontImage": "/cards/new-id/front.jpg",
  "backImage": "/cards/shared/back.png",
  "keywords": ["omen"],
  "vanishEffect": "embers",
  "stories": [
    {
      "id": "default",
      "status": "published",
      "title": "The Thirteenth",
      "body": "Paragraph one.\n\nParagraph two.",
      "fortuneLine": "The last coin is still warm."
    }
  ]
}
```

To add another telling of an existing card, append a published object to `stories[]`. The draw picks a published card, then a random published variation.

Sanctuary and The Lighthouse already ship two published variations each.

### Card image size

The table always shows a **3:5** frame (`aspect-ratio: 3 / 5`) with `object-fit: contain`. Current faces may be 1024×1536 (2:3). They letterbox inside the frame until official 1500×2500 (3:5) art replaces them. The shared back is already near 3:5.

If a face 404s, the frame falls back to `/cards/shared/missing.jpg`.

## Vanish modes

Implemented: `dust`, `flash-fire`, `embers`, `fade-grain`.

`content/settings/site.json` → `vanishMode`:

- `global` — every unselected card uses `globalVanishEffect`
- `random-per-draw` — one random effect for the whole hand
- `per-card` — each card uses its own `vanishEffect`
- `mixed` (default) — each vanishing card rolls its own effect

Reduced motion skips particles and fades only.

## Archive

Seen card/story pairs are stored in `localStorage` under `ferryman.archive.v1`. The overlay shows title, art, story, fortune line, symbol, and keywords.

## Audio

Howler plays generated looping beds and quiet SFX. If the browser blocks audio, the reading still continues. Mute is in the corner and persists as `ferryman.mute.v1`.

Replace the WAV files in `public/audio/` with finished tracks when you have them. Suggested Suno prompts:

1. **Street bed** — Heat-haze urban drone, distant metal can, one coin turning, dry wind down a sunstruck alley, no melody, analog tape hiss, occult documentary, 70 BPM, loopable.
2. **Shop bed** — Interior wood room, old woman humming a fractured Für Elise very far away, knitting needles as sparse percussion, dust, low cello, candle air, loopable.
3. **Corridor bed** — Narrow hallway resonance, footsteps that do not belong to you, a door that will not open for the guide, thin metallic reverb, almost no rhythm, loopable.
4. **Table bed** — Single black candle crackle, Egyptian incense smoke, ritual fifth drone, gold-on-black stillness, ghosted choir very low, intimate, not a jump scare, loopable.

## Stack

Next.js, React, TypeScript, Tailwind, shadcn/ui, React Three Fiber, Framer Motion, Howler.

## Keyboard

- Enter / Space — continue, enter, or choose the focused card
- Arrow keys — move focus across the five cards
- 1–5 — choose a card directly
- Archive and mute buttons are in the chrome
