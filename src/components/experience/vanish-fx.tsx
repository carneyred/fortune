"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers";
import type { VanishEffect } from "@/lib/content/types";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

type AshParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  activateAt: number;
  seed: number;
  r: number;
  g: number;
  b: number;
};

// Fractions of the card size the ash canvas extends beyond it; must match the
// inset style on the ash canvas so particle origins line up with the card art.
const ASH_PAD_X = 1.2;
const ASH_PAD_TOP = 0.7;
const ASH_PAD_BOTTOM = 0.3;

type VanishFxProps = {
  active: boolean;
  effect: VanishEffect;
  imageSrc?: string;
  onComplete: () => void;
};

export function VanishFx({ active, effect, imageSrc, onComplete }: VanishFxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  // Keep the latest callback out of the effect deps so a parent re-render
  // (inline handler identity) cannot restart a running vanish animation.
  const onCompleteRef = useRef(onComplete);
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!active) return;

    if (reduced || effect === "fade-grain") {
      const timer = window.setTimeout(
        () => onCompleteRef.current(),
        reduced ? 420 : 1400,
      );
      return () => window.clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (effect === "ash") {
      const host = canvas.parentElement;
      if (!host) return;
      let cancelled = false;
      let frame = 0;
      let done = false;
      let begun = false;

      const begin = (img: HTMLImageElement | null) => {
        if (cancelled || begun) return;
        begun = true;
        const cardW = host.clientWidth;
        const cardH = host.clientHeight;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const originX = ASH_PAD_X * cardW;
        const originY = ASH_PAD_TOP * cardH;

        const cell = Math.max(4, Math.round(cardW / 26));
        const cols = Math.ceil(cardW / cell);
        const rows = Math.ceil(cardH / cell);

        // Snapshot the letterboxed card art so particles carry its colors.
        const snap = document.createElement("canvas");
        snap.width = cols * cell;
        snap.height = rows * cell;
        const sctx = snap.getContext("2d");
        if (!sctx) return;
        sctx.fillStyle = "#140e08";
        sctx.fillRect(0, 0, snap.width, snap.height);
        if (img && img.naturalWidth > 0) {
          const scale = Math.min(
            snap.width / img.naturalWidth,
            snap.height / img.naturalHeight,
          );
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          sctx.drawImage(img, (snap.width - dw) / 2, (snap.height - dh) / 2, dw, dh);
        }
        const pixels = sctx.getImageData(0, 0, snap.width, snap.height).data;

        // Average each cell so thin gold filigree still tints its ash flake.
        const cellColor = (cx: number, cy: number) => {
          let r = 0;
          let g = 0;
          let b = 0;
          let n = 0;
          for (let y = cy * cell; y < Math.min((cy + 1) * cell, snap.height); y += 2) {
            for (let x = cx * cell; x < Math.min((cx + 1) * cell, snap.width); x += 2) {
              const idx = (y * snap.width + x) * 4;
              r += pixels[idx];
              g += pixels[idx + 1];
              b += pixels[idx + 2];
              n += 1;
            }
          }
          if (!n) return [26, 19, 12];
          // Lift the averages a touch so dark art still reads against the black scene.
          return [
            Math.min(255, (r / n) * 1.25 + 10),
            Math.min(255, (g / n) * 1.25 + 10),
            Math.min(255, (b / n) * 1.25 + 10),
          ];
        };

        const started = performance.now();
        const particles: AshParticle[] = [];
        for (let cy = 0; cy < rows; cy += 1) {
          for (let cx = 0; cx < cols; cx += 1) {
            const ember = Math.random() < 0.08;
            const [r, g, b] = ember ? [212, 168, 92] : cellColor(cx, cy);
            particles.push({
              x: originX + cx * cell,
              y: originY + cy * cell,
              vx: 1.2 + Math.random() * 1.8,
              vy: -(0.25 + Math.random() * 1.1),
              life: 0.85 + Math.random() * 0.3,
              activateAt: started + (cx / cols) * 700 + Math.random() * 320,
              seed: Math.random() * Math.PI * 2,
              r,
              g,
              b,
            });
          }
        }

        // Paint the resting mosaic immediately so the card never blinks out
        // between the DOM art fading and the first animation frame.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
          ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
          ctx.fillRect(p.x, p.y, cell, cell);
        }

        let last = started;
        const tick = (now: number) => {
          if (cancelled) return;
          const k = Math.min(3, (now - last) / 16.7);
          last = now;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          let alive = false;
          for (const p of particles) {
            if (now < p.activateAt) {
              alive = true;
              ctx.globalAlpha = 1;
              ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
              ctx.fillRect(p.x, p.y, cell, cell);
              continue;
            }
            if (p.life <= 0) continue;
            alive = true;
            p.vx += (0.022 + 0.028 * Math.abs(Math.sin(p.seed))) * k;
            p.vy -= 0.01 * k;
            p.x += p.vx * k + Math.sin(now * 0.0035 + p.seed) * 0.6 * k;
            p.y += p.vy * k + Math.cos(now * 0.0045 + p.seed * 1.7) * 0.65 * k;
            p.life -= 0.016 * k;
            const fade = Math.max(0, Math.min(1, p.life));
            // Grey out quickly once airborne so dark flakes still read over the black scene.
            const m = Math.min(0.78, (1 - fade) * 1.7);
            ctx.globalAlpha = fade * 0.8;
            ctx.fillStyle = `rgb(${Math.round(p.r + (172 - p.r) * m)}, ${Math.round(
              p.g + (162 - p.g) * m,
            )}, ${Math.round(p.b + (148 - p.b) * m)})`;
            const s = cell * (0.4 + 0.6 * fade);
            ctx.fillRect(p.x, p.y, s, s);
          }
          ctx.globalAlpha = 1;

          if (!alive || now - started > 2400) {
            if (!done) {
              done = true;
              onCompleteRef.current();
            }
            return;
          }
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      };

      // The card already renders this art in an <img>; reuse its decoded
      // bitmap instead of re-decoding the large file from scratch.
      const domImg = host.querySelector("img");
      if (domImg && domImg.complete && domImg.naturalWidth > 0) {
        begin(domImg);
      } else if (imageSrc) {
        const img = new Image();
        img.onload = () => begin(img);
        img.onerror = () => begin(null);
        img.src = imageSrc;
        if (img.complete && img.naturalWidth > 0) begin(img);
      } else {
        begin(null);
      }
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();

    const particles: Particle[] = [];
    const count = effect === "dust" ? 90 : 70;
    for (let i = 0; i < count; i += 1) {
      const ember = effect === "embers" || effect === "flash-fire";
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (effect === "dust" ? 0.4 : 1.1),
        vy: effect === "dust" ? -0.25 - Math.random() * 0.7 : -0.6 - Math.random() * 1.4,
        life: 1,
        max: 0.8 + Math.random() * 0.8,
        size: ember ? 1.5 + Math.random() * 2.8 : 1 + Math.random() * 2,
        color: ember
          ? Math.random() > 0.5
            ? "#e67e22"
            : "#c0392b"
          : "#c4b7a0",
      });
    }

    const started = performance.now();
    const duration = effect === "flash-fire" ? 1100 : 1800;
    let frame = 0;
    let done = false;

    const tick = (now: number) => {
      const t = (now - started) / duration;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (effect === "flash-fire" && t < 0.18) {
        ctx.fillStyle = `rgba(255, 210, 140, ${1 - t / 0.18})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (effect === "embers") {
        const burn = Math.min(1, t * 1.15);
        ctx.fillStyle = `rgba(20, 10, 6, ${burn * 0.55})`;
        ctx.fillRect(0, canvas.height * (1 - burn), canvas.width, canvas.height * burn);
      }

      for (const particle of particles) {
        particle.x += particle.vx * 4;
        particle.y += particle.vy * 4;
        particle.life -= 0.012;
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      }
      ctx.globalAlpha = 1;

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else if (!done) {
        done = true;
        onCompleteRef.current();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, effect, imageSrc, reduced]);

  if (!active) return null;

  if (effect === "ash") {
    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{
          // Canvas is a replaced element: left+right would not stretch it,
          // so its size must be set explicitly.
          left: `-${ASH_PAD_X * 100}%`,
          top: `-${ASH_PAD_TOP * 100}%`,
          width: `${(1 + 2 * ASH_PAD_X) * 100}%`,
          height: `${(1 + ASH_PAD_TOP + ASH_PAD_BOTTOM) * 100}%`,
        }}
        aria-hidden
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
