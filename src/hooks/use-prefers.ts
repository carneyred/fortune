"use client";

import { useSyncExternalStore } from "react";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function subscribeLowPower(onStoreChange: () => void) {
  const connection = (
    navigator as Navigator & { connection?: EventTarget }
  ).connection;
  connection?.addEventListener?.("change", onStoreChange);
  return () => connection?.removeEventListener?.("change", onStoreChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function useLowPower() {
  return useSyncExternalStore(
    subscribeLowPower,
    () => {
      const cores = navigator.hardwareConcurrency ?? 8;
      const saveData = Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData,
      );
      return cores <= 4 || saveData;
    },
    () => false,
  );
}
