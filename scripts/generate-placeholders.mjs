import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const FONT = "Noto Serif";

const CARDS = [
  { id: "the-bell", title: "THE BELL", number: "I", glyph: "🔔" },
  { id: "the-market", title: "THE MARKET", number: "II", glyph: "⚖" },
  { id: "compassion", title: "COMPASSION", number: "III", glyph: "✢" },
  { id: "sanctuary", title: "SANCTUARY", number: "IV", glyph: "⌂" },
  { id: "the-palisade", title: "THE PALISADE", number: "V", glyph: "||||" },
  { id: "the-clock", title: "THE CLOCK", number: "VI", glyph: "☠" },
  { id: "the-carnival", title: "THE CARNIVAL", number: "VII", glyph: "☽" },
  { id: "the-passions", title: "THE PASSIONS", number: "VIII", glyph: "♥" },
  { id: "beast-of-burden", title: "BEAST OF BURDEN", number: "IX", glyph: "🐺" },
  { id: "the-island", title: "THE ISLAND", number: "X", glyph: "≋" },
  { id: "the-lighthouse", title: "THE LIGHTHOUSE", number: "XI", glyph: "▲" },
  { id: "the-aviary", title: "THE AVIARY", number: "XII", glyph: "🗝️" },
];

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function parchmentFilter(id) {
  return `
    <filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="7" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0" result="g"/>
      <feBlend in="SourceGraphic" in2="g" mode="multiply"/>
    </filter>
  `;
}

function cardMotif(id) {
  const motifs = {
    "the-bell": `<path d="M512 430c-90 0-150 70-150 150 0 70 20 120 20 160h260c0-40 20-90 20-160 0-80-60-150-150-150z" fill="none" stroke="#1a0e08" stroke-width="14"/>
      <path d="M430 740h164" stroke="#1a0e08" stroke-width="16" stroke-linecap="round"/>
      <circle cx="512" cy="400" r="22" fill="#1a0e08"/>
      <path d="M512 360v-40" stroke="#1a0e08" stroke-width="12"/>`,
    "the-market": `<circle cx="512" cy="620" r="150" fill="none" stroke="#1a0e08" stroke-width="14"/>
      <text x="512" y="650" text-anchor="middle" font-family="${FONT}" font-size="140" fill="#1a0e08">2</text>
      <path d="M360 480h304M380 430l-40 50M644 430l40 50" stroke="#7a1f12" stroke-width="10" fill="none"/>`,
    compassion: `<path d="M512 420c80 80 180 160 180 260 0 90-80 150-180 150s-180-60-180-150c0-100 100-180 180-260z" fill="none" stroke="#1a0e08" stroke-width="12"/>
      <path d="M430 700l50-180 40 90 30-50 20 140" stroke="#7a1f12" stroke-width="8" fill="none"/>`,
    sanctuary: `<ellipse cx="512" cy="640" rx="170" ry="90" fill="none" stroke="#1a0e08" stroke-width="12"/>
      <path d="M340 640q172-220 344 0" fill="none" stroke="#1a0e08" stroke-width="12"/>
      <circle cx="470" cy="650" r="18" fill="#1a0e08"/><circle cx="554" cy="658" r="14" fill="#1a0e08"/>`,
    "the-palisade": `<g stroke="#1a0e08" stroke-width="16">
      ${[340, 400, 460, 520, 580, 640, 700].map((x) => `<path d="M${x} 820V420l30-50 30 50v400"/>`).join("")}
      <path d="M330 560h410M330 680h410"/>
    </g>`,
    "the-clock": `<circle cx="512" cy="620" r="170" fill="#e8c97a" stroke="#1a0e08" stroke-width="14"/>
      <text x="512" y="500" text-anchor="middle" font-family="${FONT}" font-size="42" fill="#1a0e08">VI</text>
      <text x="512" y="560" text-anchor="middle" font-family="${FONT}" font-size="28" fill="#7a1f12">NEVER</text>
      <path d="M512 620l40-90M512 620l-10 70" stroke="#1a0e08" stroke-width="8"/>
      <circle cx="512" cy="620" r="10" fill="#1a0e08"/>`,
    "the-carnival": `<path d="M300 760h424L512 380z" fill="none" stroke="#1a0e08" stroke-width="12"/>
      <path d="M360 680q152-80 304 0" fill="none" stroke="#7a1f12" stroke-width="8"/>
      <circle cx="430" cy="620" r="16" fill="#7a1f12"/><circle cx="594" cy="620" r="16" fill="#7a1f12"/>`,
    "the-passions": `<path d="M430 520c-50-70-140-20-90 70l172 190 172-190c50-90-40-140-90-70-30 40-82 20-82 20s-52 20-82-20z" fill="none" stroke="#7a1f12" stroke-width="12"/>
      <path d="M360 420v200M664 420v200" stroke="#1a0e08" stroke-width="8"/>`,
    "beast-of-burden": `<path d="M360 700q40-180 152-220 112 40 152 220" fill="none" stroke="#1a0e08" stroke-width="12"/>
      <circle cx="470" cy="560" r="10" fill="#e8c97a"/><circle cx="554" cy="560" r="10" fill="#e8c97a"/>
      <path d="M400 480l-40-80M624 480l40-80M512 480v-90" stroke="#1a0e08" stroke-width="8"/>`,
    "the-island": `<path d="M260 720q120-40 252-20 140-30 280 20-80 80-270 70-170 10-262-70z" fill="#1a0e08"/>
      <path d="M500 700V420l24-50 24 50v280" stroke="#7a1f12" stroke-width="10" fill="none"/>
      <circle cx="524" cy="360" r="18" fill="#c0392b"/>`,
    "the-lighthouse": `<path d="M470 780V400h84v380" fill="#1a0e08"/>
      <path d="M430 400h164l-20-70H450z" fill="#7a1f12"/>
      <circle cx="512" cy="300" r="28" fill="#e67e22"/>
      <path d="M300 820q212-40 424 0" stroke="#1a0e08" stroke-width="10" fill="none"/>`,
    "the-aviary": `<path d="M370 760V470q0-140 142-190 142 50 142 190v290z" fill="none" stroke="#1a0e08" stroke-width="12"/>
      <path d="M390 560h244M390 640h244M390 720h244" stroke="#1a0e08" stroke-width="6"/>
      <circle cx="512" cy="430" r="16" fill="#f3e6c4"/>
      <circle cx="450" cy="600" r="10" fill="#1a0e08"/><circle cx="560" cy="680" r="10" fill="#1a0e08"/>
      <path d="M300 420l80 80M280 700l90-20M720 500l-70 60" stroke="#7a1f12" stroke-width="6" fill="none"/>`,
  };
  return motifs[id] ?? "";
}

function frontSvg(card) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${parchmentFilter("p")}
    <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d8b56a"/>
      <stop offset="1" stop-color="#b07a32"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1536" fill="#8c5a22"/>
  <rect x="28" y="28" width="968" height="1480" fill="url(#wash)" filter="url(#p)"/>
  <rect x="52" y="52" width="920" height="1432" fill="none" stroke="#1a0e08" stroke-width="3"/>
  <rect x="68" y="68" width="888" height="1400" fill="none" stroke="#1a0e08" stroke-width="1.5"/>
  <text x="110" y="150" font-family="${FONT}" font-size="42" fill="#1a0e08">${card.glyph}</text>
  <text x="512" y="160" text-anchor="middle" font-family="${FONT}" font-size="72" font-weight="700" fill="#1a0e08">${card.number}</text>
  ${cardMotif(card.id)}
  <rect x="120" y="1320" width="784" height="110" fill="#c9a04a" stroke="#1a0e08" stroke-width="2"/>
  <text x="512" y="1392" text-anchor="middle" font-family="${FONT}" font-size="${card.title.length > 16 ? 42 : 54}" font-weight="700" fill="#1a0e08">${card.title}</text>
</svg>`;
}

function backSvg() {
  const filigree = Array.from({ length: 18 }, (_, i) => {
    const y = 90 + i * 80;
    return `<path d="M120 ${y} C 240 ${y - 40}, 320 ${y + 40}, 485 ${y} S 730 ${y - 40}, 851 ${y}" fill="none" stroke="#c4a35a" stroke-width="1.2" opacity="0.55"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="971" height="1619" viewBox="0 0 971 1619" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="leather">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="3"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.03  0 0 0 0.35 0"/>
    </filter>
  </defs>
  <rect width="971" height="1619" fill="#1c140c"/>
  <rect width="971" height="1619" filter="url(#leather)"/>
  <rect x="36" y="36" width="899" height="1547" fill="#0b0a08" stroke="#c4a35a" stroke-width="3"/>
  <rect x="52" y="52" width="867" height="1515" fill="none" stroke="#8a7038" stroke-width="1"/>
  ${filigree}
  <g transform="translate(485 810)" fill="none" stroke="#c4a35a" stroke-width="2">
    <circle r="34"/>
    <circle r="10" fill="#c4a35a"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i;
      const x2 = Math.cos(a) * 210;
      const y2 = Math.sin(a) * 210;
      return `<line x1="0" y1="0" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }).join("")}
  </g>
  <path d="M430 430 q55 -70 110 0" fill="none" stroke="#c4a35a" stroke-width="3"/>
  <path d="M430 1190 q55 70 110 0" fill="none" stroke="#c4a35a" stroke-width="3"/>
  <circle cx="160" cy="160" r="42" fill="none" stroke="#c4a35a" stroke-width="2"/>
  <circle cx="811" cy="160" r="42" fill="none" stroke="#c4a35a" stroke-width="2"/>
  <circle cx="160" cy="1459" r="42" fill="none" stroke="#c4a35a" stroke-width="2"/>
  <circle cx="811" cy="1459" r="42" fill="none" stroke="#c4a35a" stroke-width="2"/>
</svg>`;
}

function sceneSvg(kind) {
  const palettes = {
    street: ["#2a1608", "#c47a22", "#0d0a07"],
    shop: ["#1a120e", "#6b3a1e", "#0a0705"],
    corridor: ["#0c0a09", "#2a1c14", "#050403"],
    table: ["#140e0a", "#3a2416", "#070504"],
  };
  const [a, b, c] = palettes[kind];
  const extra =
    kind === "street"
      ? `<rect x="0" y="0" width="1920" height="420" fill="${b}" opacity="0.35"/>
         <rect x="200" y="380" width="220" height="520" fill="#0a0705"/>
         <rect x="720" y="300" width="180" height="600" fill="#0a0705"/>
         <rect x="1180" y="360" width="260" height="540" fill="#0a0705"/>`
      : kind === "shop"
        ? `<rect x="240" y="520" width="520" height="220" fill="#2a1a10"/>
           <circle cx="1480" y="240" r="40" fill="#e67e22" opacity="0.35"/>`
        : kind === "corridor"
          ? `<polygon points="960,120 820,1080 1100,1080" fill="#1a100c"/>
             <rect x="930" y="420" width="60" height="220" fill="#0a0705"/>`
          : `<rect x="80" y="180" width="1760" height="780" rx="18" fill="#1a120c"/>
             <circle cx="1500" y="280" r="18" fill="#e67e22" opacity="0.8"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/>
    </linearGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"/></filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#g)"/>
  ${extra}
  <rect width="1920" height="1080" filter="url(#n)" opacity="0.18"/>
  <rect width="1920" height="1080" fill="${b}" opacity="0.08"/>
</svg>`;
}

function woodSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="2048" height="2048" viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wood">
      <feTurbulence type="fractalNoise" baseFrequency="0.015 0.35" numOctaves="5" seed="11"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 0 0.06  0 0 0 1 0"/>
    </filter>
  </defs>
  <rect width="2048" height="2048" fill="#1a100c"/>
  <rect width="2048" height="2048" filter="url(#wood)"/>
  <rect width="2048" height="2048" fill="#000" opacity="0.25"/>
</svg>`;
}

function missingSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="900" height="1500" viewBox="0 0 900 1500" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="1500" fill="#2a1c10"/>
  <rect x="40" y="40" width="820" height="1420" fill="none" stroke="#c4a35a" stroke-width="3"/>
  <text x="450" y="760" text-anchor="middle" font-family="${FONT}" font-size="36" fill="#c4a35a">AWAITING FACE</text>
</svg>`;
}

function writeWav(filePath, seconds, sampleRate, generator) {
  const samples = Math.floor(seconds * sampleRate);
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let brown = 0;
  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    brown += (Math.random() * 2 - 1) * 0.02;
    brown *= 0.98;
    const value = Math.max(-1, Math.min(1, generator(t, brown)));
    buffer.writeInt16LE(Math.floor(value * 32767), 44 + i * 2);
  }
  writeFileSync(filePath, buffer);
}

async function raster(svg, filePath, width, height, format) {
  ensureDir(path.dirname(filePath));
  const image = sharp(Buffer.from(svg)).resize(width, height);
  if (format === "png") {
    await image.png({ compressionLevel: 8 }).toFile(filePath);
  } else {
    await image.jpeg({ quality: 86 }).toFile(filePath);
  }
}

async function main() {
  for (const card of CARDS) {
    await raster(
      frontSvg(card),
      path.join(ROOT, "public/cards", card.id, "front.jpg"),
      1024,
      1536,
      "jpg",
    );
  }

  await raster(backSvg(), path.join(ROOT, "public/cards/shared/back.png"), 971, 1619, "png");
  await raster(missingSvg(), path.join(ROOT, "public/cards/shared/missing.jpg"), 900, 1500, "jpg");
  await raster(woodSvg(), path.join(ROOT, "public/textures/table-wood.jpg"), 2048, 2048, "jpg");

  for (const scene of ["street", "shop", "corridor", "table"]) {
    await raster(sceneSvg(scene), path.join(ROOT, "public/scenes", `${scene}.jpg`), 1920, 1080, "jpg");
  }

  const audioDir = path.join(ROOT, "public/audio");
  ensureDir(path.join(audioDir, "beds"));
  ensureDir(path.join(audioDir, "sfx"));

  writeWav(path.join(audioDir, "beds/street.wav"), 6, 22050, (t, brown) => {
    return Math.sin(2 * Math.PI * 72 * t) * 0.04 + brown * 0.35 + Math.sin(2 * Math.PI * 146 * t) * 0.015;
  });
  writeWav(path.join(audioDir, "beds/shop.wav"), 6, 22050, (t, brown) => {
    const tick = Math.sin(2 * Math.PI * 4.2 * t) > 0.92 ? 0.05 : 0;
    return Math.sin(2 * Math.PI * 88 * t) * 0.035 + Math.sin(2 * Math.PI * 132 * t) * 0.02 + brown * 0.18 + tick;
  });
  writeWav(path.join(audioDir, "beds/corridor.wav"), 6, 22050, (t, brown) => {
    return Math.sin(2 * Math.PI * 58 * t) * 0.05 + Math.sin(2 * Math.PI * 61.5 * t) * 0.03 + brown * 0.12;
  });
  writeWav(path.join(audioDir, "beds/table.wav"), 8, 22050, (t, brown) => {
    const crackle = Math.random() > 0.995 ? (Math.random() - 0.5) * 0.08 : 0;
    return (
      Math.sin(2 * Math.PI * 55 * t) * 0.045 +
      Math.sin(2 * Math.PI * 82.5 * t) * 0.03 +
      brown * 0.16 +
      crackle
    );
  });
  writeWav(path.join(audioDir, "sfx/hover.wav"), 0.45, 22050, (t, brown) => {
    const env = Math.sin(Math.PI * (t / 0.45));
    return (brown * 0.8 + Math.sin(2 * Math.PI * 420 * t) * 0.08) * env * 0.35;
  });
  writeWav(path.join(audioDir, "sfx/select.wav"), 0.55, 22050, (t) => {
    const env = Math.exp(-t * 6);
    return (Math.sin(2 * Math.PI * 180 * t) + Math.sin(2 * Math.PI * 540 * t) * 0.4) * env * 0.22;
  });
  writeWav(path.join(audioDir, "sfx/whisper.wav"), 0.8, 22050, (t, brown) => {
    const env = Math.sin(Math.PI * (t / 0.8));
    return brown * env * 0.45;
  });
  writeWav(path.join(audioDir, "sfx/continue.wav"), 0.3, 22050, (t) => {
    const env = Math.exp(-t * 8);
    return Math.sin(2 * Math.PI * 220 * t) * env * 0.16;
  });

  console.log("Generated placeholder cards, scenes, textures, and audio beds.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
