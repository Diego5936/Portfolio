import { useEffect, useRef, useState } from "react";

export const ABOUT_GRID_SECTION_IDS = {
  myPath: "about-my-path",
  interests: "about-interests",
} as const;

function resolveActivePhotoSet() {
  const interests = document.getElementById(ABOUT_GRID_SECTION_IDS.interests);
  const myPath = document.getElementById(ABOUT_GRID_SECTION_IDS.myPath);
  const trigger = window.scrollY + window.innerHeight * 0.38;

  if (interests && interests.offsetTop <= trigger) {
    return 2;
  }

  if (myPath && myPath.offsetTop <= trigger) {
    return 1;
  }

  return 0;
}

export function useAboutGridPhotoSet() {
  const [activeSet, setActiveSet] = useState(0);

  useEffect(() => {
    const update = () => {
      setActiveSet(resolveActivePhotoSet());
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return activeSet;
}

/** Keep in sync with `--portfolio-grid-photo-crossfade-duration` in portfolio-theme.css */
export const GRID_PHOTO_CROSSFADE_CSS_VAR =
  "--portfolio-grid-photo-crossfade-duration";
export const GRID_PHOTO_CROSSFADE_FALLBACK_MS = 2000;

export function readCrossfadeDurationMs(
  fallback = GRID_PHOTO_CROSSFADE_FALLBACK_MS,
) {
  if (typeof document === "undefined") {
    return fallback;
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(GRID_PHOTO_CROSSFADE_CSS_VAR)
    .trim();

  if (!raw) {
    return fallback;
  }

  if (raw.endsWith("ms")) {
    return parseFloat(raw);
  }

  if (raw.endsWith("s")) {
    return parseFloat(raw) * 1000;
  }

  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function usePhotoSetCrossfade(activeSet: number) {
  const [committedSet, setCommittedSet] = useState(activeSet);
  const [incomingSet, setIncomingSet] = useState<number | null>(null);
  const committedRef = useRef(activeSet);

  useEffect(() => {
    if (activeSet === committedRef.current) {
      return;
    }

    const durationMs = readCrossfadeDurationMs();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      committedRef.current = activeSet;
      setCommittedSet(activeSet);
      setIncomingSet(null);
      return;
    }

    setIncomingSet(activeSet);

    const endTimer = window.setTimeout(() => {
      committedRef.current = activeSet;
      setCommittedSet(activeSet);
      setIncomingSet(null);
    }, durationMs);

    return () => {
      window.clearTimeout(endTimer);
    };
  }, [activeSet]);

  return { committedSet, incomingSet };
}
