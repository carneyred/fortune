"use client";

import { useEffect, useRef } from "react";

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

type VanishFxProps = {
  active: boolean;
  effect: VanishEffect;
  onComplete: () => void;
};

export function VanishFx({ active, effect, onComplete }: VanishFxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active) return;

    if (reduced || effect === "fade-grain") {
      const timer = window.setTimeout(onComplete, reduced ? 420 : 1400);
      return () => window.clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
        onComplete();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, effect, onComplete, reduced]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
